const Reminder = require('../models/Reminder');
const Application = require('../models/Application');

// @desc    Get reminders for current user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };

    if (status === 'pending') {
      query.completed = false;
    } else if (status === 'completed') {
      query.completed = true;
    }

    const reminders = await Reminder.find(query)
      .populate('applicationId', 'companyName jobTitle status')
      .sort({ completed: 1, reminderDate: 1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
  try {
    const { applicationId, title, description, reminderDate } = req.body;

    if (!title || !reminderDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and reminder date are required'
      });
    }

    let companyName = '';
    let jobTitle = '';

    if (applicationId) {
      const application = await Application.findOne({
        _id: applicationId,
        user: req.user.id
      });
      if (application) {
        companyName = application.companyName;
        jobTitle = application.jobTitle;
      }
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      applicationId: applicationId || undefined,
      companyName,
      jobTitle,
      title: title.trim(),
      description: description ? description.trim() : '',
      reminderDate: new Date(reminderDate),
      completed: false
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reminder (toggle completed or edit details)
// @route   PATCH /api/reminders/:id
// @access  Private
const updateReminder = async (req, res, next) => {
  try {
    let reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    if (req.body.completed !== undefined) {
      reminder.completed = req.body.completed;
      reminder.completedAt = req.body.completed ? new Date() : null;
    }

    if (req.body.title) reminder.title = req.body.title.trim();
    if (req.body.description !== undefined) reminder.description = req.body.description.trim();
    if (req.body.reminderDate) reminder.reminderDate = new Date(req.body.reminderDate);

    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await Reminder.deleteOne({ _id: reminder._id });

    res.json({
      success: true,
      message: 'Reminder deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
};
