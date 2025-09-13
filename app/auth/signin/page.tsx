'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Home, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left side - Hero section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                eSahayak
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Buyer Management Hub
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Streamline your real estate buyer management with powerful tools and insights.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Manage buyer leads efficiently</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Track buyer preferences & budgets</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Secure data management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 lg:w-1/2">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  eSahayak
                </h1>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Access your buyer management dashboard
              </p>
            </div>

            {/* Sign in card */}
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-blue-500/10">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl text-center font-semibold text-gray-900">
                  Welcome Back
                </CardTitle>
                <p className="text-center text-gray-500">
                  Continue to your dashboard
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Demo access • No registration required
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>© 2025 eSahayak. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}