import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { AuthRequest, authenticate } from '../middleware/auth';
import { sendOtpEmail } from '../services/emailService';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res: Response) => {
  try {
    const { email, mobile, name } = req.body;
    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '').slice(-10);
    const cleanEmail = email ? email.trim().toLowerCase() : (cleanMobile ? `${cleanMobile}@omsaikrupa.com` : '');

    if (!cleanMobile && !cleanEmail) {
      return res.status(400).json({ error: 'Mobile number or email is required' });
    }

    // Hardcoded OTP: 9623
    const otp = '9623';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save to DB
    if (cleanEmail) {
      await db.prepare('DELETE FROM otps WHERE email = ?').run(cleanEmail);
      await db.prepare('INSERT INTO otps (id, email, otp, expiresAt) VALUES (?, ?, ?, ?)').run(
        uuidv4(),
        cleanEmail,
        otp,
        expiresAt
      );
      try {
        await sendOtpEmail(cleanEmail, otp, name || 'Customer');
      } catch (e) {}
    }

    const whatsappMessage = encodeURIComponent(`Om Sai Travels — Your login OTP is: 9623`);
    const whatsappUrl = cleanMobile ? `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${whatsappMessage}` : '';

    return res.json({ 
      message: 'OTP sent successfully',
      otp: '9623',
      whatsappUrl
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res: Response) => {
  try {
    const { email, mobile, otp, name } = req.body;
    const cleanOtp = (otp || '').toString().trim();
    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').toString().trim().toLowerCase() || (cleanMobile ? `${cleanMobile}@omsaikrupa.com` : 'user@omsaikrupa.com');

    if (!cleanOtp) {
      return res.status(400).json({ error: 'OTP code is required' });
    }

    // Hardcoded 9623 is ALWAYS valid
    const isHardcodedValid = cleanOtp === '9623';
    let isDbValid = false;

    if (!isHardcodedValid && cleanEmail) {
      const record = (await db.prepare('SELECT * FROM otps WHERE email = ? AND otp = ? ORDER BY createdAt DESC LIMIT 1').get(cleanEmail, cleanOtp)) as any;
      if (record && new Date(record.expiresAt).getTime() >= Date.now()) {
        isDbValid = true;
      }
    }

    if (!isHardcodedValid && !isDbValid) {
      return res.status(400).json({ error: 'Invalid OTP code. Please enter 9623.' });
    }

    // Clear used OTP
    if (cleanEmail) {
      await db.prepare('DELETE FROM otps WHERE email = ?').run(cleanEmail);
    }

    // Check if user exists by mobile or email
    let user: any = null;
    if (cleanMobile) {
      user = (await db.prepare('SELECT * FROM users WHERE mobile = ?').get(cleanMobile)) as any;
    }
    if (!user && cleanEmail) {
      user = (await db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail)) as any;
    }

    if (!user) {
      const id = uuidv4();
      const userName = name || (cleanMobile ? `User ${cleanMobile.slice(-4)}` : cleanEmail.split('@')[0]);
      const userEmail = cleanEmail || `${cleanMobile || id.slice(0,8)}@omsaikrupa.com`;
      const userMobile = cleanMobile || '9999999999';

      await db.prepare('INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        id,
        userName,
        userEmail,
        userMobile,
        '',
        'USER',
        'ACTIVE'
      );
      user = (await db.prepare('SELECT * FROM users WHERE id = ?').get(id)) as any;
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Account is blocked. Contact support.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    const { passwordHash, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register (backward compatibility)
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = (await db.prepare('SELECT id FROM users WHERE email = ? OR mobile = ?').get(email, mobile)) as any;
    if (existing) {
      return res.status(409).json({ error: 'Email or mobile already registered' });
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 12);
    await db.prepare('INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, name, email, mobile, passwordHash, 'USER', 'ACTIVE'
    );

    const user = (await db.prepare('SELECT id, name, email, mobile, role, status, createdAt FROM users WHERE id = ?').get(id)) as any;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.status(201).json({ token, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login (password login for Admin)
router.post('/login', async (req, res: Response) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ error: 'Email/mobile and password are required' });
    }

    const user = (await db.prepare('SELECT * FROM users WHERE email = ? OR mobile = ?').get(emailOrMobile, emailOrMobile)) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Account is blocked. Contact support.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { passwordHash, ...safeUser } = user;

    return res.json({ token, user: safeUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = (await db.prepare('SELECT id, name, email, mobile, role, status, profilePhoto, address, createdAt FROM users WHERE id = ?').get(req.user!.id)) as any;
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = (await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id)) as any;

    if (!bcrypt.compareSync(currentPassword, user.passwordHash || '')) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    await db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(newHash, req.user!.id);
    return res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
