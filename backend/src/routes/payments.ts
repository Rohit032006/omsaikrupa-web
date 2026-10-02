import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/payments - All payments (admin) or user's payments
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    let query = `
      SELECT p.*, b.bookingId as bookingRef, u.name as userName, u.mobile as userMobile,
             vu.name as verifiedByName
      FROM payments p
      JOIN bookings b ON p.bookingId = b.id
      JOIN users u ON p.userId = u.id
      LEFT JOIN users vu ON p.verifiedBy = vu.id
    `;
    const params: any[] = [];
    if (!isAdmin) {
      query += ' WHERE p.userId = ?';
      params.push(req.user!.id);
    }
    query += ' ORDER BY p.createdAt DESC';
    return res.json(await db.prepare(query).all(...params));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/payments - Submit payment
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount, method, utrNumber, transactionId, paymentDate, notes } = req.body;

    if (!bookingId || !amount || !method) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const booking = (await db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId)) as any;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (amount > booking.remainingAmount + 1) {
      return res.status(400).json({ error: 'Payment amount exceeds remaining balance' });
    }

    const id = uuidv4();
    await db.prepare(`INSERT INTO payments (id, bookingId, userId, amount, method, utrNumber, transactionId, paymentDate, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)`).run(
      id, bookingId, req.user!.id, amount, method, utrNumber || null, transactionId || null, paymentDate || new Date().toISOString().split('T')[0], notes || null
    );

    // Update booking payment amounts
    const newPaid = booking.paidAmount + amount;
    const newRemaining = booking.totalAmount - newPaid;
    const paymentStatus = newRemaining <= 0 ? 'SUBMITTED' : 'PARTIAL';
    await db.prepare("UPDATE bookings SET paidAmount=?, remainingAmount=?, paymentStatus=?, updatedAt=datetime('now') WHERE id=?").run(
      newPaid, Math.max(0, newRemaining), paymentStatus, bookingId
    );

    return res.status(201).json(await db.prepare('SELECT * FROM payments WHERE id = ?').get(id));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/payments/:id/verify - Admin verify payment
router.put('/:id/verify', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payment = (await db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id)) as any;
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await db.prepare("UPDATE payments SET status='VERIFIED', verifiedBy=?, verifiedAt=datetime('now') WHERE id=?").run(req.user!.id, req.params.id);

    const booking = (await db.prepare('SELECT * FROM bookings WHERE id = ?').get(payment.bookingId)) as any;
    const pendingCount = ((await db.prepare("SELECT COUNT(*) as c FROM payments WHERE bookingId = ? AND status != 'VERIFIED'").get(payment.bookingId)) as any)?.c || 0;
    const allVerified = pendingCount === 0;

    if (allVerified && booking && booking.remainingAmount <= 0) {
      await db.prepare("UPDATE bookings SET paymentStatus='PAID', bookingStatus='CONFIRMED', updatedAt=datetime('now') WHERE id=?").run(payment.bookingId);
    } else {
      await db.prepare("UPDATE bookings SET paymentStatus='PARTIAL', updatedAt=datetime('now') WHERE id=?").run(payment.bookingId);
    }

    // Notify user
    const nid = uuidv4();
    await db.prepare('INSERT INTO notifications (id, userId, title, message, type) VALUES (?, ?, ?, ?, ?)').run(
      nid, booking.userId, 'Payment Verified', `Your payment of ₹${payment.amount} for booking ${booking?.bookingId} has been verified.`, 'PAYMENT'
    );

    return res.json({ message: 'Payment verified' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/payments/:id/reject - Admin reject payment
router.put('/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payment = (await db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id)) as any;
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await db.prepare("UPDATE payments SET status='REJECTED', verifiedBy=?, verifiedAt=datetime('now') WHERE id=?").run(req.user!.id, req.params.id);

    // Reverse the amount from booking
    const booking = (await db.prepare('SELECT * FROM bookings WHERE id = ?').get(payment.bookingId)) as any;
    if (booking) {
      const newPaid = booking.paidAmount - payment.amount;
      const newRemaining = booking.totalAmount - newPaid;
      await db.prepare("UPDATE bookings SET paidAmount=?, remainingAmount=?, paymentStatus='PENDING', updatedAt=datetime('now') WHERE id=?").run(Math.max(0, newPaid), newRemaining, payment.bookingId);
    }

    return res.json({ message: 'Payment rejected' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
