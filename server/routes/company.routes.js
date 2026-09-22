const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const companies = await Company.find({
      name: { $regex: q.trim(), $options: 'i' }
    }).limit(10);

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
