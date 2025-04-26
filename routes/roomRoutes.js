// routes/roomRoutes.js
const express = require('express');
const path    = require('path');
const multer  = require('multer');
const { body, validationResult } = require('express-validator');
const { protect, adminOnly }    = require('../middleware/authMiddleware');
const { deleteRoom } = require('../controllers/roomController');
const {
  getAllRooms,
  getAvailableRooms,
  addRoom,
  updateRoom,
  getAllRoomsAdmin
} = require('../controllers/roomController');

const router = express.Router();

// ── Validation middleware ───────────────────────────────────────────────────
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// ── Multer setup for file uploads ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `room-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ── Public endpoints ─────────────────────────────────────────────────────────
router.get('/',          getAllRooms);
router.get('/available', getAvailableRooms);

// ── Admin endpoints ──────────────────────────────────────────────────────────
router.get(
  '/all',
  protect,
  adminOnly,
  getAllRoomsAdmin
);


// ── POST (with file) ────────────────────────────────────────────────────────────
router.post(
  '/', 
  protect, 
  adminOnly, 
  upload.single('photo_file'),
  async (req, res, next) => {
    // pull the file path + form fields out of req
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Photo file is required.' });
      }
      // build the body exactly like your JSON route expects:
      const photoPath = `/uploads/${req.file.filename}`;
      const { hostel_id, room_number, capacity, description } = req.body;

      // then call your controller logic, or inline:
      const result = await req.app
        .get('db')
        .query(
          `INSERT INTO rooms
             (hostel_id, room_number, capacity, occupancy, photo, description)
           VALUES ($1,$2,$3,0,$4,$5)
           RETURNING *`,
          [hostel_id, room_number, capacity, photoPath, description]
        );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// ── PUT /api/rooms/:id ───────────────────────────────────────────────────────────
router.put(
  '/:id',
  protect,
  adminOnly,
  async (req, res, next) => {
    const { room_number, capacity } = req.body;
    try {
      // fetch occupancy, compute status, update…
      const { rows: [existing] } = await req.app
        .get('db')
        .query(
          'SELECT occupancy FROM rooms WHERE id = $1',
          [req.params.id]
        );
      const status = +capacity <= existing.occupancy ? 'full' : 'available';
      const { rows: [updated] } = await req.app
        .get('db')
        .query(
          `UPDATE rooms
              SET room_number = $1,
                  capacity    = $2,
                  status      = $3
            WHERE id = $4
            RETURNING *`,
          [room_number, capacity, status, req.params.id]
        );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteRoom
);

module.exports = router;