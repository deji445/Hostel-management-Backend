const pool = require('../db');

// this allows a Student to apply for a room
exports.applyForRoom = async (req, res) => {
  const { room_id, preference } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO applications (user_id, room_id, preference) VALUES ($1, $2, $3) RETURNING *',
      [user_id, room_id, preference]
    );

    const studentNotification =
      'Your housing application has been successfully submitted. You will be notified once the admin reviews it.';
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [user_id, studentNotification]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin can views all applications
exports.getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        u.name    AS student_name,
        r.room_number,
        h.name    AS hostel_name
      FROM applications a
      JOIN users   u ON a.user_id   = u.id
      JOIN rooms   r ON a.room_id   = r.id
      JOIN hostels h ON r.hostel_id = h.id
      ORDER BY a.created_at DESC
    `);
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
    // 1) Fetch existing application
    const appResult = await pool.query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = appResult.rows[0];
    const userId = application.user_id;
    const roomId = application.room_id;
    const previousStatus = application.status;

    // 2) Update the application’s status
    const updateResult = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    const updatedApp = updateResult.rows[0];

    // 3) Notify student via dashboard
    const msg = `Your housing application has been ${status}.`;
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [userId, msg]
    );

    // 4) Handle acceptance: increment occupancy & auto‑set room status
    if (status === 'accepted') {
      const roomRes = await pool.query(
        'SELECT occupancy, capacity FROM rooms WHERE id = $1',
        [roomId]
      );
      const { occupancy, capacity } = roomRes.rows[0];

      if (occupancy < capacity) {
        await pool.query(
          `UPDATE rooms
           SET occupancy = occupancy + 1,
               status    = CASE
                             WHEN occupancy + 1 >= capacity THEN 'occupied'
                             ELSE 'available'
                           END
           WHERE id = $1`,
          [roomId]
        );
      } else {
        return res.status(400).json({ error: 'Room is already full' });
      }
    }

    // 5) Handle rejection-of-an-already-accepted app: decrement occupancy & auto‑set room status
    if (status === 'rejected' && previousStatus === 'accepted') {
      await pool.query(
        `UPDATE rooms
         SET occupancy = GREATEST(occupancy - 1, 0),
             status    = CASE
                           WHEN occupancy - 1 < capacity THEN 'available'
                           ELSE 'occupied'
                         END
         WHERE id = $1`,
        [roomId]
      );
    }

    // 6) Return the updated application
    res.json(updatedApp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 7) Student views assigned room
exports.getMyRoom = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        r.room_number,
        r.capacity,
        r.status    AS room_status,
        h.name      AS hostel_name
      FROM applications a
      JOIN rooms   r ON a.room_id   = r.id
      JOIN hostels h ON r.hostel_id = h.id
      WHERE a.user_id = $1
        AND a.status  = 'accepted'
    `, [user_id]);

    if (result.rows.length === 0) {
        // No assignment → return empty object, 200 OK
        return res.json({});
      }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8) Admin views all assigned applications
exports.getAllAssignedApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        u.name    AS student_name,
        u.email,
        r.room_number,
        r.capacity,
        h.name    AS hostel_name
      FROM applications a
      JOIN users   u ON a.user_id   = u.id
      JOIN rooms   r ON a.room_id   = r.id
      JOIN hostels h ON r.hostel_id = h.id
      WHERE a.status = 'accepted'
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/applications/:id  (Admin only)
exports.deleteApplication = async (req, res) => {
  const { id } = req.params;
  try {
    // You may want to check status first, if you only allow deleting processed apps
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};