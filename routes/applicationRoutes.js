const express = require('express');
const router = express.Router();
const {
  applyForRoom,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student applies for room
router.post('/apply', protect, applyForRoom);

// Admin views all applications
router.get('/', protect, adminOnly, getAllApplications);

// Admin updates application status
router.put('/status/:id', protect, adminOnly, updateApplicationStatus);

module.exports = router;
