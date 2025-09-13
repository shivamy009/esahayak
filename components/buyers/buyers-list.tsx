'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
  ownerName?: string;
}

interface BuyersResponse {
  buyers: Buyer[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export function BuyersList() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BuyersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Qualified': 'bg-purple-100 text-purple-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Visited': 'bg-orange-100 text-orange-800',
      'Negotiation': 'bg-indigo-100 text-indigo-800',
      'Converted': 'bg-green-100 text-green-800',
      'Dropped': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Buyers ({data.totalCount} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Property</th>
                  <th className="text-left p-4 font-medium">Budget</th>
                  <th className="text-left p-4 font-medium">Timeline</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Updated</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.buyers.map((buyer) => (
                  <tr key={buyer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{buyer.fullName}</div>
                        {buyer.email && (
                          <div className="text-sm text-gray-500">{buyer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{buyer.phone}</td>
                    <td className="p-4">{buyer.city}</td>
                    <td className="p-4">
                      <div>
                        <div>{buyer.propertyType}</div>
                        {buyer.bhk && (
                          <div className="text-sm text-gray-500">{buyer.bhk} BHK</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                    </td>
                    <td className="p-4">{buyer.timeline}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(buyer.status)}>
                        {buyer.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatDate(buyer.updatedAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/buyers/${buyer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/buyers/${buyer.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Link 
            href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(searchParams?.entries() || []), page: String(Math.max(1, currentPage - 1)) })}`}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" disabled={currentPage <= 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Link 
            href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(searchParams?.entries() || []), page: String(Math.min(totalPages, currentPage + 1)) })}`}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" disabled={currentPage >= totalPages}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}