'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Membership Schema
 * Fields:
 * - userId: ObjectId (required) ref User
 * - companyId: ObjectId (required) ref Company
 * - roles: [String] (default [])
 * Indexes:
 * - (companyId, userId)
 */
const MembershipSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    roles: [{ type: String }],
  },
  { timestamps: true }
);

MembershipSchema.index({ companyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);
