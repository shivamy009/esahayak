import { db } from '@/lib/db';
import { buyers, buyerHistory, users, type Buyer, type NewBuyer, type BuyerHistory } from '@/lib/db/schema';
import { eq, and, or, ilike, desc, asc, count } from 'drizzle-orm';
import { type BuyerFilters } from '@/lib/validations/buyer';

export class BuyerService {
  static async createBuyer(data: Omit<NewBuyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>, userId: string) {
    try {
      // Return mock data if database is not configured
      if (!process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL.includes('[YOUR-PASSWORD]')) {
        return {
          id: 'demo-buyer-' + Date.now(),
          ...data,
          ownerId: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      const [buyer] = await db.insert(buyers).values({
        ...data,
        ownerId: userId,
      }).returning();

      // Create history entry
      await this.createHistoryEntry(buyer.id, userId, { action: 'created', data: buyer });

      return buyer;
    } catch (error: any) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Database tables not found. Please run database migrations first.');
      }
      throw error;
    }
  }

  static async getBuyers(filters: BuyerFilters, userId?: string) {
    try {
      const page = filters.page || 1;
      const pageSize = 10;
      const offset = (page - 1) * pageSize;

      // Return mock data if database is not configured
      if (!process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL.includes('[YOUR-PASSWORD]')) {
        return {
          buyers: [{
            id: 'demo-buyer-1',
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
            ownerId: 'demo-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
            ownerName: 'Demo User'
          }],
          totalCount: 1,
          totalPages: 1,
          currentPage: 1
        };
      }

    const conditions = [];

    // Search
    if (filters.search) {
      conditions.push(
        or(
          ilike(buyers.fullName, `%${filters.search}%`),
          ilike(buyers.phone, `%${filters.search}%`),
          ilike(buyers.email, `%${filters.search}%`)
        )
      );
    }

    // Filters
    if (filters.city) {
      conditions.push(eq(buyers.city, filters.city));
    }
    if (filters.propertyType) {
      conditions.push(eq(buyers.propertyType, filters.propertyType));
    }
    if (filters.status) {
      conditions.push(eq(buyers.status, filters.status));
    }
    if (filters.timeline) {
      conditions.push(eq(buyers.timeline, filters.timeline));
    }

    const query = db.select({
      id: buyers.id,
      fullName: buyers.fullName,
      email: buyers.email,
      phone: buyers.phone,
      city: buyers.city,
      propertyType: buyers.propertyType,
      bhk: buyers.bhk,
      purpose: buyers.purpose,
      budgetMin: buyers.budgetMin,
      budgetMax: buyers.budgetMax,
      timeline: buyers.timeline,
      source: buyers.source,
      status: buyers.status,
      notes: buyers.notes,
      tags: buyers.tags,
      ownerId: buyers.ownerId,
      createdAt: buyers.createdAt,
      updatedAt: buyers.updatedAt,
      ownerName: users.name,
    }).from(buyers)
      .leftJoin(users, eq(buyers.ownerId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Sorting
    const sortField = filters.sortBy === 'fullName' ? buyers.fullName : 
                     filters.sortBy === 'createdAt' ? buyers.createdAt : buyers.updatedAt;
    const sortOrder = filters.sortOrder === 'asc' ? asc(sortField) : desc(sortField);

    const results = await query
      .orderBy(sortOrder)
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const [{ totalCount }] = await db.select({ totalCount: count() })
      .from(buyers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      buyers: results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
    } catch (error: any) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Database tables not found. Please run database migrations first.');
      }
      throw error;
    }
  }

  static async getBuyerById(id: string, userId?: string) {
    const buyer = await db.query.buyers.findFirst({
      where: eq(buyers.id, id),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return buyer;
  }

  static async updateBuyer(id: string, data: Partial<NewBuyer>, userId: string, currentUpdatedAt: string) {
    // Check for concurrency conflicts
    const existingBuyer = await db.query.buyers.findFirst({
      where: eq(buyers.id, id),
    });

    if (!existingBuyer) {
      throw new Error('Buyer not found');
    }

    if (existingBuyer.updatedAt.toISOString() !== currentUpdatedAt) {
      throw new Error('Record has been modified by another user. Please refresh and try again.');
    }

    // Check ownership
    if (existingBuyer.ownerId !== userId) {
      // Check if user is admin
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.role !== 'admin') {
        throw new Error('You can only edit your own buyers');
      }
    }

    const [updatedBuyer] = await db.update(buyers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(buyers.id, id))
      .returning();

    // Create history entry
    const changes = this.calculateChanges(existingBuyer, updatedBuyer);
    if (Object.keys(changes).length > 0) {
      await this.createHistoryEntry(id, userId, { action: 'updated', changes });
    }

    return updatedBuyer;
  }

  static async deleteBuyer(id: string, userId: string) {
    const existingBuyer = await db.query.buyers.findFirst({
      where: eq(buyers.id, id),
    });

    if (!existingBuyer) {
      throw new Error('Buyer not found');
    }

    // Check ownership
    if (existingBuyer.ownerId !== userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.role !== 'admin') {
        throw new Error('You can only delete your own buyers');
      }
    }

    // Simply delete the buyer - history entries will be cascaded due to foreign key constraint
    await db.delete(buyers).where(eq(buyers.id, id));
  }

  static async getBuyerHistory(buyerId: string, limit = 5) {
    const history = await db.query.buyerHistory.findMany({
      where: eq(buyerHistory.buyerId, buyerId),
      with: {
        changedByUser: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: desc(buyerHistory.changedAt),
      limit,
    });

    return history;
  }

  static async createBuyersFromCsv(buyersData: Omit<NewBuyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>[], userId: string) {
    return await db.transaction(async (tx: any) => {
      const createdBuyers = [];
      
      for (const buyerData of buyersData) {
        const [buyer] = await tx.insert(buyers).values({
          ...buyerData,
          ownerId: userId,
        }).returning();
        
        createdBuyers.push(buyer);
      }

      // Create history entries
      for (const buyer of createdBuyers) {
        await tx.insert(buyerHistory).values({
          buyerId: buyer.id,
          changedBy: userId,
          diff: { action: 'created_from_csv', data: buyer },
        });
      }

      return createdBuyers;
    });
  }

  private static async createHistoryEntry(buyerId: string, userId: string, diff: any) {
    await db.insert(buyerHistory).values({
      buyerId,
      changedBy: userId,
      diff,
    });
  }

  private static calculateChanges(oldBuyer: Buyer, newBuyer: Buyer) {
    const changes: Record<string, { old: any; new: any }> = {};
    
    const fieldsToTrack = [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
      'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 
      'status', 'notes', 'tags'
    ];

    for (const field of fieldsToTrack) {
      const oldValue = (oldBuyer as any)[field];
      const newValue = (newBuyer as any)[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = { old: oldValue, new: newValue };
      }
    }

    return changes;
  }
}