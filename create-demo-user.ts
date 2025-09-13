import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema: { users } });

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, '00000000-0000-0000-0000-000000000001'))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user with fixed UUID
    await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
    });

    console.log('Demo user created successfully');
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await client.end();
  }
}

createDemoUser();