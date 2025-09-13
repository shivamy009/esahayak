'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  IndianRupee, 
  Calendar, 
  User, 
  Tag,
  Clock,
  FileText,
  TrendingUp,
  Star
} from 'lucide-react';
import { EditBuyerModal } from '@/components/buyers/edit-buyer-modal';
import { DeleteBuyerModal } from '@/components/buyers/delete-buyer-modal';
import Link from 'next/link';
import type { Buyer } from '@/lib/db/schema';

interface BuyerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBuyer();
    }
  }, [status, resolvedParams.id]);

  const fetchBuyer = async () => {
    try {
      const response = await fetch(`/api/buyers/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch buyer');
      }
      const data = await response.json();
      setBuyer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading buyer details...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 font-medium text-lg mb-2">Error Loading Buyer</div>
                <p className="text-red-700 mb-4">{error}</p>
                <Link href="/buyers">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Buyers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-gray-600 font-medium text-lg mb-2">Buyer Not Found</div>
                <p className="text-gray-500 mb-4">The buyer you're looking for doesn't exist.</p>
                <Link href="/buyers">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Buyers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Link href="/buyers">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Buyers
                </Button>
              </Link>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md px-6"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Buyer
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    {buyer.fullName}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className={`${getStatusColor(buyer.status)} font-medium px-4 py-2 text-sm`}>
                      {buyer.status}
                    </Badge>
                    <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                      ID: {buyer.id.slice(0, 8)}...
                    </span>
                    <span className="text-blue-600 text-sm font-medium">
                      {buyer.purpose} • {buyer.propertyType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card className="lg:col-span-2 shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90"></div>
                <CardTitle className="flex items-center gap-3 text-white relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Contact Information</h3>
                    <p className="text-blue-100 text-sm font-normal mt-1">Get in touch with the buyer</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="space-y-6">
                  {/* Phone Contact */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative bg-white p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group-hover:transform group-hover:scale-105">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Phone className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Phone Number</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-bold text-gray-900 text-xl">{buyer.phone}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              onClick={() => window.open(`tel:${buyer.phone}`, '_self')}
                            >
                              <Phone className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">Click to call</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Contact */}
                  {buyer.email && (
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="relative bg-white p-6 rounded-2xl shadow-md border border-green-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 group-hover:transform group-hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                              <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Email Address</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="font-bold text-gray-900 text-lg break-all">{buyer.email}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-green-100 flex-shrink-0"
                                onClick={() => window.open(`mailto:${buyer.email}`, '_self')}
                              >
                                <Mail className="w-4 h-4 text-green-600" />
                              </Button>
                            </div>
                            <p className="text-xs text-green-600 mt-1">Click to email</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Info */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative bg-white p-6 rounded-2xl shadow-md border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group-hover:transform group-hover:scale-105">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Location</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-bold text-gray-900 text-xl">{buyer.city}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-purple-100"
                              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(buyer.city)}`, '_blank')}
                            >
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </Button>
                          </div>
                          <p className="text-xs text-purple-600 mt-1">View on map</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Quick Actions</h4>
                      <p className="text-sm text-gray-600">Contact the buyer directly</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => window.open(`tel:${buyer.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      {buyer.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                          onClick={() => window.open(`mailto:${buyer.email}`, '_self')}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buyer Status & Timeline */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  Status & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Star className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Current Status</p>
                      <div className="mt-1">
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${getStatusColor(buyer.status)}`}>
                          {buyer.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Purchase Timeline</p>
                      <p className="font-semibold text-gray-900 text-xl">{buyer.timeline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Lead Source</p>
                      <p className="font-semibold text-gray-900 text-lg capitalize">{buyer.source}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Property Requirements */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Home className="w-5 h-5 text-indigo-600" />
                  </div>
                  Property Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <p className="text-sm text-gray-600 font-medium mb-2">Property Type</p>
                    <p className="font-semibold text-gray-900 text-lg">{buyer.propertyType}</p>
                  </div>
                  
                  {buyer.bhk && (
                    <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <p className="text-sm text-gray-600 font-medium mb-2">Configuration</p>
                      <p className="font-semibold text-gray-900 text-lg">{buyer.bhk} BHK</p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <p className="text-sm text-gray-600 font-medium mb-2">Purpose</p>
                    <p className="font-semibold text-gray-900 text-lg">{buyer.purpose}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Budget Range</span>
                  </div>
                  <p className="font-bold text-green-700 text-xl">
                    {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {buyer.tags && buyer.tags.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {buyer.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium border border-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Record Created</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{formatDate(buyer.createdAt)}</p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Last Updated</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{formatDate(buyer.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {buyer.notes && (
            <Card className="mt-6 shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  Notes & Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">{buyer.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditBuyerModal
          buyer={buyer}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchBuyer();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteBuyerModal
          buyer={buyer}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            try {
              setShowDeleteModal(false);
              // Use replace instead of push to avoid navigation stack issues
              router.replace('/buyers');
            } catch (error) {
              console.error('Navigation error after delete:', error);
              // Fallback navigation
              window.location.href = '/buyers';
            }
          }}
        />
      )}
    </>
  );
}