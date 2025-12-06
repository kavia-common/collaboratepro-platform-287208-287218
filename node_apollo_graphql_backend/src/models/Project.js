'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Project Schema
 * Fields:
 * - companyId: ObjectId (required) ref Company
 * - title: String (required)
 * - status: 'active' | 'archived' | 'planned' (default 'active')
 * - createdBy: ObjectId (required) ref User
 * - description: String (optional)
 * Indexes:
 * - (companyId, _id)
 * - (companyId, createdBy)
 * - (companyId, status)
 */
const ProjectSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'planned'],
      default: 'active',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ companyId: 1, _id: 1 });
ProjectSchema.index({ companyId: 1, createdBy: 1 });
ProjectSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
