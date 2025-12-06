'use strict';

const fs = require('fs');
const path = require('path');

(async () => {
  // Load dotenv if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }

  const { connectDB } = require('../src/db/connection');

  // Load models
  const Company = require('../src/models/Company');
  const User = require('../src/models/User');
  const Membership = require('../src/models/Membership');
  const Project = require('../src/models/Project');
  const Event = require('../src/models/Event');
  const ChatThread = require('../src/models/ChatThread');
  const Message = require('../src/models/Message');
  const AuditLog = require('../src/models/AuditLog');

  try {
    await connectDB();
    const models = [Company, User, Membership, Project, Event, ChatThread, Message, AuditLog];

    await Promise.all(models.map((m) => m.ensureIndexes()));
    console.log('Index creation ensured for all models.');
  } catch (err) {
    console.error('Error ensuring indexes:', err);
    process.exitCode = 1;
  } finally {
    setTimeout(() => process.exit(), 100);
  }
})();
