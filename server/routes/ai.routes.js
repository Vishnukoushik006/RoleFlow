const express = require('express');
const router = express.Router();
const {
  handleParseJD,
  handleSummarizeJD,
  handleMatchResume
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/parse-jd', handleParseJD);
router.post('/summarize-jd', handleSummarizeJD);
router.post('/match-resume', handleMatchResume);

module.exports = router;
