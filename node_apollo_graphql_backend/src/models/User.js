'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * User Schema
 * Fields:
 * - email: String (required, unique)
 * - name: String (required)
 * - passwordHash: String (required)
 * - roles: [String] (default [])
 * - companyId: ObjectId (required) ref Company
 * - status: 'active' | 'invited' | 'disabled' (default 'active')
 * Indexes:
 * - Unique email per tenant: compound unique index (companyId, email)
 */
const UserSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: [{ type: String }],
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'invited', 'disabled'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure email uniqueness within a company (tenant)
UserSchema.index({ companyId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
