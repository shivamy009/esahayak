import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_DATABASE_URL',
    'NEXTAUTH_SECRET',
  ];

  const missing = requiredEnvVars.filter(key => {
    const value = process.env[key];
    return !value || value.startsWith('your_') || value === '';
  });

  const configured = missing.length === 0;

  return NextResponse.json({
    configured,
    missing,
    status: configured ? 'ready' : 'needs_configuration',
  });
}