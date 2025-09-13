import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BuyerService } from '@/lib/services/buyer';
import { buyerFilterSchema } from '@/lib/validations/buyer';
import { generateCsvContent } from '@/lib/utils/csv';

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
      page: '1', // Start from first page for export
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    // Get all buyers matching the filters (not paginated for export)
    const userId = session.user.email === 'demo@example.com' 
      ? '00000000-0000-0000-0000-000000000001' 
      : session.user.email;
    const result = await BuyerService.getBuyers({ ...filters, page: 1 }, userId);
    
    // For export, we need to get all pages
    const allBuyers = [];
    const totalPages = result.totalPages;
    
    for (let page = 1; page <= totalPages; page++) {
      const pageResult = await BuyerService.getBuyers({ ...filters, page }, userId);
      allBuyers.push(...pageResult.buyers);
    }

    const csvContent = generateCsvContent(allBuyers);
    
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
