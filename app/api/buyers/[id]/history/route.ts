import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BuyerService } from '@/lib/services/buyer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await BuyerService.getBuyerHistory(params.id);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching buyer history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}