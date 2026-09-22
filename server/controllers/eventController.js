const ApplicationEvent = require('../models/ApplicationEvent');
const Application = require('../models/Application');

// @desc    Get all events for an application
// @route   GET /api/applications/:id/events
// @access  Private
const getEventsByApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const events = await ApplicationEvent.find({ applicationId: req.params.id })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a custom event to an application timeline
// @route   POST /api/applications/:id/events
// @access  Private
const createEvent = async (req, res, next) => {
  try {
    const { eventType, description, date, metadata } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!eventType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Event type and description are required'
      });
    }

    const event = await ApplicationEvent.create({
      user: req.user.id,
      applicationId: application._id,
      eventType,
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Timeline event added',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a timeline event
// @route   DELETE /api/applications/:id/events/:eventId
// @access  Private
const deleteEvent = async (req, res, next) => {
  try {
    const event = await ApplicationEvent.findOne({
      _id: req.params.eventId,
      user: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await ApplicationEvent.deleteOne({ _id: event._id });

    res.json({
      success: true,
      message: 'Event removed from timeline'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventsByApplication,
  createEvent,
  deleteEvent
};
