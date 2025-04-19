const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  addRoom,
  updateRoom
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public (or protected if needed)
router.get('/', protect, getAllRooms);

// Admin only
router.post('/', protect, adminOnly, addRoom);
router.put('/:id', protect, adminOnly, updateRoom);

module.exports = router;
