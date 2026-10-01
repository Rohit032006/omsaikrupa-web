import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const last = db.prepare("SELECT bookingId FROM bookings ORDER BY createdAt DESC LIMIT 1").get() as any;
  let seq = 1;
  if (last) {
    const parts = last.bookingId.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  return `OSK-${year}-${String(seq).padStart(5, '0')}`;
}

function createNotification(userId: string, title: string, message: string, type: string = 'INFO') {
  const id = uuidv4();
  db.prepare('INSERT INTO notifications (id, userId, title, message, type) VALUES (?, ?, ?, ?, ?)').run(id, userId, title, message, type);
  // Admin notifications
  const admins = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").all() as any[];
  admins.forEach((admin: any) => {
    if (admin.id !== userId) {
      const nid = uuidv4();
      db.prepare('INSERT INTO notifications (id, userId, title, message, type) VALUES (?, ?, ?, ?, ?)').run(nid, admin.id, `[Admin] ${title}`, message, type);
    }
  });
}

// GET /api/bookings - User's bookings or all bookings for admin
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    let query = `
      SELECT b.*, u.name as userName, u.mobile as userMobile, u.email as userEmail,
             v.vehicleName, v.vehicleNumber, v.capacity as vehicleCapacity,
             d.name as driverName, d.mobile as driverMobile
      FROM bookings b
      JOIN users u ON b.userId = u.id
      JOIN vehicles v ON b.vehicleId = v.id
      LEFT JOIN drivers d ON v.driverId = d.id
    `;
    const params: any[] = [];
    if (!isAdmin) {
      query += ' WHERE b.userId = ?';
      params.push(req.user!.id);
    }
    query += ' ORDER BY b.createdAt DESC';

    const bookings = db.prepare(query).all(...params) as any[];

    const enriched = bookings.map((b: any) => {
      const seats = db.prepare('SELECT seatNumber FROM booking_seats WHERE bookingId = ?').all(b.id) as any[];
      const passengers = db.prepare('SELECT * FROM passengers WHERE bookingId = ?').all(b.id);
      const payments = db.prepare('SELECT * FROM payments WHERE bookingId = ? ORDER BY createdAt DESC').all(b.id);
      return { ...b, seats: seats.map((s: any) => s.seatNumber), passengers, payments };
    });

    return res.json(enriched);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const booking = db.prepare(`
      SELECT b.*, u.name as userName, u.mobile as userMobile, u.email as userEmail,
             v.vehicleName, v.vehicleNumber, v.capacity as vehicleCapacity, v.vehicleType, v.baseFare,
             d.name as driverName, d.mobile as driverMobile
      FROM bookings b
      JOIN users u ON b.userId = u.id
      JOIN vehicles v ON b.vehicleId = v.id
      LEFT JOIN drivers d ON v.driverId = d.id
      WHERE b.id = ?
    `).get(req.params.id) as any;

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const seats = db.prepare('SELECT seatNumber FROM booking_seats WHERE bookingId = ?').all(booking.id) as any[];
    const passengers = db.prepare('SELECT * FROM passengers WHERE bookingId = ?').all(booking.id);
    const payments = db.prepare('SELECT p.*, u.name as verifiedByName FROM payments p LEFT JOIN users u ON p.verifiedBy = u.id WHERE p.bookingId = ? ORDER BY p.createdAt DESC').all(booking.id);

    return res.json({ ...booking, seats: seats.map((s: any) => s.seatNumber), passengers, payments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings - Create booking
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    let { vehicleId, travelDate, pickupLocation, dropLocation, pickupTime, flightNumber, flightTime, tripType, seats, passengers, totalAmount } = req.body;

    travelDate = travelDate || new Date().toISOString().split('T')[0];
    pickupLocation = pickupLocation || 'Pune';
    dropLocation = dropLocation || 'Mumbai';
    pickupTime = pickupTime || '09:00 AM';
    tripType = tripType || 'LOCAL';

    if (!vehicleId || !seats?.length) {
      return res.status(400).json({ error: 'Please select vehicle and at least one seat' });
    }

    // Check vehicle availability
    const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ? AND status = 'AVAILABLE'").get(vehicleId) as any;
    if (!vehicle) return res.status(400).json({ error: 'Vehicle not available' });

    // Check seat availability
    const existingSeats = db.prepare(`
      SELECT bs.seatNumber FROM booking_seats bs
      JOIN bookings b ON bs.bookingId = b.id
      WHERE b.vehicleId = ? AND b.travelDate = ? AND b.bookingStatus NOT IN ('CANCELLED')
      AND bs.seatNumber IN (${seats.map(() => '?').join(',')})
    `).all(vehicleId, travelDate, ...seats) as any[];

    if (existingSeats.length > 0) {
      return res.status(409).json({ error: `Seats already booked: ${existingSeats.map((s: any) => s.seatNumber).join(', ')}` });
    }

    if (seats.length > vehicle.capacity) {
      return res.status(400).json({ error: 'Seat count exceeds vehicle capacity' });
    }

    const bookingId = uuidv4();
    const bookingRef = generateBookingId();
    const amount = totalAmount || (vehicle.baseFare * seats.length);

    db.prepare(`INSERT INTO bookings (id, bookingId, userId, vehicleId, travelDate, pickupLocation, dropLocation, pickupTime, flightNumber, flightTime, tripType, passengerCount, totalAmount, paidAmount, remainingAmount, paymentStatus, bookingStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'PENDING', 'PENDING')`).run(
      bookingId, bookingRef, req.user!.id, vehicleId, travelDate, pickupLocation, dropLocation, pickupTime,
      flightNumber || null, flightTime || null, tripType || 'LOCAL', seats.length, amount, amount
    );

    // Insert seats
    for (const seat of seats) {
      db.prepare('INSERT INTO booking_seats (id, bookingId, seatNumber) VALUES (?, ?, ?)').run(uuidv4(), bookingId, seat);
    }

    // Insert passengers
    if (passengers?.length) {
      for (const p of passengers) {
        db.prepare('INSERT INTO passengers (id, bookingId, seatNumber, name, mobile, age, gender, specialRequirement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          uuidv4(), bookingId, p.seatNumber, p.name, p.mobile, p.age || null, p.gender || null, p.specialRequirement || null
        );
      }
    }

    createNotification(req.user!.id, 'Booking Created', `Your booking ${bookingRef} has been created. Total: ₹${amount}`, 'BOOKING');

    const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as Record<string, any> | undefined;
    return res.status(201).json({ ...(created || {}), bookingRef });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/bookings/:id/status - Admin: Update booking status
router.put('/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { bookingStatus } = req.body;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as any;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    db.prepare('UPDATE bookings SET bookingStatus = ?, updatedAt = datetime(\'now\') WHERE id = ?').run(bookingStatus, req.params.id);

    if (bookingStatus === 'CANCELLED') {
      // Seats are released automatically since we filter by bookingStatus != CANCELLED
    }

    createNotification(booking.userId, `Booking ${bookingStatus}`, `Your booking ${booking.bookingId} status is now: ${bookingStatus}`, 'BOOKING');
    return res.json({ message: 'Status updated', bookingStatus });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/bookings/:id/cancel - User cancel booking
router.put('/:id/cancel', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as any;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    db.prepare("UPDATE bookings SET bookingStatus = 'CANCELLED', updatedAt = datetime('now') WHERE id = ?").run(req.params.id);
    createNotification(booking.userId, 'Booking Cancelled', `Your booking ${booking.bookingId} has been cancelled.`, 'BOOKING');
    return res.json({ message: 'Booking cancelled' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/bookings/:id - Admin: Update booking
router.put('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { pickupLocation, dropLocation, travelDate, pickupTime, flightNumber, flightTime, tripType, totalAmount, notes } = req.body;
    db.prepare(`UPDATE bookings SET pickupLocation=?, dropLocation=?, travelDate=?, pickupTime=?, flightNumber=?, flightTime=?, tripType=?, totalAmount=?, notes=?, updatedAt=datetime('now') WHERE id=?`).run(
      pickupLocation, dropLocation, travelDate, pickupTime, flightNumber, flightTime, tripType, totalAmount, notes, req.params.id
    );
    return res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/admin/stats - Dashboard stats
router.get('/admin/stats', authenticate, requireAdmin, (_req, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = {
      totalBookings: (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as any).c,
      todayBookings: (db.prepare('SELECT COUNT(*) as c FROM bookings WHERE DATE(createdAt) = ?').get(today) as any).c,
      upcomingTrips: (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE travelDate >= ? AND bookingStatus = 'CONFIRMED'").get(today) as any).c,
      totalRevenue: (db.prepare('SELECT COALESCE(SUM(paidAmount), 0) as s FROM bookings').get() as any).s,
      pendingPayments: (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE paymentStatus IN ('PENDING', 'PARTIAL')").get() as any).c,
      totalUsers: (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'USER'").get() as any).c,
      availableVehicles: (db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'AVAILABLE'").get() as any).c,
      vehiclesOnTrip: (db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE status = 'ON_TRIP'").get() as any).c,
    };
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
