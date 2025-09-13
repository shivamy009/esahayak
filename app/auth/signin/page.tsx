'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('demo', {
        redirect: false,
      });

      if (result?.ok) {
        router.push('/buyers');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to eSahayak
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Buyer Management System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              <User className="w-4 h-4" />
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}