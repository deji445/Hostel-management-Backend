const express = require('express');
const router = express.Router();
const {
  applyForRoom,
  getAllApplications,
  updateApplicationStatus,
  getMyRoom,
  getAllAssignedApplications
} = require('../controllers/applicationController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student applies for room
router.post('/apply', protect, applyForRoom);

// Student views assigned room
router.get('/my-room', protect, getMyRoom);

// Admin views all applications
router.get('/', protect, adminOnly, getAllApplications);

// Admin views all accepted assignments
router.get('/assigned', protect, adminOnly, getAllAssignedApplications);

// Admin updates application status
router.put('/status/:id', protect, adminOnly, updateApplicationStatus);

module.exports = router;
