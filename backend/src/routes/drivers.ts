import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/drivers - All drivers (admin)
router.get('/', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const drivers = await db.prepare(`
      SELECT d.*, v.vehicleName, v.vehicleNumber FROM drivers d
      LEFT JOIN vehicles v ON v.driverId = d.id
    `).all();
    return res.json(drivers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/drivers/available - Available drivers
router.get('/available', authenticate, async (_req, res: Response) => {
  try {
    const drivers = await db.prepare("SELECT * FROM drivers WHERE status = 'AVAILABLE'").all();
    return res.json(drivers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/drivers/:id
router.get('/:id', authenticate, async (req, res: Response) => {
  try {
    const driver = await db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    return res.json(driver);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/drivers - Admin: Add driver
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, licenseNumber, licenseExpiry } = req.body;
    if (!name || !mobile || !licenseNumber || !licenseExpiry) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const id = uuidv4();
    await db.prepare('INSERT INTO drivers (id, name, mobile, licenseNumber, licenseExpiry, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, name, mobile, licenseNumber, licenseExpiry, 'AVAILABLE'
    );
    return res.status(201).json(await db.prepare('SELECT * FROM drivers WHERE id = ?').get(id));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/drivers/:id
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, licenseNumber, licenseExpiry, status } = req.body;
    await db.prepare('UPDATE drivers SET name=?, mobile=?, licenseNumber=?, licenseExpiry=?, status=? WHERE id=?').run(
      name, mobile, licenseNumber, licenseExpiry, status, req.params.id
    );
    return res.json(await db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await db.prepare('DELETE FROM drivers WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Driver deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
