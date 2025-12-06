'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Message Schema
 * Fields:
 * - companyId: ObjectId (required) ref Company
 * - threadId: ObjectId (required) ref ChatThread
 * - senderId: ObjectId (required) ref User
 * - content: String (required)
 * Indexes:
 * - (companyId, threadId)
 * - (companyId, createdAt) via timestamps
 */
const MessageSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    threadId: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

MessageSchema.index({ companyId: 1, threadId: 1 });
MessageSchema.index({ companyId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
