'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BuyersList } from '@/components/buyers/buyers-list';
import { BuyersFilters } from '@/components/buyers/buyers-filters';
import { ImportExportActions } from '@/components/buyers/import-export-actions';
import { QuickAddForm } from '@/components/buyers/quick-add-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function BuyersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Buyer Management
              </h1>
              <p className="mt-2 text-gray-600">
                Track and manage your property buyer leads efficiently
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <ImportExportActions />
              <Link href="/buyers/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Add Form */}
          <QuickAddForm onSuccess={() => window.location.reload()} />
          
          {/* Filters */}
          <BuyersFilters />
          
          {/* Buyers List */}
          <BuyersList />
        </div>
      </div>
    </div>
  );
}