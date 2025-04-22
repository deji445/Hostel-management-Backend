// routes/hostelRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllHostels,
  addHostel,
  updateHostel,
  deleteHostel
} = require('../controllers/hostelController');

// validation helper
const validate = v => async (req, res, next) => {
  await Promise.all(v.map(fn => fn.run(req)));
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// GET all
router.get('/', protect, adminOnly, getAllHostels);

// CREATE
router.post(
  '/',
  protect,
  adminOnly,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString()
  ]),
  addHostel
);

// UPDATE
router.put(
  '/:id',
  protect,
  adminOnly,
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().isString()
  ]),
  updateHostel
);

// DELETE
router.delete('/:id', protect, adminOnly, deleteHostel);

module.exports = router;
