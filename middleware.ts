import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Let the pages handle their own authentication
  // This avoids Edge Runtime compatibility issues with NextAuth
  return NextResponse.next();
}

export const config = {
  matcher: ['/buyers/:path*'],
};
