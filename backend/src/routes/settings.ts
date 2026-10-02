import { Router, Response } from 'express';
import { db } from '../database/init';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const settings = (await db.prepare('SELECT * FROM settings WHERE id = ?').get('main')) as any;
    if (!settings) return res.json({});
    // Don't expose sensitive info to public
    const { upiId, merchantName, companyName, supportPhone, supportEmail, companyAddress } = settings;
    return res.json({ companyName, merchantName, upiId, supportPhone, supportEmail, companyAddress });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/admin', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    return res.json(await db.prepare('SELECT * FROM settings WHERE id = ?').get('main'));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, upiId, merchantName, supportPhone, supportEmail, companyAddress, minBookingAdvanceHours } = req.body;
    await db.prepare(`UPDATE settings SET companyName=?, upiId=?, merchantName=?, supportPhone=?, supportEmail=?, companyAddress=?, minBookingAdvanceHours=?, updatedAt=datetime('now') WHERE id='main'`).run(
      companyName, upiId, merchantName, supportPhone, supportEmail, companyAddress, minBookingAdvanceHours || 2
    );
    return res.json(await db.prepare('SELECT * FROM settings WHERE id = ?').get('main'));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
