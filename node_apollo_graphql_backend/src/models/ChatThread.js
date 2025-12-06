'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ChatThread Schema
 * Fields:
 * - companyId: ObjectId (required) ref Company
 * - projectId: ObjectId (required) ref Project
 * - title: String (required)
 * - createdBy: ObjectId (required) ref User
 * - archived: Boolean (default false)
 * Indexes:
 * - (companyId, projectId)
 * - (companyId, archived)
 */
const ChatThreadSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChatThreadSchema.index({ companyId: 1, projectId: 1 });
ChatThreadSchema.index({ companyId: 1, archived: 1 });

module.exports = mongoose.model('ChatThread', ChatThreadSchema);
