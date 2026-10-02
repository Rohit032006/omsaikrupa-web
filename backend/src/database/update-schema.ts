import { client } from './init';

async function updateSchema() {
  console.log('Updating schema in Turso...');

  // Create otps table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ Created otps table');

  // Add columns to vehicles if not exist
  try {
    await client.execute('ALTER TABLE vehicles ADD COLUMN pickupLocation TEXT;');
    console.log('✅ Added pickupLocation column');
  } catch (e: any) {
    console.log('pickupLocation column exists or skipped');
  }

  try {
    await client.execute('ALTER TABLE vehicles ADD COLUMN dropLocation TEXT;');
    console.log('✅ Added dropLocation column');
  } catch (e: any) {
    console.log('dropLocation column exists or skipped');
  }

  // Set default sample routes for vehicles
  await client.execute("UPDATE vehicles SET pickupLocation = 'Pune Airport', dropLocation = 'Koregaon Park / Hinjawadi' WHERE capacity = 5;");
  await client.execute("UPDATE vehicles SET pickupLocation = 'Pune', dropLocation = 'Mumbai Airport' WHERE capacity = 6;");
  await client.execute("UPDATE vehicles SET pickupLocation = 'Swargate, Pune', dropLocation = 'Shirdi' WHERE capacity = 14;");
  await client.execute("UPDATE vehicles SET pickupLocation = 'Pune', dropLocation = 'Mahabaleshwar / Goa' WHERE capacity = 17;");
  await client.execute("UPDATE vehicles SET pickupLocation = 'Pune', dropLocation = 'Outstation / All India' WHERE capacity = 20;");

  // Update company name in settings table to Om Sai Travels
  await client.execute("UPDATE settings SET companyName = 'Om Sai Travels', merchantName = 'Om Sai Travels' WHERE id = 'main';");
  console.log('✅ Updated settings to Om Sai Travels in Turso');

  const v = await client.execute('SELECT vehicleName, pickupLocation, dropLocation FROM vehicles');
  console.log('Vehicles with routes in Turso:', v.rows);
}

updateSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
