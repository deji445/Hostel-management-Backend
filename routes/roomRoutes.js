// routes/roomRoutes.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllRooms,
  getAvailableRooms,
  addRoom,
  updateRoom,
  getAllRoomsAdmin,
  deleteRoom
} = require('../controllers/roomController');

const router = express.Router();

// public
router.get('/',          getAllRooms);
router.get('/available', getAvailableRooms);

// admin
router.get( '/all',      protect, adminOnly, getAllRoomsAdmin);
router.post('/',         protect, adminOnly, addRoom);
router.put('/:id',       protect, adminOnly, updateRoom);
router.delete('/:id',    protect, adminOnly, deleteRoom);

module.exports = router;
