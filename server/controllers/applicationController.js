const Application = require('../models/Application');
const ApplicationEvent = require('../models/ApplicationEvent');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const Company = require('../models/Company');
const { getOrCreateCompany } = require('../services/companyService');
const { extractSkillsFromText } = require('../services/resumeParser');

// @desc    Get all applications with search, filtering, and sorting
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      source,
      jobType,
      location,
      resumeUsed,
      favorite,
      sort = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = { user: req.user.id };

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Source filter
    if (source && source !== 'All') {
      query.source = source;
    }

    // Job Type filter
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    // Resume filter
    if (resumeUsed && resumeUsed !== 'All') {
      query.resumeUsed = resumeUsed;
    }

    // Favorite filter
    if (favorite === 'true') {
      query.favorite = true;
    }

    // Search filter across company, title, location, skills, notes
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { companyName: { $regex: term, $options: 'i' } },
        { jobTitle: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } },
        { skills: { $in: [new RegExp(term, 'i')] } }
      ];
    }

    // Sorting
    let sortOption = { appliedDate: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { appliedDate: 1, createdAt: 1 };
    } else if (sort === 'company_asc') {
      sortOption = { companyName: 1 };
    } else if (sort === 'company_desc') {
      sortOption = { companyName: -1 };
    } else if (sort === 'updated_desc') {
      sortOption = { updatedAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('company', 'name website logo domain')
        .populate('resumeUsed', 'name fileUrl filename')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: applications.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID with full relations
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('company')
      .populate('resumeUsed');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Fetch associated timeline events, interviews, and reminders
    const [events, interviews, reminders] = await Promise.all([
      ApplicationEvent.find({ applicationId: application._id }).sort({ date: -1, createdAt: -1 }),
      Interview.find({ applicationId: application._id }).sort({ date: 1 }),
      Reminder.find({ applicationId: application._id }).sort({ reminderDate: 1 })
    ]);

    res.json({
      success: true,
      data: {
        ...application.toObject(),
        events,
        interviews,
        reminders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  try {
    const {
      companyName,
      companyWebsite,
      companyLogo,
      jobTitle,
      location,
      jobUrl,
      source,
      jobType,
      salary,
      appliedDate,
      status,
      resumeUsed,
      notes,
      jobDescription,
      skills,
      tags
    } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title are required'
      });
    }

    // Find or create company
    let companyDoc = null;
    try {
      companyDoc = await getOrCreateCompany({
        name: companyName,
        website: companyWebsite,
        logo: companyLogo
      });
    } catch (err) {
      console.warn('Company resolution note:', err.message);
    }

    // Auto extract skills from JD if not explicitly provided
    let extractedSkills = Array.isArray(skills) && skills.length > 0
      ? skills
      : extractSkillsFromText(jobDescription);

    const application = await Application.create({
      user: req.user.id,
      company: companyDoc ? companyDoc._id : undefined,
      companyName: companyName.trim(),
      companyWebsite: companyWebsite || (companyDoc ? companyDoc.website : ''),
      companyLogo: companyLogo || (companyDoc ? companyDoc.logo : ''),
      jobTitle: jobTitle.trim(),
      location: location || 'Remote',
      jobUrl: jobUrl || '',
      source: source || 'LinkedIn',
      jobType: jobType || 'Full-time',
      salary: salary || '',
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      status: status || 'Applied',
      resumeUsed: resumeUsed || undefined,
      notes: notes || '',
      jobDescription: jobDescription || '',
      skills: extractedSkills,
      tags: Array.isArray(tags) ? tags : []
    });

    // Automatically record "Application Created" event
    await ApplicationEvent.create({
      user: req.user.id,
      applicationId: application._id,
      eventType: 'Application Created',
      description: `Application created for ${application.jobTitle} at ${application.companyName}`,
      date: application.appliedDate || new Date(),
      newStatus: application.status
    });

    // Populate relations for response
    await application.populate('company');
    if (application.resumeUsed) {
      await application.populate('resumeUsed');
    }

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PATCH /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    let application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = application.status;
    const previousCompany = application.companyName;

    // Handle company update if name modified
    if (req.body.companyName && req.body.companyName !== application.companyName) {
      const companyDoc = await getOrCreateCompany({
        name: req.body.companyName,
        website: req.body.companyWebsite || application.companyWebsite
      });
      if (companyDoc) {
        req.body.company = companyDoc._id;
        req.body.companyLogo = companyDoc.logo;
      }
    }

    // Auto extract skills if JD changed and skills not provided
    if (req.body.jobDescription && (!req.body.skills || req.body.skills.length === 0)) {
      req.body.skills = extractSkillsFromText(req.body.jobDescription);
    }

    // Update application fields
    application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('company')
      .populate('resumeUsed');

    // If status changed, create historical timeline event
    if (req.body.status && req.body.status !== previousStatus) {
      let eventType = 'Status Changed';
      if (req.body.status === 'Assessment') eventType = 'Assessment Received';
      if (req.body.status === 'Interview') eventType = 'Interview Scheduled';
      if (req.body.status === 'Offer') eventType = 'Offer Received';
      if (req.body.status === 'Rejected') eventType = 'Rejected';

      await ApplicationEvent.create({
        user: req.user.id,
        applicationId: application._id,
        eventType,
        description: `Status updated from ${previousStatus} to ${req.body.status}`,
        date: new Date(),
        previousStatus,
        newStatus: req.body.status
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application and cascade delete events, interviews, reminders
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
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

    await Promise.all([
      Application.deleteOne({ _id: application._id }),
      ApplicationEvent.deleteMany({ applicationId: application._id }),
      Interview.deleteMany({ applicationId: application._id }),
      Reminder.deleteMany({ applicationId: application._id })
    ]);

    res.json({
      success: true,
      message: 'Application and all associated history removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
