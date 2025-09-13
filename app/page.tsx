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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">eSahayak</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
