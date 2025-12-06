'use strict';

const { withFilter, PubSub } = require('graphql-subscriptions');
const DateTime = require('../scalars/DateTime');
const projectResolvers = require('./project');
const eventResolvers = require('./event');
const chatResolvers = require('./chat');

const pubsub = new PubSub();

const THREAD_CREATED = 'THREAD_CREATED';
const MESSAGE_ADDED = 'MESSAGE_ADDED';

// PUBLIC_INTERFACE
function buildResolvers(models) {
  /**
   * Merge resolvers for queries, mutations, and subscriptions.
   * Enforces tenant scoping via context.user in each resolver file.
   */
  return {
    DateTime,
    Query: {
      ...projectResolvers.query(models),
      ...eventResolvers.query(models),
      ...chatResolvers.query(models),
      me: async (_p, _a, ctx) => {
        if (!ctx.user) return null;
        const { User } = models;
        const u = await User.findOne({ _id: ctx.user.userId, companyId: ctx.user.companyId }).lean();
        if (!u) return null;
        return {
          id: u._id.toString(),
          email: u.email,
          name: u.name,
          roles: u.roles || [],
          companyId: u.companyId.toString(),
          status: u.status,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      },
    },
    Mutation: {
      ...projectResolvers.mutation(models, pubsub, { THREAD_CREATED, MESSAGE_ADDED }),
      ...eventResolvers.mutation(models, pubsub, { THREAD_CREATED, MESSAGE_ADDED }),
      ...chatResolvers.mutation(models, pubsub, { THREAD_CREATED, MESSAGE_ADDED }),
    },
    Subscription: {
      threadCreated: {
        subscribe: withFilter(
          () => pubsub.asyncIterator([THREAD_CREATED]),
          (payload, variables, context) => {
            // tenant and project scope
            return (
              payload.threadCreated.companyId.toString() === context.user.companyId &&
              payload.threadCreated.projectId.toString() === variables.projectId
            );
          }
        ),
        resolve: (payload) => payload.threadCreated,
      },
      messageAdded: {
        subscribe: withFilter(
          () => pubsub.asyncIterator([MESSAGE_ADDED]),
          (payload, variables, context) => {
            return (
              payload.messageAdded.companyId.toString() === context.user.companyId &&
              payload.messageAdded.threadId.toString() === variables.threadId
            );
          }
        ),
        resolve: (payload) => payload.messageAdded,
      },
    },
  };
}

module.exports = { buildResolvers, pubsub, THREAD_CREATED, MESSAGE_ADDED };
