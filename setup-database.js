const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function setupDatabase() {
  const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;
  
  if (!connectionString) {
    console.error('NEXT_PUBLIC_DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('Creating enums...');
    
    // Create enums first
    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'city') THEN
          CREATE TYPE city AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
          CREATE TYPE property_type AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bhk') THEN
          CREATE TYPE bhk AS ENUM ('1', '2', '3', '4', 'Studio');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purpose') THEN
          CREATE TYPE purpose AS ENUM ('Buy', 'Rent');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'timeline') THEN
          CREATE TYPE timeline AS ENUM ('0-3m', '3-6m', '>6m', 'Exploring');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source') THEN
          CREATE TYPE source AS ENUM ('Website', 'Referral', 'Walk-in', 'Call', 'Other');
        END IF;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
          CREATE TYPE status AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');
        END IF;
      END $$;
    `;

    console.log('Creating users table...');
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    console.log('Creating buyers table...');
    await client`
      CREATE TABLE IF NOT EXISTS buyers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(80) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(15) NOT NULL,
        city city NOT NULL,
        property_type property_type NOT NULL,
        bhk bhk,
        purpose purpose NOT NULL,
        budget_min INTEGER,
        budget_max INTEGER,
        timeline timeline NOT NULL,
        source source NOT NULL,
        status status DEFAULT 'New' NOT NULL,
        notes TEXT,
        tags JSONB DEFAULT '[]',
        owner_id UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    console.log('Creating buyer_history table...');
    await client`
      CREATE TABLE IF NOT EXISTS buyer_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
        changed_by UUID NOT NULL REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT NOW() NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT
      );
    `;

    console.log('Creating demo user...');
    await client`
      INSERT INTO users (id, email, name, role)
      VALUES ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `;

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();