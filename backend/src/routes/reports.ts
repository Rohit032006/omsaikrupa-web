import { Router, Response } from 'express';
import { db } from '../database/init';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/bookings', authenticate, requireAdmin, (req, res: Response) => {
  try {
    const { from, to, status } = req.query;
    let query = `
      SELECT b.*, u.name as userName, u.mobile as userMobile, v.vehicleName, v.vehicleNumber
      FROM bookings b JOIN users u ON b.userId = u.id JOIN vehicles v ON b.vehicleId = v.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (from) { query += ' AND b.travelDate >= ?'; params.push(from); }
    if (to) { query += ' AND b.travelDate <= ?'; params.push(to); }
    if (status) { query += ' AND b.bookingStatus = ?'; params.push(status); }
    query += ' ORDER BY b.travelDate DESC';
    return res.json(db.prepare(query).all(...params));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/revenue', authenticate, requireAdmin, (req, res: Response) => {
  try {
    const { period } = req.query; // daily, weekly, monthly
    let query = '';
    if (period === 'daily') {
      query = "SELECT DATE(createdAt) as date, SUM(paidAmount) as revenue, COUNT(*) as bookings FROM bookings WHERE bookingStatus != 'CANCELLED' GROUP BY DATE(createdAt) ORDER BY date DESC LIMIT 30";
    } else if (period === 'monthly') {
      query = "SELECT strftime('%Y-%m', createdAt) as month, SUM(paidAmount) as revenue, COUNT(*) as bookings FROM bookings WHERE bookingStatus != 'CANCELLED' GROUP BY strftime('%Y-%m', createdAt) ORDER BY month DESC LIMIT 12";
    } else {
      query = "SELECT strftime('%Y-W%W', createdAt) as week, SUM(paidAmount) as revenue, COUNT(*) as bookings FROM bookings WHERE bookingStatus != 'CANCELLED' GROUP BY strftime('%Y-W%W', createdAt) ORDER BY week DESC LIMIT 8";
    }
    return res.json(db.prepare(query).all());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/vehicles', authenticate, requireAdmin, (_req, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT v.vehicleName, v.vehicleNumber, v.capacity, v.vehicleType,
             COUNT(b.id) as totalBookings,
             COALESCE(SUM(b.totalAmount), 0) as totalRevenue
      FROM vehicles v LEFT JOIN bookings b ON v.id = b.vehicleId AND b.bookingStatus != 'CANCELLED'
      GROUP BY v.id ORDER BY totalBookings DESC
    `).all();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/payments', authenticate, requireAdmin, (_req, res: Response) => {
  try {
    const stats = {
      total: (db.prepare('SELECT COALESCE(SUM(amount), 0) as s FROM payments').get() as any).s,
      verified: (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'VERIFIED'").get() as any).s,
      pending: (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status IN ('PENDING', 'SUBMITTED')").get() as any).s,
      byMethod: db.prepare("SELECT method, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY method").all(),
    };
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/cancellations', authenticate, requireAdmin, (_req, res: Response) => {
  try {
    const data = db.prepare(`
      SELECT b.*, u.name as userName FROM bookings b JOIN users u ON b.userId = u.id
      WHERE b.bookingStatus = 'CANCELLED' ORDER BY b.updatedAt DESC
    `).all();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
