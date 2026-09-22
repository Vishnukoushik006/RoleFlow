const { parseJobDescription, summarizeJobDescription, matchResumeWithJob } = require('../services/aiService');
const Resume = require('../models/Resume');
const Application = require('../models/Application');

// @desc    Parse raw job description into structured JSON
// @route   POST /api/ai/parse-jd
// @access  Private
const handleParseJD = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description text to analyze'
      });
    }

    const parsed = await parseJobDescription(jobDescription);

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Summarize job description into key highlights
// @route   POST /api/ai/summarize-jd
// @access  Private
const handleSummarizeJD = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description text to summarize'
      });
    }

    const summary = await summarizeJobDescription(jobDescription);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare resume against job description
// @route   POST /api/ai/match-resume
// @access  Private
const handleMatchResume = async (req, res, next) => {
  try {
    const { resumeId, applicationId, resumeText, jobDescription } = req.body;

    let targetResumeSkills = [];
    let targetResumeText = resumeText || '';
    let targetJDSkills = [];
    let targetJDText = jobDescription || '';

    // If resumeId supplied, load resume data
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
      if (resume) {
        targetResumeSkills = resume.parsedSkills || [];
        targetResumeText = resume.extractedText || '';
      }
    }

    // If applicationId supplied, load application data
    if (applicationId) {
      const app = await Application.findOne({ _id: applicationId, user: req.user.id });
      if (app) {
        targetJDSkills = app.skills || [];
        targetJDText = app.jobDescription || '';
      }
    }

    if (!targetJDText && targetJDSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description or target application is required for comparison'
      });
    }

    const matchResults = await matchResumeWithJob(
      targetResumeSkills,
      targetResumeText,
      targetJDSkills,
      targetJDText
    );

    res.json({
      success: true,
      data: matchResults
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleParseJD,
  handleSummarizeJD,
  handleMatchResume
};
