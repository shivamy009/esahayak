'use client';

import { useSession } from 'next-auth/react';
import { ProfileDropdown } from '@/components/auth/profile-dropdown';
import Link from 'next/link';

export function NavigationHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                eSahayak
              </div>
            </Link>
          </div>

          {/* Navigation Links - Only show when authenticated */}
          {session && (
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/buyers" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Buyers
              </Link>
              <Link 
                href="/buyers/new" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Buyer
              </Link>
            </nav>
          )}

          {/* Profile Dropdown or Welcome Message */}
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-4">
                <div className="text-gray-600 text-sm">
                  Welcome to eSahayak
                </div>
                <div className="text-xs text-gray-400">
                  Click signIn Button to get started
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}