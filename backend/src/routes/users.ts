import { Router, Response } from 'express';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/users - Admin: All users
router.get('/', authenticate, requireAdmin, (_req, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.mobile, u.role, u.status, u.createdAt,
             COUNT(b.id) as totalBookings
      FROM users u LEFT JOIN bookings b ON u.id = b.userId
      WHERE u.role = 'USER'
      GROUP BY u.id ORDER BY u.createdAt DESC
    `).all();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get user profile
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN' && req.user!.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const user = db.prepare('SELECT id, name, email, mobile, role, status, profilePhoto, address, createdAt FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN' && req.user!.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { name, mobile, address } = req.body;
    db.prepare('UPDATE users SET name=?, mobile=?, address=? WHERE id=?').run(name, mobile, address, req.params.id);
    return res.json(db.prepare('SELECT id, name, email, mobile, role, status, address, createdAt FROM users WHERE id = ?').get(req.params.id));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/status - Admin: Block/Unblock user
router.put('/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE users SET status=? WHERE id=?').run(status, req.params.id);
    return res.json({ message: `User ${status}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
