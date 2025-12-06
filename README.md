# collaboratepro-platform-287208-287218

## Backend configuration (node_apollo_graphql_backend)

Create a .env file inside collaboratepro-platform-287208-287218/node_apollo_graphql_backend with the following keys:

- PORT=3001
- CORS_ORIGIN=http://localhost:3000
- JWT_SECRET=please-generate-a-secure-random-secret
- MONGODB_URL=mongodb+srv://cyberhash4_db_user:cyberhash@123@cluster0.vjabynw.mongodb.net/?appName=Cluster0

Notes:
- Do not hardcode secrets in code. The backend already loads environment variables via dotenv (src/server.js) and reads:
  - MongoDB URI from process.env.MONGODB_URL with a fallback to db_connection.txt (src/db/connection.js), then to a local default.
  - CORS origin from process.env.CORS_ORIGIN (src/graphqlServer.js).
  - JWT secret from process.env.JWT_SECRET (src/auth/jwt.js).
- For production, replace JWT_SECRET with a secure random value. Example: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
- If MONGODB_URL is not set, the backend attempts to read the first non-comment line in ../collaboratepro-platform-287208-287217/mongodb_atlas_database/db_connection.txt (supports lines like "mongosh <uri>").