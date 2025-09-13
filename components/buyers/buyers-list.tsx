'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { EditBuyerModal } from './edit-buyer-modal';
import { DeleteBuyerModal } from './delete-buyer-modal';
import type { Buyer } from '@/lib/db/schema';
import Link from 'next/link';

interface BuyerWithOwner extends Buyer {
  ownerName?: string;
}

interface BuyersResponse {
  buyers: BuyerWithOwner[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export function BuyersList() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BuyersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editBuyer, setEditBuyer] = useState<BuyerWithOwner | null>(null);
  const [deleteBuyer, setDeleteBuyer] = useState<BuyerWithOwner | null>(null);

  const fetchBuyers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const response = await fetch(`/api/buyers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch buyers');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [searchParams]);

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Qualified': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Contacted': 'bg-amber-50 text-amber-700 border border-amber-200',
      'Visited': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Negotiation': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'Converted': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'Dropped': 'bg-red-50 text-red-700 border border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getPurposeIcon = (purpose: string) => {
    return purpose === 'Buy' ? '🏠' : '🏢';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading buyers...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.buyers.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No buyers found. {' '}
            <Link href="/buyers/new" className="text-blue-600 hover:underline">
              Create your first buyer
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPage = data.currentPage;
  const totalPages = data.totalPages;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Buyers</h2>
            <p className="text-gray-600 mt-1">
              {data.totalCount} total buyers • Page {data.currentPage} of {data.totalPages}
            </p>
          </div>
        </div>

        {/* Buyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.buyers.map((buyer) => (
            <Card key={buyer.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md bg-white">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {buyer.fullName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {buyer.phone}
                      </span>
                      {buyer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {buyer.email}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={`${getStatusColor(buyer.status)} font-medium px-2.5 py-1`}>
                    {buyer.status}
                  </Badge>
                </div>

                {/* Property Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {buyer.city}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-900">
                      {getPurposeIcon(buyer.purpose)}
                      {buyer.propertyType}
                      {buyer.bhk && <span className="text-gray-600">({buyer.bhk} BHK)</span>}
                    </span>
                  </div>

                  {(buyer.budgetMin || buyer.budgetMax) && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Timeline: {buyer.timeline}</span>
                  </div>
                </div>

                {/* Tags */}
                {buyer.tags && buyer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {buyer.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {buyer.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{buyer.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Updated {formatDate(buyer.updatedAt)}
                  </span>
                  
                  <div className="flex gap-1">
                    <Link href={`/buyers/${buyer.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditBuyer(buyer)}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteBuyer(buyer)}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <Link 
              href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(searchParams?.entries() || []), page: String(Math.max(1, currentPage - 1)) })}`}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" disabled={currentPage <= 1} className="px-4 py-2">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </Link>

            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Link 
              href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(searchParams?.entries() || []), page: String(Math.min(totalPages, currentPage + 1)) })}`}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" disabled={currentPage >= totalPages} className="px-4 py-2">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      {editBuyer && (
        <EditBuyerModal
          buyer={editBuyer}
          isOpen={!!editBuyer}
          onClose={() => setEditBuyer(null)}
          onSuccess={() => {
            setEditBuyer(null);
            fetchBuyers();
          }}
        />
      )}

      {deleteBuyer && (
        <DeleteBuyerModal
          buyer={deleteBuyer}
          isOpen={!!deleteBuyer}
          onClose={() => setDeleteBuyer(null)}
          onSuccess={() => {
            setDeleteBuyer(null);
            fetchBuyers();
          }}
        />
      )}
    </>
  );
}