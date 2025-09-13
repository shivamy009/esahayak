import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

async function migrateDatabase() {
  const client = postgres(connectionString);
  
  try {
    console.log('Starting database migration...');

    // Step 1: Drop foreign key constraints
    console.log('Dropping foreign key constraints...');
    try {
      await client`ALTER TABLE buyers DROP CONSTRAINT IF EXISTS buyers_owner_id_users_id_fk;`;
      await client`ALTER TABLE buyer_history DROP CONSTRAINT IF EXISTS buyer_history_changed_by_users_id_fk;`;
    } catch (error) {
      console.log('Some constraints may not exist, continuing...');
    }

    // Step 2: Modify column types
    console.log('Modifying owner_id column type...');
    await client`ALTER TABLE buyers ALTER COLUMN owner_id TYPE VARCHAR(255);`;
    
    console.log('Modifying changed_by column type...');
    await client`ALTER TABLE buyer_history ALTER COLUMN changed_by TYPE VARCHAR(255);`;

    // Step 3: Update existing data to use email instead of UUID
    console.log('Updating existing data...');
    await client`
      UPDATE buyers 
      SET owner_id = 'demo@example.com' 
      WHERE owner_id = '00000000-0000-0000-0000-000000000001';
    `;
    
    await client`
      UPDATE buyer_history 
      SET changed_by = 'demo@example.com' 
      WHERE changed_by = '00000000-0000-0000-0000-000000000001';
    `;

    // Step 4: Drop users table
    console.log('Dropping users table...');
    await client`DROP TABLE IF EXISTS users CASCADE;`;

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrateDatabase();
