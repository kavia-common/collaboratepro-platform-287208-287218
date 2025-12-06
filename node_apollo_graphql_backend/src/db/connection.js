'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

/**
 * Resolve MongoDB connection URI using the following precedence (do not change behavior):
 * 1) process.env.MONGODB_URL (if defined and non-empty)
 * 2) First non-empty, non-comment line from the database container's db_connection.txt.
 *    - Expected path (relative to this backend file):
 *      <repo-root>/collaboratepro-platform-287208-287217/mongodb_atlas_database/db_connection.txt
 *    - The file may contain either:
 *        a) a bare mongodb URI (e.g., "mongodb+srv://..."), or
 *        b) a line starting with "mongosh " followed by the mongodb URI (e.g., "mongosh mongodb+srv://...")
 *      In case (b), we extract the first token that starts with "mongodb".
 * 3) Fallback to local default: mongodb://127.0.0.1:27017/collaboratepro
 *
 * Notes:
 * - This preserves existing behavior and simply clarifies the path math and precedence.
 */
function resolveMongoUri() {
  // 1) Env
  if (process.env.MONGODB_URL && process.env.MONGODB_URL.trim()) {
    return process.env.MONGODB_URL.trim();
  }

  // 2) db_connection.txt relative to the backend root:
  // Backend root: <repo-root>/collaboratepro-platform-287208-287218/node_apollo_graphql_backend
  // We navigate up to: <repo-root>/collaboratepro-platform-287208-287218
  // Then up again to: <repo-root>
  // Then into sibling db container folder: collaboratepro-platform-287208-287217/mongodb_atlas_database/db_connection.txt
  const backendRoot = path.join(__dirname, '..', '..');
  const repoRoot = path.join(backendRoot, '..'); // -> <repo-root>/collaboratepro-platform-287208-287218
  const dbConnPath = path.join(
    repoRoot,
    '..', // -> <repo-root>
    'collaboratepro-platform-287208-287217',
    'mongodb_atlas_database',
    'db_connection.txt'
  );

  try {
    if (fs.existsSync(dbConnPath)) {
      const content = fs.readFileSync(dbConnPath, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));

      if (lines.length > 0) {
        const first = lines[0];
        // Support "mongosh <uri>" or direct "mongodb+srv://..."
        if (first.startsWith('mongosh')) {
          const parts = first.split(/\s+/);
          const potential = parts.find((p) => p.startsWith('mongodb'));
          if (potential) return potential;
        }
        if (first.startsWith('mongodb')) {
          return first;
        }
      }
    }
  } catch (err) {
    // Ignore and continue to fallback
    console.warn('[DB] Unable to read db_connection.txt:', err.message);
  }

  // 3) Fallback local
  return 'mongodb://127.0.0.1:27017/collaboratepro';
}

let isConnected = false;
let connectPromise = null;

// PUBLIC_INTERFACE
async function connectDB() {
  /**
   * Connect to MongoDB using Mongoose with strictQuery enabled.
   * Initializes the connection once and returns the existing connection on subsequent calls.
   */
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectPromise) {
    return connectPromise;
  }

  mongoose.set('strictQuery', true);

  const uri = resolveMongoUri();

  connectPromise = mongoose
    .connect(uri, {
      // connection options can be added if needed
      autoIndex: false, // prefer explicit index creation via script
    })
    .then((conn) => {
      isConnected = true;
      console.log('[DB] Connected to MongoDB');
      return conn;
    })
    .catch((err) => {
      connectPromise = null;
      isConnected = false;
      console.error('[DB] MongoDB connection error:', err.message);
      throw err;
    });

  // Connection events for logging and graceful handling
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('[DB] Mongoose connected');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('[DB] Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[DB] Mongoose disconnected');
  });

  return connectPromise;
}

module.exports = {
  // PUBLIC_INTERFACE
  connectDB,
  // PUBLIC_INTERFACE
  resolveMongoUri,
};
