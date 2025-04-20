const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// Route to get all notifications for the logged-in user
router.get('/', getNotifications);

// Route to mark a notification as read
router.put('/read/:id', markAsRead);

module.exports = router;
