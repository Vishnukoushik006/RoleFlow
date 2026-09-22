const Interview = require('../models/Interview');
const Application = require('../models/Application');
const ApplicationEvent = require('../models/ApplicationEvent');

// @desc    Get all interviews for current user
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const { status, filter } = req.query;
    const query = { user: req.user.id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (filter === 'upcoming') {
      query.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
      query.status = 'Scheduled';
    } else if (filter === 'past') {
      query.$or = [
        { date: { $lt: new Date() } },
        { status: { $in: ['Completed', 'Cancelled'] } }
      ];
    }

    const interviews = await Interview.find(query)
      .populate('applicationId', 'companyName jobTitle status location jobUrl')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      round,
      date,
      time,
      type,
      meetingUrl,
      interviewer,
      notes,
      topics
    } = req.body;

    if (!applicationId || !round || !date) {
      return res.status(400).json({
        success: false,
        message: 'Application, round name, and date are required'
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Associated application not found'
      });
    }

    const interview = await Interview.create({
      user: req.user.id,
      applicationId: application._id,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      round: round.trim(),
      date: new Date(date),
      time: time || '10:00 AM',
      type: type || 'Technical Screening',
      meetingUrl: meetingUrl || '',
      interviewer: interviewer || '',
      notes: notes || '',
      topics: Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim()) : [])
    });

    // Auto-update application status to Interview if not already Offer or Completed
    if (application.status !== 'Interview' && application.status !== 'Offer') {
      application.status = 'Interview';
      await application.save();
    }

    // Auto-create timeline event
    await ApplicationEvent.create({
      user: req.user.id,
      applicationId: application._id,
      eventType: 'Interview Scheduled',
      description: `${round} scheduled for ${new Date(date).toLocaleDateString()} at ${time || '10:00 AM'}`,
      date: new Date(),
      metadata: { interviewId: interview._id, round, type }
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details or status
// @route   PATCH /api/interviews/:id
// @access  Private
const updateInterview = async (req, res, next) => {
  try {
    let interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const prevStatus = interview.status;

    interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If marked Completed, create timeline event
    if (req.body.status === 'Completed' && prevStatus !== 'Completed') {
      await ApplicationEvent.create({
        user: req.user.id,
        applicationId: interview.applicationId,
        eventType: 'Interview Completed',
        description: `Completed ${interview.round} interview round`,
        date: new Date(),
        metadata: { interviewId: interview._id, round: interview.round }
      });
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    await Interview.deleteOne({ _id: interview._id });

    res.json({
      success: true,
      message: 'Interview deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview
};
