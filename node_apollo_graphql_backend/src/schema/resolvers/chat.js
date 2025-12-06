'use strict';

const { requireRole } = require('../../auth/rbac');
const { Types } = require('mongoose');

function encodeCursor(date) {
  return Buffer.from(String(date.getTime())).toString('base64');
}
function decodeCursor(cursor) {
  if (!cursor) return null;
  const n = Number(Buffer.from(cursor, 'base64').toString('utf8'));
  return Number.isNaN(n) ? null : new Date(n);
}

module.exports = {
  query: (models) => ({
    chatThreads: async (_p, { projectId }, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { ChatThread, Project } = models;
      const project = await Project.findOne({ _id: projectId, companyId: ctx.user.companyId }).lean();
      if (!project) throw new Error('Project not found');
      return (await ChatThread.find({ companyId: ctx.user.companyId, projectId }).sort({ createdAt: 1 }).lean()).map((t) => ({
        id: t._id.toString(),
        projectId: t.projectId.toString(),
        companyId: t.companyId.toString(),
        title: t.title,
        createdBy: t.createdBy.toString(),
        archived: !!t.archived,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    },
    messages: async (_p, { threadId, first = 20, after }, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { Message, ChatThread } = models;
      const thread = await ChatThread.findOne({ _id: threadId, companyId: ctx.user.companyId }).lean();
      if (!thread) throw new Error('Thread not found');

      const filter = { companyId: ctx.user.companyId, threadId };
      if (after) {
        const afterDate = decodeCursor(after);
        if (afterDate) {
          filter.createdAt = { $gt: afterDate };
        }
      }
      const docs = await Message.find(filter).sort({ createdAt: 1 }).limit(Math.max(1, Math.min(100, first))).lean();
      const edges = docs.map((m) => ({
        node: {
          id: m._id.toString(),
          threadId: m.threadId.toString(),
          companyId: m.companyId.toString(),
          senderId: m.senderId.toString(),
          content: m.content,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        },
        cursor: encodeCursor(m.createdAt),
      }));
      const endCursor = edges.length ? edges[edges.length - 1].cursor : null;

      // determine if there's a next page
      let hasNextPage = false;
      if (endCursor) {
        const endDate = decodeCursor(endCursor);
        const nextCount = await Message.countDocuments({
          companyId: ctx.user.companyId,
          threadId,
          createdAt: { $gt: endDate },
        });
        hasNextPage = nextCount > 0;
      }
      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
      };
    },
  }),
  mutation: (models, pubsub, topics) => ({
    createThread: async (_p, { projectId, title }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { ChatThread, Project } = models;
      const project = await Project.findOne({ _id: projectId, companyId: ctx.user.companyId }).lean();
      if (!project) throw new Error('Project not found');

      const thread = await ChatThread.create({
        companyId: ctx.user.companyId,
        projectId,
        title,
        createdBy: ctx.user.userId,
        archived: false,
      });

      const payload = {
        id: thread._id.toString(),
        projectId: thread.projectId.toString(),
        companyId: thread.companyId.toString(),
        title: thread.title,
        createdBy: thread.createdBy.toString(),
        archived: !!thread.archived,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      };
      await pubsub.publish(topics.THREAD_CREATED, { threadCreated: payload });
      return payload;
    },
    postMessage: async (_p, { threadId, content }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { Message, ChatThread } = models;
      const thread = await ChatThread.findOne({ _id: threadId, companyId: ctx.user.companyId }).lean();
      if (!thread) throw new Error('Thread not found');

      const msg = await Message.create({
        companyId: ctx.user.companyId,
        threadId,
        senderId: ctx.user.userId,
        content,
      });

      const payload = {
        id: msg._id.toString(),
        threadId: msg.threadId.toString(),
        companyId: msg.companyId.toString(),
        senderId: msg.senderId.toString(),
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      };
      await pubsub.publish(topics.MESSAGE_ADDED, { messageAdded: payload });
      return payload;
    },
  }),
};
