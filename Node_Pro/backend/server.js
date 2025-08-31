const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// MySQL connection config (✅ Replace with your actual working RDS endpoint)
const dbConfig = {
  host: 'database-1.czog4skiuai5.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Chinmayi123',
  database: 'bus_reservation'
};

let db;

// Initialize database connection
async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// Generate booking reference
function generateBookingRef() {
  return 'BKG' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Routes

// Get all buses
app.get('/api/buses', async (req, res) => {
  try {
    const [buses] = await db.execute(`
      SELECT b.*, 
             COALESCE(SUM(CASE WHEN bk.status = 'confirmed' AND bk.booking_date = CURDATE() THEN bk.seats_booked ELSE 0 END), 0) as booked_seats
      FROM buses b
      LEFT JOIN bookings bk ON b.id = bk.bus_id
      GROUP BY b.id
    `);
    const busesWithAvailability = buses.map(bus => ({
      ...bus,
      available_seats: bus.total_seats - bus.booked_seats
    }));
    res.json(busesWithAvailability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search buses
app.get('/api/buses/search', async (req, res) => {
  try {
    const { route, date } = req.query;
    let query = `
      SELECT b.*, 
             COALESCE(SUM(CASE WHEN bk.status = 'confirmed' AND bk.booking_date = ? THEN bk.seats_booked ELSE 0 END), 0) as booked_seats
      FROM buses b
      LEFT JOIN bookings bk ON b.id = bk.bus_id
    `;
    let params = [date || new Date().toISOString().split('T')[0]];
    if (route) {
      query += ' WHERE b.route LIKE ?';
      params.push(`%${route}%`);
    }
    query += ' GROUP BY b.id ORDER BY b.departure_time';
    const [buses] = await db.execute(query, params);
    const busesWithAvailability = buses.map(bus => ({
      ...bus,
      available_seats: bus.total_seats - bus.booked_seats
    }));
    res.json(busesWithAvailability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { bus_id, passenger_name, passenger_email, passenger_phone, seats_booked, booking_date } = req.body;
    const [busInfo] = await db.execute(`
      SELECT b.*, 
             COALESCE(SUM(CASE WHEN bk.status = 'confirmed' AND bk.booking_date = ? THEN bk.seats_booked ELSE 0 END), 0) as booked_seats
      FROM buses b
      LEFT JOIN bookings bk ON b.id = bk.bus_id
      WHERE b.id = ?
      GROUP BY b.id
    `, [booking_date, bus_id]);

    if (busInfo.length === 0) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const availableSeats = busInfo[0].total_seats - busInfo[0].booked_seats;
    if (seats_booked > availableSeats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const booking_reference = generateBookingRef();
    const total_amount = busInfo[0].price * seats_booked;

    const [result] = await db.execute(`
      INSERT INTO bookings (bus_id, passenger_name, passenger_email, passenger_phone, seats_booked, booking_date, total_amount, booking_reference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [bus_id, passenger_name, passenger_email, passenger_phone, seats_booked, booking_date, total_amount, booking_reference]);

    const [booking] = await db.execute(`
      SELECT bk.*, b.bus_number, b.route, b.departure_time, b.arrival_time
      FROM bookings bk
      JOIN buses b ON bk.bus_id = b.id
      WHERE bk.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: booking[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by reference
app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const [booking] = await db.execute(`
      SELECT bk.*, b.bus_number, b.route, b.departure_time, b.arrival_time
      FROM bookings bk
      JOIN buses b ON bk.bus_id = b.id
      WHERE bk.booking_reference = ?
    `, [reference]);
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
app.put('/api/bookings/:reference/cancel', async (req, res) => {
  try {
    const { reference } = req.params;
    const [result] = await db.execute(`
      UPDATE bookings SET status = 'cancelled' WHERE booking_reference = ? AND status = 'confirmed'
    `, [reference]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server after DB is ready
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("❌ Fatal error: Unable to start server without DB");
  process.exit(1);
});

module.exports = app;

