'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Event Schema
 * Fields:
 * - companyId: ObjectId (required) ref Company
 * - projectId: ObjectId (required) ref Project
 * - title: String (required)
 * - startAt: Date (required)
 * - endAt: Date (optional)
 * - description: String (optional)
 * - createdBy: ObjectId (required) ref User
 * Indexes:
 * - (companyId, projectId)
 * - (companyId, startAt)
 */
const EventSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EventSchema.index({ companyId: 1, projectId: 1 });
EventSchema.index({ companyId: 1, startAt: 1 });

module.exports = mongoose.model('Event', EventSchema);
