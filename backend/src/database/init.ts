import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

let client: Client;

if (tursoUrl && tursoToken) {
  client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
} else {
  const DB_PATH = process.env.DB_PATH || './data/omsaikrupa.db';
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  client = createClient({
    url: `file:${path.resolve(DB_PATH)}`,
  });
}

export { client };

export const db = {
  prepare: (sql: string) => ({
    get: async (...args: any[]) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const res = await client.execute({ sql, args: params });
      return res.rows[0] ? (res.rows[0] as Record<string, any>) : undefined;
    },
    all: async (...args: any[]) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const res = await client.execute({ sql, args: params });
      return res.rows as Record<string, any>[];
    },
    run: async (...args: any[]) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const res = await client.execute({ sql, args: params });
      return {
        changes: res.rowsAffected,
        lastInsertRowid: res.lastInsertRowid ? Number(res.lastInsertRowid) : 0,
      };
    },
  }),
  exec: async (sql: string) => {
    await client.executeMultiple(sql);
  },
};

export async function initDatabase() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      profilePhoto TEXT,
      address TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      licenseNumber TEXT NOT NULL,
      licenseExpiry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicleName TEXT NOT NULL,
      vehicleNumber TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      vehicleType TEXT NOT NULL,
      driverId TEXT REFERENCES drivers(id),
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      baseFare REAL NOT NULL DEFAULT 0,
      pickupLocation TEXT,
      dropLocation TEXT,
      features TEXT NOT NULL DEFAULT '[]',
      imageUrl TEXT,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      bookingId TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL REFERENCES users(id),
      vehicleId TEXT NOT NULL REFERENCES vehicles(id),
      travelDate TEXT NOT NULL,
      pickupLocation TEXT NOT NULL,
      dropLocation TEXT NOT NULL,
      pickupTime TEXT NOT NULL,
      flightNumber TEXT,
      flightTime TEXT,
      tripType TEXT NOT NULL DEFAULT 'LOCAL',
      passengerCount INTEGER NOT NULL DEFAULT 1,
      totalAmount REAL NOT NULL,
      paidAmount REAL NOT NULL DEFAULT 0,
      remainingAmount REAL NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'PENDING',
      bookingStatus TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booking_seats (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      seatNumber TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS passengers (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      seatNumber TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      specialRequirement TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id),
      userId TEXT NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'UPI',
      utrNumber TEXT,
      paymentDate TEXT NOT NULL DEFAULT (datetime('now')),
      screenshotUrl TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      verifiedBy TEXT REFERENCES users(id),
      verifiedAt TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id),
      driverId TEXT REFERENCES drivers(id),
      vehicleId TEXT REFERENCES vehicles(id),
      startTime TEXT,
      endTime TEXT,
      startOdometer REAL,
      endOdometer REAL,
      tollCharges REAL DEFAULT 0,
      parkingCharges REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'SCHEDULED',
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      isRead INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      companyName TEXT NOT NULL DEFAULT 'Om Sai Travels',
      logo TEXT,
      upiId TEXT NOT NULL DEFAULT '8080959502@kotakbank',
      merchantName TEXT NOT NULL DEFAULT 'Om Sai Travels',
      supportPhone TEXT DEFAULT '+91 8080959502',
      supportEmail TEXT DEFAULT 'omsaikrupa@gmail.com',
      companyAddress TEXT DEFAULT 'Shop No. 4, Sai Complex, Airport Road, Pune - 411032',
      cancellationRules TEXT DEFAULT '{}',
      minBookingAdvanceHours INTEGER DEFAULT 2,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Default settings row if not present
  await client.execute({
    sql: `INSERT OR IGNORE INTO settings (id, companyName, upiId, merchantName, supportPhone, supportEmail, companyAddress, minBookingAdvanceHours)
          VALUES ('main', 'Om Sai Travels', ?, 'Om Sai Travels', '+91 8080959502', 'omsaikrupa@gmail.com', 'Shop No. 4, Sai Complex, Airport Road, Pune - 411032', 2)`,
    args: [process.env.DEFAULT_UPI_ID || '8080959502@kotakbank'],
  });

  // Seed demo data only if no users exist
  const userCount = await client.execute('SELECT COUNT(*) as count FROM users');
  if (Number(userCount.rows[0]?.count || 0) === 0) {
    console.log('Seeding initial admin user...');
    const adminId = uuidv4();
    await client.execute({
      sql: `INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [adminId, 'Admin User', 'admin@omsaikrupa.com', '8080959502', bcrypt.hashSync('Admin@123', 12), 'ADMIN', 'ACTIVE'],
    });
  }

  console.log('✅ Database initialized successfully');
}
