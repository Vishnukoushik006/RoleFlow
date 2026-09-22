const express = require('express');
const router = express.Router();
const {
  getResumes,
  uploadResume,
  getResumeById,
  deleteResume,
  setDefaultResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getResumes)
  .post(upload.single('file'), uploadResume);

router.route('/:id')
  .get(getResumeById)
  .delete(deleteResume);

router.route('/:id/default')
  .patch(setDefaultResume);

module.exports = router;
