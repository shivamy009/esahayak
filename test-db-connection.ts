import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { buyers } from './lib/db/schema';

const connectionString = process.env.DATABASE_URL!;
console.log('Testing connection to:', connectionString.substring(0, 30) + '...');

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(client, { schema: { buyers } });

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic query
    const result = await db.select().from(buyers).limit(1);
    console.log('✅ Database connection successful!');
    console.log('Sample query result:', result.length > 0 ? 'Found data' : 'No data (but connection works)');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await client.end();
  }
}

testConnection();