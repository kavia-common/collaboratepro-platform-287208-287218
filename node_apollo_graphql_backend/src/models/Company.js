'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Company Schema
 * Fields:
 * - name: String (required)
 * - domain: String (optional)
 * - plan: String (optional)
 * - createdBy: ObjectId (optional, ref User)
 * Notes:
 * - Timestamps enabled
 */
const CompanySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, trim: true },
    plan: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// No tenant index here as Company is the top-level tenant entity
module.exports = mongoose.model('Company', CompanySchema);
