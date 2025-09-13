import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BuyerService } from '@/lib/services/buyer';
import { updateBuyerSchema } from '@/lib/validations/buyer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await BuyerService.getBuyerById(params.id);
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updatedAt, ...updateData } = updateBuyerSchema.parse(body);

    if (!updatedAt) {
      return NextResponse.json({ error: 'updatedAt is required for concurrency control' }, { status: 400 });
    }

    const userId = session.user.email === 'demo@example.com' 
      ? '00000000-0000-0000-0000-000000000001' 
      : session.user.email;
    const buyer = await BuyerService.updateBuyer(params.id, updateData, userId, updatedAt);
    return NextResponse.json(buyer);
  } catch (error: any) {
    console.error('Error updating buyer:', error);
    
    if (error.message.includes('modified by another user')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    if (error.message.includes('only edit your own')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error.errors) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email === 'demo@example.com' 
      ? '00000000-0000-0000-0000-000000000001' 
      : session.user.email;
    await BuyerService.deleteBuyer(params.id, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting buyer:', error);
    
    if (error.message.includes('only delete your own')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}