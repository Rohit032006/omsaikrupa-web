import { Router, Response } from 'express';
import { db } from '../database/init';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50').all(req.user!.id);
    return res.json(notifications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user!.id);
    return res.json({ message: 'Marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user!.id);
    return res.json({ message: 'All marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/unread-count', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user!.id) as any;
    return res.json({ count: result.count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
