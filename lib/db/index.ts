import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: any;
let isDbConfigured: () => boolean;

if (!process.env.NEXT_PUBLIC_DATABASE_URL || 
    process.env.NEXT_PUBLIC_DATABASE_URL === 'your_supabase_database_url' || 
    process.env.NEXT_PUBLIC_DATABASE_URL.includes('[YOUR-PASSWORD]')) {
  
  console.warn('NEXT_PUBLIC_DATABASE_URL is not properly configured. Using mock database for demo purposes.');
  
  // Create a mock database object for demo purposes
  db = {
    insert: () => ({ 
      values: () => ({ 
        returning: () => Promise.resolve([{ 
          id: 'demo-id', 
          fullName: 'Demo User',
          phone: '1234567890',
          email: 'demo@example.com',
          city: 'Chandigarh',
          propertyType: 'Apartment',
          purpose: 'Buy',
          timeline: '0-3m',
          source: 'Website',
          status: 'New',
          ownerId: 'demo-user-id',
          createdAt: new Date(),
          updatedAt: new Date()
        }]) 
      }) 
    }),
    select: () => ({ 
      from: () => ({ 
        leftJoin: () => ({ 
          where: () => ({ 
            orderBy: () => ({ 
              limit: () => ({ 
                offset: () => Promise.resolve([]) 
              }) 
            }) 
          }) 
        }) 
      }) 
    }),
    query: {
      buyers: {
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([])
      }
    },
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => Promise.resolve() }),
    transaction: (fn: Function) => fn({
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 'demo-id' }]) }) }),
    })
  };
  
  isDbConfigured = () => false;
} else {
  try {
    console.log('Initializing database connection with URL:', process.env.NEXT_PUBLIC_DATABASE_URL?.substring(0, 30) + '...');
    const client = postgres(process.env.NEXT_PUBLIC_DATABASE_URL!);
    db = drizzle(client, { schema });
    isDbConfigured = () => true;
    console.log('Database connection initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
}

export { db, isDbConfigured };