// routes/applicationRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  applyForRoom,
  getAllApplications,
  updateApplicationStatus,
  getMyRoom,
  getAllAssignedApplications
} = require('../controllers/applicationController');

// Validation middleware
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Student applies for a room
router.post(
  '/apply',
  protect,
  validate([
    body('room_id').isInt().withMessage('room_id must be an integer'),
    body('preference').optional().isString().withMessage('preference must be text')
  ]),
  applyForRoom
);

// Student views assigned room
router.get('/my-room', protect, getMyRoom);

// Admin views all applications
router.get('/', protect, adminOnly, getAllApplications);

// Admin views only accepted (assigned) applications
router.get('/assigned', protect, adminOnly, getAllAssignedApplications);

// Admin updates application status
router.put(
  '/status/:id',
  protect,
  adminOnly,
  validate([
    body('status')
      .isIn(['pending', 'accepted', 'rejected'])
      .withMessage('status must be one of pending, accepted, rejected')
  ]),
  updateApplicationStatus
);

module.exports = router;

