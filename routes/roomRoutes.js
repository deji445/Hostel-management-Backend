// routes/roomRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllRooms,
  getAvailableRooms,
  addRoom,
  updateRoom
} = require('../controllers/roomController');

// Validation middleware
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET all available rooms
router.get('/', getAllRooms);

// GET only rooms with occupancy < capacity
router.get('/available', getAvailableRooms);

// POST create new room (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  validate([
    body('hostel_id').isInt().withMessage('hostel_id must be an integer'),
    body('room_number').notEmpty().withMessage('room_number is required'),
    body('capacity').isInt({ gt: 0 }).withMessage('capacity must be a positive integer'),
    body('photo').optional().isURL().withMessage('photo must be a valid URL'),
    body('description').optional().isString().withMessage('description must be text')
  ]),
  addRoom
);

// PUT update room details (Admin only)
router.put(
  '/:id',
  protect,
  adminOnly,
  validate([
    body('room_number').optional().notEmpty().withMessage('room_number cannot be empty'),
    body('capacity').optional().isInt({ gt: 0 }).withMessage('capacity must be a positive integer'),
    body('photo').optional().isURL().withMessage('photo must be a valid URL'),
    body('description').optional().isString().withMessage('description must be text')
  ]),
  updateRoom
);

module.exports = router;
