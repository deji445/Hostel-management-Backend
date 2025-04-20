const pool = require('../db');
const { sendEmail } = require('./emailController');

// Student applies for a room
exports.applyForRoom = async (req, res) => {
  const { room_id, preference } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO applications (user_id, room_id, preference) VALUES ($1, $2, $3) RETURNING *',
      [user_id, room_id, preference]
    );

    const studentNotification = 'Your housing application has been successfully submitted. You will be notified once the admin reviews it.';
    await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [user_id, studentNotification]);

    const adminEmail = process.env.EMAIL_USER;
    const adminSubject = `New Housing Application`;
    const adminMessage = `A new housing application has been submitted by User ID: ${user_id}. Please review it.`;

    await sendEmail(adminEmail, adminSubject, adminMessage);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views all applications
exports.getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS student_name, r.room_number 
       FROM applications a 
       JOIN users u ON a.user_id = u.id 
       JOIN rooms r ON a.room_id = r.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin updates application status
exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Fetch application
    const appResult = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) return res.status(404).json({ error: 'Application not found' });

    const application = appResult.rows[0];
    const userId = application.user_id;
    const roomId = application.room_id;

    // Update application status
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Notify student via dashboard
    const msg = `Your housing application has been ${status}.`;
    await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [userId, msg]);

    // Send admin email confirmation
    const adminEmail = process.env.EMAIL_USER;
    const adminSubject = `Application Status Updated`;
    const adminMessage = `Application ID ${id} has been updated to ${status}.`;

    await sendEmail(adminEmail, adminSubject, adminMessage);

    // Increment room occupancy if accepted
    if (status === 'accepted') {
      // Check current room occupancy
      const roomResult = await pool.query('SELECT occupancy, capacity FROM rooms WHERE id = $1', [roomId]);
      const room = roomResult.rows[0];

      if (room.occupancy < room.capacity) {
        await pool.query(
          'UPDATE rooms SET occupancy = occupancy + 1 WHERE id = $1',
          [roomId]
        );
      } else {
        return res.status(400).json({ error: 'Room is already full' });
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Student views assigned room
exports.getMyRoom = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT a.*, r.room_number, r.capacity, r.status AS room_status 
       FROM applications a 
       JOIN rooms r ON a.room_id = r.id 
       WHERE a.user_id = $1 AND a.status = 'accepted'`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No room assigned yet.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin views all assigned applications
exports.getAllAssignedApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS student_name, u.email, r.room_number, r.capacity 
       FROM applications a 
       JOIN users u ON a.user_id = u.id 
       JOIN rooms r ON a.room_id = r.id 
       WHERE a.status = 'accepted'`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
