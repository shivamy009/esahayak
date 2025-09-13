import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { buyers } from './lib/db/schema';

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL!;

async function testMigration() {
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('Testing migration...');
    
    // Test buyers query
    const buyerResults = await db.select().from(buyers).limit(5);
    console.log(`✅ Found ${buyerResults.length} buyers`);
    
    if (buyerResults.length > 0) {
      console.log('Sample buyer:', {
        name: buyerResults[0].fullName,
        ownerId: buyerResults[0].ownerId,
        city: buyerResults[0].city
      });
    }

    console.log('✅ Migration test passed!');

  } catch (error) {
    console.error('❌ Migration test failed:', error);
  } finally {
    await client.end();
  }
}

testMigration();