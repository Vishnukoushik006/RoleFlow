const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    companyName: {
      type: String,
      default: ''
    },
    jobTitle: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder date is required'],
      index: true
    },
    completed: {
      type: Boolean,
      default: false,
      index: true
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

reminderSchema.index({ user: 1, reminderDate: 1, completed: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
