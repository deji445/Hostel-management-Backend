const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getAssignedRoom
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Student/Admin profile
router.get('/profile', protect, getUserProfile);

// Student's assigned room
router.get('/assigned-room', protect, getAssignedRoom);

module.exports = router;
