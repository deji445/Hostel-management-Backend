const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Fetch all notifications (marks them read internally)
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.put('/read/:id', protect, markAsRead);

module.exports = router;
