// server.js
const express = require('express');
const cors    = require('cors');
const fs   = require('fs');
const path    = require('path');         
require('dotenv').config();
const pool    = require('./db');

const authRoutes         = require('./routes/authRoutes');
const roomRoutes         = require('./routes/roomRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const hostelRoutes       = require('./routes/hostelRoutes');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public/uploads'))
);

// serve seed images (your existing images/img*.jpg files)
app.use(
  '/images',
  express.static(path.join(__dirname, 'public', 'images'))
)

// ── Test DB connection 
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mount API routes 
app.use('/api/auth',         authRoutes);
app.use('/api/rooms',        roomRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/notifications',notificationRoutes);
app.use('/api/hostels',      hostelRoutes);
app.use(express.static(path.join(__dirname, 'public', 'client-dist')));

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ── Global error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// ── Start server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
