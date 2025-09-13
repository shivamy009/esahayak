import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      
      
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasDemoEmail: !!process.env.DEMO_EMAIL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      session: {
        exists: !!session,
        userEmail: session?.user?.email || 'none'
      }
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envInfo
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
