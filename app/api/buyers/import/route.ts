import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BuyerService } from '@/lib/services/buyer';
import { parseCsvFile } from '@/lib/utils/csv';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const { validData, errors } = await parseCsvFile(file);

    if (validData.length === 0 && errors.length > 0) {
      return NextResponse.json({ 
        error: 'No valid data found',
        validCount: 0,
        errorCount: errors.length,
        errors 
      }, { status: 400 });
    }

    if (validData.length > 200) {
      return NextResponse.json({ 
        error: 'Maximum 200 rows allowed',
        validCount: validData.length,
        errorCount: errors.length,
        errors 
      }, { status: 400 });
    }

    let createdBuyers = [];
    if (validData.length > 0) {
      const userId = session.user.email === 'demo@example.com' 
        ? '00000000-0000-0000-0000-000000000001' 
        : session.user.email;
      createdBuyers = await BuyerService.createBuyersFromCsv(validData, userId);
    }

    return NextResponse.json({
      success: true,
      createdCount: createdBuyers.length,
      validCount: validData.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      createdBuyers,
    });
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}