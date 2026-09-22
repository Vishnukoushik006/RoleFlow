const mongoose = require('mongoose');
const { EVENT_TYPES } = require('../config/constants');

const applicationEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    previousStatus: {
      type: String,
      default: null
    },
    newStatus: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for timeline queries
applicationEventSchema.index({ applicationId: 1, date: -1 });

module.exports = mongoose.model('ApplicationEvent', applicationEventSchema);
