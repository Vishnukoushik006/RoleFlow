const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const { extractSkillsFromText, extractTextFromFile } = require('../services/resumeParser');

// @desc    Get all resumes for the user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // For each resume, count how many applications used it
    const resumesWithUsage = await Promise.all(
      resumes.map(async (resume) => {
        const usageCount = await Application.countDocuments({
          user: req.user.id,
          resumeUsed: resume._id
        });
        return {
          ...resume.toObject(),
          usageCount
        };
      })
    );

    res.json({
      success: true,
      count: resumesWithUsage.length,
      data: resumesWithUsage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new resume file & parse skills
// @route   POST /api/resumes
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid resume file (PDF, DOCX, TXT)'
      });
    }

    const { name, targetRoles, isDefault } = req.body;
    const resumeName = name ? name.trim() : req.file.originalname.replace(/\.[^/.]+$/, '');

    // Extract text and skills from uploaded file
    const extractedText = extractTextFromFile(req.file.path, req.file.mimetype);
    const parsedSkills = extractSkillsFromText(extractedText || resumeName);

    // If marked default, unset existing default
    if (isDefault === 'true' || isDefault === true) {
      await Resume.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const resume = await Resume.create({
      user: req.user.id,
      name: resumeName,
      filename: req.file.filename,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText,
      parsedSkills,
      targetRoles: targetRoles ? (Array.isArray(targetRoles) ? targetRoles : targetRoles.split(',').map(r => r.trim())) : [],
      isDefault: isDefault === 'true' || isDefault === true
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const usageCount = await Application.countDocuments({
      user: req.user.id,
      resumeUsed: resume._id
    });

    res.json({
      success: true,
      data: {
        ...resume.toObject(),
        usageCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Attempt to remove local file from disk
    const filePath = path.join(__dirname, '..', 'uploads', resume.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Error deleting resume file from disk:', err.message);
      }
    }

    // Clear resume reference from applications
    await Application.updateMany(
      { user: req.user.id, resumeUsed: resume._id },
      { $unset: { resumeUsed: 1 } }
    );

    await Resume.deleteOne({ _id: resume._id });

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default resume
// @route   PATCH /api/resumes/:id/default
// @access  Private
const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await Resume.updateMany({ user: req.user.id }, { isDefault: false });
    resume.isDefault = true;
    await resume.save();

    res.json({
      success: true,
      message: 'Default resume updated',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResumes,
  uploadResume,
  getResumeById,
  deleteResume,
  setDefaultResume
};
