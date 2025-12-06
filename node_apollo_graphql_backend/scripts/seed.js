'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

(async () => {
  // Load dotenv if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }

  const { connectDB } = require('../src/db/connection');
  const Company = require('../src/models/Company');
  const User = require('../src/models/User');
  const Membership = require('../src/models/Membership');
  const Project = require('../src/models/Project');
  const Event = require('../src/models/Event');
  const ChatThread = require('../src/models/ChatThread');
  const Message = require('../src/models/Message');

  try {
    await connectDB();

    // Clean minimal for deterministic seed in dev (not dropping DB)
    // Only insert if not existing by unique keys we define
    const companyName = 'Acme Corp';
    let company = await Company.findOne({ name: companyName }).lean();
    if (!company) {
      company = await Company.create({
        name: companyName,
        domain: 'acme.example',
        plan: 'pro',
      });
    }

    const companyId = company._id;

    // Users
    const adminEmail = 'admin@acme.example';
    const memberEmail = 'member@acme.example';
    const adminPasswordHash = bcrypt.hashSync('AdminPassword123!', 10);
    const memberPasswordHash = bcrypt.hashSync('MemberPassword123!', 10);

    let adminUser = await User.findOne({ companyId, email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        email: adminEmail,
        name: 'Acme Admin',
        passwordHash: adminPasswordHash,
        roles: ['admin'],
        companyId,
        status: 'active',
      });
    }

    let memberUser = await User.findOne({ companyId, email: memberEmail });
    if (!memberUser) {
      memberUser = await User.create({
        email: memberEmail,
        name: 'Acme Member',
        passwordHash: memberPasswordHash,
        roles: ['member'],
        companyId,
        status: 'active',
      });
    }

    // Memberships
    const ensureMembership = async (userId, roles) => {
      let mem = await Membership.findOne({ companyId, userId });
      if (!mem) {
        mem = await Membership.create({ userId, companyId, roles });
      }
      return mem;
    };

    const adminMembership = await ensureMembership(adminUser._id, ['admin']);
    const memberMembership = await ensureMembership(memberUser._id, ['member']);

    // Project
    let project = await Project.findOne({ companyId, title: 'Launch Project' });
    if (!project) {
      project = await Project.create({
        companyId,
        title: 'Launch Project',
        status: 'active',
        createdBy: adminUser._id,
        description: 'Initial launch project for Acme Corp.',
      });
    }

    // Event
    let event = await Event.findOne({ companyId, projectId: project._id, title: 'Kickoff Meeting' });
    if (!event) {
      event = await Event.create({
        companyId,
        projectId: project._id,
        title: 'Kickoff Meeting',
        startAt: new Date('2024-01-01T10:00:00Z'),
        endAt: new Date('2024-01-01T11:00:00Z'),
        description: 'Project kickoff with stakeholders.',
        createdBy: adminUser._id,
      });
    }

    // ChatThread
    let thread = await ChatThread.findOne({ companyId, projectId: project._id, title: 'General Discussion' });
    if (!thread) {
      thread = await ChatThread.create({
        companyId,
        projectId: project._id,
        title: 'General Discussion',
        createdBy: adminUser._id,
        archived: false,
      });
    }

    // Messages (deterministic content)
    const messages = [
      { senderId: adminUser._id, content: 'Welcome to the project!' },
      { senderId: memberUser._id, content: 'Glad to be part of this.' },
      { senderId: adminUser._id, content: 'Let’s get started with the kickoff.' },
    ];

    for (const msg of messages) {
      const exists = await Message.findOne({
        companyId,
        threadId: thread._id,
        senderId: msg.senderId,
        content: msg.content,
      }).lean();

      if (!exists) {
        await Message.create({
          companyId,
          threadId: thread._id,
          senderId: msg.senderId,
          content: msg.content,
        });
      }
    }

    // Logs
    console.log('Seed completed:');
    console.log('Company ID:', companyId.toString());
    console.log('Admin User ID:', adminUser._id.toString());
    console.log('Member User ID:', memberUser._id.toString());
    console.log('Project ID:', project._id.toString());
    console.log('Event ID:', event._id.toString());
    console.log('ChatThread ID:', thread._id.toString());
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    // Do not force close; let Mongoose finish pending ops
    setTimeout(() => process.exit(), 100);
  }
})();
