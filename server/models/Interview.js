const mongoose = require('mongoose');
const { INTERVIEW_TYPES, INTERVIEW_STATUSES } = require('../config/constants');

const interviewSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    round: {
      type: String,
      required: [true, 'Interview round name is required (e.g., Technical Round 1)'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Interview date is required'],
      index: true
    },
    time: {
      type: String,
      default: '10:00 AM'
    },
    type: {
      type: String,
      enum: INTERVIEW_TYPES,
      default: 'Technical Screening'
    },
    meetingUrl: {
      type: String,
      trim: true,
      default: ''
    },
    interviewer: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    topics: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: INTERVIEW_STATUSES,
      default: 'Scheduled',
      index: true
    }
  },
  {
    timestamps: true
  }
);

interviewSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
