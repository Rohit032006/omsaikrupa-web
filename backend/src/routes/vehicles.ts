import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/vehicles - Search available vehicles
router.get('/', async (req, res: Response) => {
  try {
    const { date, passengers } = req.query;

    let query = `
      SELECT v.*, d.name as driverName, d.mobile as driverMobile, d.licenseNumber as driverLicense
      FROM vehicles v
      LEFT JOIN drivers d ON v.driverId = d.id
      WHERE v.status = 'AVAILABLE'
    `;
    const params: any[] = [];

    if (passengers) {
      query += ' AND v.capacity >= ?';
      params.push(parseInt(passengers as string));
    }

    const vehicles = (await db.prepare(query).all(...params)) as any[];

    // Calculate available seats for given date
    if (date) {
      const result = await Promise.all(
        vehicles.map(async (vehicle) => {
          const bookedSeats = (await db.prepare(`
            SELECT bs.seatNumber FROM booking_seats bs
            JOIN bookings b ON bs.bookingId = b.id
            WHERE b.vehicleId = ? AND b.travelDate = ? AND b.bookingStatus NOT IN ('CANCELLED')
          `).all(vehicle.id, date)) as any[];

          const bookedSeatNumbers = bookedSeats.map((s: any) => s.seatNumber);
          const availableSeats = vehicle.capacity - bookedSeatNumbers.length;

          return {
            ...vehicle,
            features: JSON.parse(vehicle.features || '[]'),
            bookedSeats: bookedSeatNumbers,
            availableSeats,
          };
        })
      );
      return res.json(result);
    }

    return res.json(vehicles.map((v) => ({ ...v, features: JSON.parse(v.features || '[]') })));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/vehicles/:id - Get vehicle details
router.get('/:id', async (req, res: Response) => {
  try {
    const vehicle = (await db.prepare(`
      SELECT v.*, d.name as driverName, d.mobile as driverMobile
      FROM vehicles v LEFT JOIN drivers d ON v.driverId = d.id
      WHERE v.id = ?
    `).get(req.params.id)) as any;

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    vehicle.features = JSON.parse(vehicle.features || '[]');
    return res.json(vehicle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/vehicles/:id/seats - Get seat availability for a date
router.get('/:id/seats', async (req, res: Response) => {
  try {
    const { date } = req.query;
    const vehicle = (await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)) as any;
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    let bookedSeats: string[] = [];
    let reservedSeats: string[] = [];

    if (date) {
      const booked = (await db.prepare(`
        SELECT bs.seatNumber, b.bookingStatus FROM booking_seats bs
        JOIN bookings b ON bs.bookingId = b.id
        WHERE b.vehicleId = ? AND b.travelDate = ? AND b.bookingStatus NOT IN ('CANCELLED')
      `).all(req.params.id, date)) as any[];

      bookedSeats = booked.filter((s: any) => s.bookingStatus === 'CONFIRMED').map((s: any) => s.seatNumber);
      reservedSeats = booked.filter((s: any) => s.bookingStatus === 'PENDING').map((s: any) => s.seatNumber);
    }

    return res.json({
      vehicleId: vehicle.id,
      capacity: vehicle.capacity,
      bookedSeats,
      reservedSeats,
      availableCount: vehicle.capacity - bookedSeats.length - reservedSeats.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/vehicles - Admin: Add vehicle
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleName, vehicleNumber, capacity, vehicleType, driverId, baseFare, features, description, pickupLocation, dropLocation } = req.body;
    if (!vehicleName || !vehicleNumber || !capacity || !vehicleType) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const existing = await db.prepare('SELECT id FROM vehicles WHERE vehicleNumber = ?').get(vehicleNumber);
    if (existing) return res.status(409).json({ error: 'Vehicle number already exists' });

    const id = uuidv4();
    await db.prepare(`INSERT INTO vehicles (id, vehicleName, vehicleNumber, capacity, vehicleType, driverId, status, baseFare, features, description, pickupLocation, dropLocation) VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, ?, ?, ?, ?)`).run(
      id, vehicleName, vehicleNumber, capacity, vehicleType, driverId || null, baseFare || 0, JSON.stringify(features || []), description || '', pickupLocation || null, dropLocation || null
    );
    const vehicle = (await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id)) as any;
    vehicle.features = JSON.parse(vehicle.features);
    return res.status(201).json(vehicle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/vehicles/:id - Admin: Update vehicle
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleName, vehicleNumber, capacity, vehicleType, driverId, status, baseFare, features, description, pickupLocation, dropLocation } = req.body;
    const vehicle = await db.prepare('SELECT id FROM vehicles WHERE id = ?').get(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    await db.prepare(`UPDATE vehicles SET vehicleName=?, vehicleNumber=?, capacity=?, vehicleType=?, driverId=?, status=?, baseFare=?, features=?, description=?, pickupLocation=?, dropLocation=? WHERE id=?`).run(
      vehicleName, vehicleNumber, capacity, vehicleType, driverId || null, status, baseFare || 0, JSON.stringify(features || []), description || '', pickupLocation || null, dropLocation || null, req.params.id
    );
    const updated = (await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)) as any;
    updated.features = JSON.parse(updated.features);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/vehicles/:id - Admin: Delete vehicle
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Vehicle deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/vehicles/admin/all - Admin: Get all vehicles
router.get('/admin/all', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const vehicles = (await db.prepare(`
      SELECT v.*, d.name as driverName FROM vehicles v LEFT JOIN drivers d ON v.driverId = d.id
    `).all()) as any[];
    return res.json(vehicles.map((v) => ({ ...v, features: JSON.parse(v.features || '[]') })));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
