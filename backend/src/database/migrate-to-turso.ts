import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbPath = path.resolve(__dirname, '../../data/omsaikrupa.db');
const localDb = new Database(dbPath);

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://omsaikrupa-rohit032006.aws-ap-south-1.turso.io';
const tursoToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5MTUxNjksImlkIjoiMDFhMGZhNzMtZTAwMS03YTY2LWJlZWYtN2QzZjA0ZWVlYWQ1Iiwia2lkIjoiYjlRSnZ1c3RoeUJkbHQ3Sk1pYndxLV8yUXFBSjBXUEU1a2d0Q1FhX0w3WSIsInJpZCI6IjEyOTA5Njc3LWQ3MmUtNDQ2NS05N2ExLTM4MGZlZDkyMDkxMiJ9.FZSrdqSg9piG45tEu0oXhYT6zfXdWX58fJj6W1aYqUFIlsdN2UKmoz_AeBR3V9l0135b9uRiTsLUgyGochv7DQ';

const turso = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function migrate() {
  console.log('🚀 Starting migration to Turso Cloud (Mumbai)...');

  // 1. Get all table creation DDLs
  const tables = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string; sql: string }[];

  for (const t of tables) {
    if (t.sql) {
      console.log(`Creating table: ${t.name}`);
      await turso.execute(t.sql);
    }
  }

  // 2. Migrate data
  for (const t of tables) {
    const rows = localDb.prepare(`SELECT * FROM ${t.name}`).all() as Record<string, any>[];
    console.log(`Migrating table ${t.name}: ${rows.length} records`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${t.name} (${keys.join(', ')}) VALUES (${placeholders})`;
      await turso.execute({ sql, args: Object.values(row) });
    }
  }

  console.log('✅ Verifying data in Turso Cloud...');
  const users = await turso.execute('SELECT email, name FROM users');
  const vehicles = await turso.execute('SELECT vehicleName, vehicleNumber FROM vehicles');
  const bookings = await turso.execute('SELECT bookingId, travelDate FROM bookings');

  console.log('Users in Turso:', users.rows);
  console.log('Vehicles count:', vehicles.rows.length);
  console.log('Bookings in Turso:', bookings.rows);
  console.log('🎉 Migration to Turso successfully completed!');
}

migrate().catch((err) => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
