'use strict';

const { requireRole } = require('../../auth/rbac');

module.exports = {
  query: (models) => ({
    events: async (_p, _a, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { Event } = models;
      return (await Event.find({ companyId: ctx.user.companyId }).lean()).map((e) => ({
        id: e._id.toString(),
        projectId: e.projectId.toString(),
        companyId: e.companyId.toString(),
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        description: e.description || null,
        createdBy: e.createdBy.toString(),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }));
    },
    event: async (_p, { id }, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { Event } = models;
      const e = await Event.findOne({ _id: id, companyId: ctx.user.companyId }).lean();
      if (!e) return null;
      return {
        id: e._id.toString(),
        projectId: e.projectId.toString(),
        companyId: e.companyId.toString(),
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        description: e.description || null,
        createdBy: e.createdBy.toString(),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    },
  }),
  mutation: (models) => ({
    createEvent: async (_p, { projectId, title, startAt, endAt, description }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { Event, Project } = models;

      // Ensure project exists in tenant
      const project = await Project.findOne({ _id: projectId, companyId: ctx.user.companyId }).lean();
      if (!project) throw new Error('Project not found');

      const doc = await Event.create({
        companyId: ctx.user.companyId,
        projectId,
        title,
        startAt,
        endAt: endAt || null,
        description: description || null,
        createdBy: ctx.user.userId,
      });
      return {
        id: doc._id.toString(),
        projectId: doc.projectId.toString(),
        companyId: doc.companyId.toString(),
        title: doc.title,
        startAt: doc.startAt,
        endAt: doc.endAt,
        description: doc.description || null,
        createdBy: doc.createdBy.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
    updateEvent: async (_p, { id, title, startAt, endAt, description }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { Event } = models;
      const update = {};
      if (title !== undefined) update.title = title;
      if (startAt !== undefined) update.startAt = startAt;
      if (endAt !== undefined) update.endAt = endAt;
      if (description !== undefined) update.description = description;
      const e = await Event.findOneAndUpdate(
        { _id: id, companyId: ctx.user.companyId },
        { $set: update },
        { new: true }
      ).lean();
      if (!e) throw new Error('Event not found');
      return {
        id: e._id.toString(),
        projectId: e.projectId.toString(),
        companyId: e.companyId.toString(),
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        description: e.description || null,
        createdBy: e.createdBy.toString(),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    },
  }),
};
