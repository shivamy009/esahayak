import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, just allow all requests to pass through
  // Once NextAuth is working, we can add proper authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/buyers/:path*'],
};
