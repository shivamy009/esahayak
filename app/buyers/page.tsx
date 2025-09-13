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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buyers</h1>
              <p className="mt-2 text-gray-600">Manage your buyer leads</p>
            </div>
            <div className="flex gap-4 items-center">
              <ImportExportActions />
              <Link href="/buyers/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BuyersFilters />
          <QuickAddForm onSuccess={() => window.location.reload()} />
          <BuyersList />
        </div>
      </div>
    </div>
  );
}