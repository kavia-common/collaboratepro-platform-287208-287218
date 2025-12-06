'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AuditLog Schema
 * Fields:
 * - companyId: ObjectId (required) ref Company
 * - actorId: ObjectId (required) ref User
 * - action: String (required)
 * - entityType: String (required)
 * - entityId: ObjectId (optional) ref to varied collection
 * - meta: Mixed (optional)
 * Indexes:
 * - (companyId, createdAt)
 */
const AuditLogSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ companyId: 1, createdAt: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
