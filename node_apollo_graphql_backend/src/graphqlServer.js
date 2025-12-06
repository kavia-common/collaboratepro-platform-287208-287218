'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer } = require('apollo-server-express');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws');

const typeDefs = require('./schema/typeDefs');
const { buildResolvers } = require('./schema/resolvers');
const { extractBearerToken, verifyToken } = require('./auth/jwt');
const { connectDB } = require('./db/connection');
const models = {
  Company: require('./models/Company'),
  User: require('./models/User'),
  Membership: require('./models/Membership'),
  Project: require('./models/Project'),
  Event: require('./models/Event'),
  ChatThread: require('./models/ChatThread'),
  Message: require('./models/Message'),
};

async function buildApp() {
  await connectDB();

  const app = express();
  app.set('trust proxy', true);

  const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Attach REST routes (health, auth, ai)
  const routes = require('./routes');
  app.use('/', routes);

  // Schema and resolvers
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: buildResolvers(models),
  });

  // Apollo Server v4 with express
  const apolloServer = new ApolloServer({
    schema,
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    context: async ({ req }) => {
      // HTTP context
      let user = null;
      try {
        const token = extractBearerToken(req.headers.authorization);
        if (token) {
          const decoded = verifyToken(token);
          user = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            roles: decoded.roles || [],
          };
        }
      } catch (_e) {
        // invalid token -> user remains null
      }
      return {
        user,
        models,
        req,
      };
    },
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql', cors: false });

  // HTTP server
  const server = http.createServer(app);

  // WS server on same path /graphql
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql',
  });

  // GraphQL-WS useServer
  useServer(
    {
      schema,
      context: async (ctx /*, msg, args*/) => {
        // WS context: parse JWT from connectionParams.Authorization
        let user = null;
        try {
          const authHeader = ctx.connectionParams?.Authorization || ctx.connectionParams?.authorization;
          const token = extractBearerToken(authHeader);
          if (token) {
            const decoded = verifyToken(token);
            user = {
              userId: decoded.userId,
              companyId: decoded.companyId,
              roles: decoded.roles || [],
            };
          }
        } catch (_e) {
          // ignore
        }
        return { user, models };
      },
    },
    wsServer
  );

  return { app, server, apolloServer, wsServer };
}

module.exports = { buildApp };
