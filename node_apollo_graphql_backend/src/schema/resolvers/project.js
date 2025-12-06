'use strict';

const { requireRole } = require('../../auth/rbac');

module.exports = {
  query: (models) => ({
    projects: async (_p, _a, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { Project } = models;
      return (await Project.find({ companyId: ctx.user.companyId }).lean()).map((p) => ({
        id: p._id.toString(),
        title: p.title,
        status: p.status,
        companyId: p.companyId.toString(),
        createdBy: p.createdBy.toString(),
        description: p.description || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    },
    project: async (_p, { id }, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { Project } = models;
      const p = await Project.findOne({ _id: id, companyId: ctx.user.companyId }).lean();
      if (!p) return null;
      return {
        id: p._id.toString(),
        title: p.title,
        status: p.status,
        companyId: p.companyId.toString(),
        createdBy: p.createdBy.toString(),
        description: p.description || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    },
  }),
  mutation: (models, pubsub) => ({
    createProject: async (_p, { title, description }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { Project } = models;
      const doc = await Project.create({
        title,
        description: description || null,
        companyId: ctx.user.companyId,
        createdBy: ctx.user.userId,
        status: 'active',
      });
      return {
        id: doc._id.toString(),
        title: doc.title,
        status: doc.status,
        companyId: doc.companyId.toString(),
        createdBy: doc.createdBy.toString(),
        description: doc.description || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
    updateProject: async (_p, { id, title, description, status }, ctx) => {
      requireRole(['admin', 'member'])(_p, _p, ctx);
      const { Project } = models;
      const update = {};
      if (title !== undefined) update.title = title;
      if (description !== undefined) update.description = description;
      if (status !== undefined) update.status = status;
      const doc = await Project.findOneAndUpdate(
        { _id: id, companyId: ctx.user.companyId },
        { $set: update },
        { new: true }
      ).lean();
      if (!doc) throw new Error('Project not found');
      return {
        id: doc._id.toString(),
        title: doc.title,
        status: doc.status,
        companyId: doc.companyId.toString(),
        createdBy: doc.createdBy.toString(),
        description: doc.description || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
    archiveProject: async (_p, { id }, ctx) => {
      requireRole(['admin'])(_p, _p, ctx);
      const { Project } = models;
      const res = await Project.updateOne(
        { _id: id, companyId: ctx.user.companyId },
        { $set: { status: 'archived' } }
      );
      return res.modifiedCount > 0;
    },
  }),
};
