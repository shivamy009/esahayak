'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createBuyerSchema, type CreateBuyerData } from '@/lib/validations/buyer';
import toast from 'react-hot-toast';

interface BuyerFormProps {
  initialData?: Partial<CreateBuyerData>;
  buyerId?: string;
  mode?: 'create' | 'edit';
}

export function BuyerForm({ initialData, buyerId, mode = 'create' }: BuyerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateBuyerData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    city: initialData?.city || 'Chandigarh',
    propertyType: initialData?.propertyType || 'Apartment',
    bhk: initialData?.bhk || undefined,
    purpose: initialData?.purpose || 'Buy',
    budgetMin: initialData?.budgetMin || undefined,
    budgetMax: initialData?.budgetMax || undefined,
    timeline: initialData?.timeline || '0-3m',
    source: initialData?.source || 'Website',
    status: initialData?.status || 'New',
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
  });

  const [newTag, setNewTag] = useState('');

  const handleChange = (field: keyof CreateBuyerData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate data
      const validatedData = createBuyerSchema.parse(formData);

      const url = mode === 'edit' ? `/api/buyers/${buyerId}` : '/api/buyers';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const requestData = mode === 'edit' 
        ? { ...validatedData, updatedAt: (initialData as any)?.updatedAt }
        : validatedData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(mode === 'edit' ? 'Buyer updated successfully!' : 'Buyer created successfully!');
        router.push('/buyers');
      } else {
        if (response.status === 409) {
          toast.error('This record has been modified by another user. Please refresh and try again.');
          return;
        }
        
        if (result.details) {
          const fieldErrors: Record<string, string> = {};
          result.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              fieldErrors[error.path[0]] = error.message;
            }
          });
          setErrors(fieldErrors);
          toast.error('Please fix the form errors and try again.');
        } else {
          toast.error(result.error || 'Failed to save buyer');
        }
      }
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the form errors and try again.');
      } else {
        toast.error('Failed to save buyer');
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresBhk = ['Apartment', 'Villa'].includes(formData.propertyType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <Link href="/buyers">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buyers
          </Button>
        </Link>
      </div>

      {/* Basic Information Card */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Personal Information</h3>
              <p className="text-blue-100 text-sm mt-1">Basic details about the buyer</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-white to-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter buyer's full name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                required
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter 10-15 digit phone number"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address (optional)"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                required
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </Select>
              {errors.city && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.city}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Requirements Card */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Property Requirements</h3>
              <p className="text-green-100 text-sm mt-1">Buyer's property preferences and requirements</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-white to-green-50">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Property Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.propertyType}
                onChange={(e) => handleChange('propertyType', e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 py-3"
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Office">Office</option>
                <option value="Retail">Retail</option>
              </Select>
              {errors.propertyType && (
                <p className="text-sm text-red-600 mt-1">{errors.propertyType}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                BHK Configuration {requiresBhk && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={formData.bhk || ''}
                onChange={(e) => handleChange('bhk', e.target.value || undefined)}
                className={`border-gray-300 focus:border-green-500 focus:ring-green-500 py-3 ${!requiresBhk ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required={requiresBhk}
                disabled={!requiresBhk}
              >
                <option value="">Select BHK</option>
                <option value="Studio">Studio</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
              </Select>
              {errors.bhk && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.bhk}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Purpose <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 py-3"
                required
              >
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.purpose}
                </p>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-800">Budget Range</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Minimum Budget (₹)</label>
                <Input
                  type="number"
                  value={formData.budgetMin || ''}
                  onChange={(e) => handleChange('budgetMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 5000000"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 py-3"
                />
                {errors.budgetMin && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.budgetMin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Maximum Budget (₹)</label>
                <Input
                  type="number"
                  value={formData.budgetMax || ''}
                  onChange={(e) => handleChange('budgetMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 7000000"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 py-3"
                />
                {errors.budgetMax && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.budgetMax}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Additional Information</h3>
              <p className="text-purple-100 text-sm mt-1">Timeline, source, and other details</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-white to-purple-50">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Purchase Timeline <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 py-3"
                required
              >
                <option value="0-3m">0-3 months</option>
                <option value="3-6m">3-6 months</option>
                <option value=">6m">&gt;6 months</option>
                <option value="Exploring">Just Exploring</option>
              </Select>
              {errors.timeline && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.timeline}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Lead Source <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 py-3"
                required
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Call">Phone Call</option>
                <option value="Other">Other</option>
              </Select>
              {errors.source && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.source}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Current Status</label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 py-3"
              >
                <option value="New">New</option>
                <option value="Qualified">Qualified</option>
                <option value="Contacted">Contacted</option>
                <option value="Visited">Visited</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Dropped">Dropped</option>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-800">Tags & Labels</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a custom tag (e.g., VIP, Urgent, Hot Lead)"
                  className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 py-3"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  variant="outline"
                  className="px-6 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Add Tag
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-800">Additional Notes</h4>
            </div>
            
            <div className="space-y-2">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes, comments, or special requirements about this buyer..."
                rows={5}
                maxLength={1000}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Optional: Additional information about the buyer</span>
                <span className={`${formData.notes && formData.notes.length > 900 ? 'text-red-500' : ''}`}>
                  {(formData.notes || '').length}/1000 characters
                </span>
              </div>
              {errors.notes && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-end gap-4">
          <Link href="/buyers">
            <Button 
              type="button" 
              variant="outline"
              className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'edit' ? 'Update Buyer' : 'Create Buyer'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}