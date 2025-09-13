import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: any;
let isDbConfigured: () => boolean;

if (!process.env.DATABASE_URL || 
    process.env.DATABASE_URL === 'your_supabase_database_url' || 
    process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
  
  console.warn('DATABASE_URL is not properly configured. Using mock database for demo purposes.');
  
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
  const client = postgres(process.env.DATABASE_URL);
  db = drizzle(client, { schema });
  isDbConfigured = () => true;
}

export { db, isDbConfigured };