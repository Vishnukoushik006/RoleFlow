const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');
const {
  getEventsByApplication,
  createEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Applications
router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .patch(updateApplication)
  .delete(deleteApplication);

// Application Timeline Events
router.route('/:id/events')
  .get(getEventsByApplication)
  .post(createEvent);

router.route('/:id/events/:eventId')
  .delete(deleteEvent);

module.exports = router;
