const mongoose = require('mongoose');
const { APPLICATION_STATUSES, APPLICATION_SOURCES, JOB_TYPES } = require('../config/constants');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: ''
    },
    companyLogo: {
      type: String,
      default: ''
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote'
    },
    jobUrl: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: APPLICATION_SOURCES,
      default: 'LinkedIn'
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      default: 'Full-time'
    },
    salary: {
      type: String,
      trim: true,
      default: ''
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Applied',
      index: true
    },
    resumeUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    notes: {
      type: String,
      default: ''
    },
    jobDescription: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    favorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast multi-filtering and search
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, appliedDate: -1 });
applicationSchema.index({ user: 1, companyName: 1 });

module.exports = mongoose.model('Application', applicationSchema);
