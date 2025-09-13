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
        router.push('/buyers');
      } else {
        if (response.status === 409) {
          alert('This record has been modified by another user. Please refresh and try again.');
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
        } else {
          alert(result.error || 'Failed to save buyer');
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
      } else {
        alert('Failed to save buyer');
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresBhk = ['Apartment', 'Villa'].includes(formData.propertyType);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href="/buyers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Buyers
              </Button>
            </Link>
            <CardTitle>
              {mode === 'edit' ? 'Edit Buyer' : 'Create New Buyer'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter full name"
                required
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number (10-15 digits)"
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </Select>
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.propertyType}
                onChange={(e) => handleChange('propertyType', e.target.value)}
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

            <div>
              <label className="block text-sm font-medium mb-1">
                BHK {requiresBhk && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={formData.bhk || ''}
                onChange={(e) => handleChange('bhk', e.target.value || undefined)}
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
                <p className="text-sm text-red-600 mt-1">{errors.bhk}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Purpose <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
              >
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Min (₹)</label>
              <Input
                type="number"
                value={formData.budgetMin || ''}
                onChange={(e) => handleChange('budgetMin', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Minimum budget"
              />
              {errors.budgetMin && (
                <p className="text-sm text-red-600 mt-1">{errors.budgetMin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Budget Max (₹)</label>
              <Input
                type="number"
                value={formData.budgetMax || ''}
                onChange={(e) => handleChange('budgetMax', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Maximum budget"
              />
              {errors.budgetMax && (
                <p className="text-sm text-red-600 mt-1">{errors.budgetMax}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Timeline <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                required
              >
                <option value="0-3m">0-3 months</option>
                <option value="3-6m">3-6 months</option>
                <option value=">6m">&gt;6 months</option>
                <option value="Exploring">Exploring</option>
              </Select>
              {errors.timeline && (
                <p className="text-sm text-red-600 mt-1">{errors.timeline}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Source <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                required
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Call">Call</option>
                <option value="Other">Other</option>
              </Select>
              {errors.source && (
                <p className="text-sm text-red-600 mt-1">{errors.source}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
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
                <p className="text-sm text-red-600 mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes (max 1000 characters)"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(formData.notes || '').length}/1000 characters
            </div>
            {errors.notes && (
              <p className="text-sm text-red-600 mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/buyers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Buyer' : 'Create Buyer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}