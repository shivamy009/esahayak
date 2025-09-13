import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { buyers } from './lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function createSampleData() {
  try {
    console.log('Creating sample buyer data...');
    
    // Check if we already have data
    const existingBuyers = await db.select().from(buyers).limit(1);
    if (existingBuyers.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Create sample buyers for demo@example.com
    const sampleBuyers = [
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh' as const,
        propertyType: 'Apartment' as const,
        bhk: '2' as const,
        purpose: 'Buy' as const,
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: '0-3m' as const,
        source: 'Website' as const,
        status: 'New' as const,
        notes: 'Looking for a 2BHK apartment in Chandigarh',
        tags: ['urgent', 'first-time-buyer'],
        ownerId: 'demo@example.com',
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        city: 'Mohali' as const,
        propertyType: 'Villa' as const,
        bhk: '3' as const,
        purpose: 'Buy' as const,
        budgetMin: 8000000,
        budgetMax: 12000000,
        timeline: '3-6m' as const,
        source: 'Referral' as const,
        status: 'Qualified' as const,
        notes: 'Interested in luxury villas',
        tags: ['premium', 'investment'],
        ownerId: 'demo@example.com',
      }
    ];

    for (const buyer of sampleBuyers) {
      await db.insert(buyers).values(buyer);
      console.log(`Created buyer: ${buyer.fullName}`);
    }

    console.log('Sample data created successfully!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await client.end();
  }
}

createSampleData();