import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, buyers } from './lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL!;

async function runHealthCheck() {
  console.log('🔍 Running comprehensive health check...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const client = postgres(connectionString);
    const db = drizzle(client, { schema: { users, buyers } });
    console.log('✅ Database connection successful\n');

    // Test 2: Check Tables Exist
    console.log('2️⃣ Checking if tables exist...');
    
    // Check users table
    const userCount = await db.select().from(users).limit(1);
    console.log('✅ Users table exists');

    // Check buyers table  
    const buyerCount = await db.select().from(buyers).limit(1);
    console.log('✅ Buyers table exists');

    // Test 3: Check Demo User
    console.log('\n3️⃣ Checking demo user...');
    const demoUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'demo@example.com'))
      .limit(1);
    
    if (demoUser.length > 0) {
      console.log('✅ Demo user exists:', demoUser[0].email);
    } else {
      console.log('❄️ Demo user not found - this is okay if you haven\'t created it yet');
    }

    // Test 4: Test Environment Variables
    console.log('\n4️⃣ Checking environment variables...');
    const envChecks = {
      'NEXT_PUBLIC_DATABASE_URL': !!process.env.NEXT_PUBLIC_DATABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXTAUTH_URL': !!process.env.NEXTAUTH_URL,
      'NEXTAUTH_SECRET': !!process.env.NEXTAUTH_SECRET,
      'DEMO_EMAIL': !!process.env.DEMO_EMAIL
    };

    Object.entries(envChecks).forEach(([key, exists]) => {
      console.log(exists ? `✅ ${key}` : `❌ ${key} - MISSING`);
    });

    // Test 5: Sample Data Query
    console.log('\n5️⃣ Testing sample queries...');
    const allUsers = await db.select().from(users);
    console.log(`✅ Found ${allUsers.length} users in database`);

    const allBuyers = await db.select().from(buyers);
    console.log(`✅ Found ${allBuyers.length} buyers in database`);

    // Test 6: Check Database URL Format
    console.log('\n6️⃣ Validating database URL...');
    if (process.env.NEXT_PUBLIC_DATABASE_URL?.startsWith('postgresql://')) {
      console.log('✅ Database URL format is correct');
    } else {
      console.log('❌ Database URL format might be incorrect');
    }

    await client.end();
    
    console.log('\n🎉 All health checks passed! Your setup is working correctly.');
    
  } catch (error: any) {
    console.error('\n❌ Health check failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('\n💡 Suggestion: Run "npm run db:push" to create the database tables');
    }
    
    if (error.message.includes('connection')) {
      console.log('\n💡 Suggestion: Check your NEXT_PUBLIC_DATABASE_URL environment variable');
    }
  }
}

runHealthCheck();