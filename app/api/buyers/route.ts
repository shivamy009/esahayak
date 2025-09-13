import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BuyerService } from '@/lib/services/buyer';
import { createBuyerSchema, buyerFilterSchema } from '@/lib/validations/buyer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = buyerFilterSchema.parse({
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
      page: searchParams.get('page') || '1',
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const userId = session.user.email === 'demo@example.com' 
      ? '00000000-0000-0000-0000-000000000001' 
      : session.user.email;
    const result = await BuyerService.getBuyers(filters, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching buyers:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      envVars: {
        hasDbUrl: !!process.env.NEXT_PUBLIC_DATABASE_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
    if (error.message?.includes('NEXT_PUBLIC_DATABASE_URL')) {
      return NextResponse.json({ 
        error: 'Database not configured. Please check your environment variables.',
        details: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please check server logs'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBuyerSchema.parse(body);

    // Use a fixed UUID for demo user, or the user's email for others
    const userId = session.user.email === 'demo@example.com' 
      ? '00000000-0000-0000-0000-000000000001' 
      : session.user.email;
    const buyer = await BuyerService.createBuyer(validatedData, userId);
    return NextResponse.json(buyer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating buyer:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      envVars: {
        hasDbUrl: !!process.env.NEXT_PUBLIC_DATABASE_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
    if (error.message?.includes('NEXT_PUBLIC_DATABASE_URL')) {
      return NextResponse.json({ 
        error: 'Database not configured. Please check your environment variables.',
        details: error.message
      }, { status: 503 });
    }
    
    if (error.errors) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please check server logs'
    }, { status: 500 });
  }
}