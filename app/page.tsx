'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if database is configured
    if (typeof window !== 'undefined') {
      // This check will be done on the client side
      const isDatabaseConfigured = process.env.NEXT_PUBLIC_DATABASE_CONFIGURED === 'true';
      
      if (!isDatabaseConfigured) {
        // For now, just proceed to signin as the check will happen server-side
      }
    }

    if (status === 'loading') return;
    
    if (session) {
      router.push('/buyers');
    } else {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">eSahayak</h1>
          <p className="text-gray-600">Initializing your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
