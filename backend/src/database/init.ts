import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './data/omsaikrupa.db';
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: DatabaseInstance = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
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
      features TEXT NOT NULL DEFAULT '[]',
      imageUrl TEXT,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL UNIQUE,
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
      totalAmount REAL NOT NULL DEFAULT 0,
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
      UNIQUE(bookingId, seatNumber)
    );

    CREATE TABLE IF NOT EXISTS passengers (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      seatNumber TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      specialRequirement TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL REFERENCES bookings(id),
      userId TEXT NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'UPI',
      utrNumber TEXT,
      transactionId TEXT,
      screenshotUrl TEXT,
      paymentDate TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      verifiedBy TEXT REFERENCES users(id),
      verifiedAt TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      bookingId TEXT REFERENCES bookings(id),
      vehicleId TEXT NOT NULL REFERENCES vehicles(id),
      driverId TEXT REFERENCES drivers(id),
      date TEXT NOT NULL,
      pickup TEXT NOT NULL,
      dropLocation TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      status TEXT NOT NULL DEFAULT 'SCHEDULED',
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
      companyName TEXT NOT NULL DEFAULT 'Om Sai Krupa',
      logo TEXT,
      upiId TEXT NOT NULL DEFAULT '8080959502@kotakbank',
      merchantName TEXT NOT NULL DEFAULT 'Om Sai Krupa',
      supportPhone TEXT DEFAULT '+91 8080959502',
      supportEmail TEXT DEFAULT 'omsaikrupa@gmail.com',
      companyAddress TEXT DEFAULT 'Pune, Maharashtra, India',
      cancellationRules TEXT DEFAULT '{}',
      minBookingAdvanceHours INTEGER DEFAULT 2,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed or update default settings
  const settingsRow = db.prepare('SELECT id FROM settings WHERE id = ?').get('main');
  if (!settingsRow) {
    db.prepare(`
      INSERT INTO settings (id, upiId, supportPhone, supportEmail) 
      VALUES ('main', '8080959502@kotakbank', '+91 8080959502', 'omsaikrupa@gmail.com')
    `).run();
  } else {
    db.prepare(`
      UPDATE settings 
      SET upiId = '8080959502@kotakbank', supportPhone = '+91 8080959502', supportEmail = 'omsaikrupa@gmail.com' 
      WHERE id = 'main'
    `).run();
  }

  // Seed demo data
  seedDemoData();

  console.log('✅ Database initialized successfully');
}

function seedDemoData() {
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('ADMIN');
  if (adminExists) return;

  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  // Admin user
  const adminId = uuidv4();
  db.prepare(`INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    adminId, 'Admin User', 'admin@omsaikrupa.com', '9000000000',
    bcrypt.hashSync('Admin@123', 12), 'ADMIN', 'ACTIVE'
  );

  // Demo users
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  db.prepare(`INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    user1Id, 'Rahul Sharma', 'rahul@example.com', '9876543210',
    bcrypt.hashSync('User@123', 12), 'USER', 'ACTIVE'
  );
  db.prepare(`INSERT INTO users (id, name, email, mobile, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    user2Id, 'Priya Patel', 'priya@example.com', '9876543211',
    bcrypt.hashSync('User@123', 12), 'USER', 'ACTIVE'
  );

  // Demo drivers
  const driver1Id = uuidv4();
  const driver2Id = uuidv4();
  const driver3Id = uuidv4();
  db.prepare(`INSERT INTO drivers (id, name, mobile, licenseNumber, licenseExpiry, status) VALUES (?, ?, ?, ?, ?, ?)`).run(
    driver1Id, 'Ramesh Kumar', '9111111111', 'MH12AB1234', '2028-12-31', 'AVAILABLE'
  );
  db.prepare(`INSERT INTO drivers (id, name, mobile, licenseNumber, licenseExpiry, status) VALUES (?, ?, ?, ?, ?, ?)`).run(
    driver2Id, 'Suresh Patil', '9111111112', 'MH12CD5678', '2027-06-30', 'AVAILABLE'
  );
  db.prepare(`INSERT INTO drivers (id, name, mobile, licenseNumber, licenseExpiry, status) VALUES (?, ?, ?, ?, ?, ?)`).run(
    driver3Id, 'Vijay Singh', '9111111113', 'MH12EF9012', '2029-03-31', 'AVAILABLE'
  );

  // Demo vehicles
  const v1Id = uuidv4();
  const v2Id = uuidv4();
  const v3Id = uuidv4();
  const v4Id = uuidv4();
  const v5Id = uuidv4();

  const vehicles = [
    { id: v1Id, name: 'Swift Dzire', number: 'MH12AB1001', capacity: 5, type: 'SEDAN', driver: driver1Id, fare: 1200, features: JSON.stringify(['AC', 'Comfortable Seats', 'Experienced Driver', 'Luggage Space', 'GPS Tracking']) },
    { id: v2Id, name: 'Innova Crysta', number: 'MH12AB1002', capacity: 6, type: 'SUV', driver: driver2Id, fare: 1800, features: JSON.stringify(['AC', 'Comfortable Seats', 'Experienced Driver', 'Large Luggage Space', 'GPS Tracking', 'USB Charging']) },
    { id: v3Id, name: 'Tempo Traveller', number: 'MH12AB1003', capacity: 14, type: 'MINIVAN', driver: driver3Id, fare: 3500, features: JSON.stringify(['AC', 'Push-Back Seats', 'Experienced Driver', 'Luggage Carrier', 'GPS Tracking', 'Music System']) },
    { id: v4Id, name: 'Luxury Traveller', number: 'MH12AB1004', capacity: 17, type: 'MINIBUS', driver: null, fare: 4500, features: JSON.stringify(['AC', 'Reclining Seats', 'Experienced Driver', 'Luggage Carrier', 'GPS Tracking', 'Music System', 'Reading Lights']) },
    { id: v5Id, name: 'Deluxe Coach', number: 'MH12AB1005', capacity: 20, type: 'MINIBUS', driver: null, fare: 5500, features: JSON.stringify(['AC', 'Premium Seats', 'Experienced Driver', 'Overhead Luggage', 'GPS Tracking', 'Entertainment System', 'USB Charging', 'Reading Lights']) },
  ];

  for (const v of vehicles) {
    db.prepare(`INSERT INTO vehicles (id, vehicleName, vehicleNumber, capacity, vehicleType, driverId, status, baseFare, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      v.id, v.name, v.number, v.capacity, v.type, v.driver, 'AVAILABLE', v.fare, v.features
    );
  }

  // Demo booking
  const bookingId = uuidv4();
  const bookingRef = 'OSK-2026-00001';
  db.prepare(`INSERT INTO bookings (id, bookingId, userId, vehicleId, travelDate, pickupLocation, dropLocation, pickupTime, tripType, passengerCount, totalAmount, paidAmount, remainingAmount, paymentStatus, bookingStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    bookingId, bookingRef, user1Id, v3Id, '2026-10-15', 'Pune Airport', 'Koregaon Park, Pune', '14:30', 'AIRPORT_PICKUP', 3, 10500, 5000, 5500, 'PARTIAL', 'CONFIRMED'
  );

  const seat1Id = uuidv4();
  const seat2Id = uuidv4();
  const seat3Id = uuidv4();
  db.prepare(`INSERT INTO booking_seats (id, bookingId, seatNumber) VALUES (?, ?, ?)`).run(seat1Id, bookingId, '04');
  db.prepare(`INSERT INTO booking_seats (id, bookingId, seatNumber) VALUES (?, ?, ?)`).run(seat2Id, bookingId, '05');
  db.prepare(`INSERT INTO booking_seats (id, bookingId, seatNumber) VALUES (?, ?, ?)`).run(seat3Id, bookingId, '06');

  const p1Id = uuidv4();
  const p2Id = uuidv4();
  const p3Id = uuidv4();
  db.prepare(`INSERT INTO passengers (id, bookingId, seatNumber, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(p1Id, bookingId, '04', 'Rahul Sharma', '9876543210', 35, 'MALE');
  db.prepare(`INSERT INTO passengers (id, bookingId, seatNumber, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(p2Id, bookingId, '05', 'Sunita Sharma', '9876543210', 32, 'FEMALE');
  db.prepare(`INSERT INTO passengers (id, bookingId, seatNumber, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(p3Id, bookingId, '06', 'Arjun Sharma', '9876543210', 8, 'MALE');

  const payId = uuidv4();
  db.prepare(`INSERT INTO payments (id, bookingId, userId, amount, method, utrNumber, paymentDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    payId, bookingId, user1Id, 5000, 'UPI', 'UTR123456789012', '2026-10-02', 'VERIFIED'
  );

  console.log('✅ Demo data seeded successfully');
  console.log('📧 Admin: admin@omsaikrupa.com / Admin@123');
  console.log('👤 User: rahul@example.com / User@123');
}
