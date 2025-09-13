'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Loader2 } from 'lucide-react';
import { updateBuyerSchema } from '@/lib/validations/buyer';
import type { Buyer } from '@/lib/db/schema';
import toast from 'react-hot-toast';

interface EditBuyerModalProps {
  buyer: Buyer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBuyerModal({ buyer, isOpen, onClose, onSuccess }: EditBuyerModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: buyer.fullName || '',
    phone: buyer.phone || '',
    email: buyer.email || '',
    city: buyer.city || 'Chandigarh',
    propertyType: buyer.propertyType || 'Apartment',
    bhk: buyer.bhk || '',
    purpose: buyer.purpose || 'Buy',
    budgetMin: buyer.budgetMin || '',
    budgetMax: buyer.budgetMax || '',
    timeline: buyer.timeline || '0-3m',
    source: buyer.source || 'Website',
    status: buyer.status || 'New',
    notes: buyer.notes || '',
    tags: buyer.tags || [],
    updatedAt: buyer.updatedAt instanceof Date ? buyer.updatedAt.toISOString() : buyer.updatedAt,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const dataToValidate = {
        ...formData,
        budgetMin: formData.budgetMin && formData.budgetMin !== '' ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax && formData.budgetMax !== '' ? Number(formData.budgetMax) : undefined,
        bhk: formData.bhk && formData.bhk !== '' ? formData.bhk : undefined,
        email: formData.email && formData.email !== '' ? formData.email : undefined,
        notes: formData.notes && formData.notes !== '' ? formData.notes : undefined,
      };
      
      const validatedData = updateBuyerSchema.parse(dataToValidate);

      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Buyer updated successfully!');
        onSuccess();
        onClose();
      } else {
        if (result.details) {
          const newErrors: Record<string, string> = {};
          result.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
          toast.error('Please fix the form errors and try again.');
        } else {
          toast.error(result.error || 'Something went wrong');
          setErrors({ general: result.error || 'Something went wrong' });
        }
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const fieldName = err.path[0] || 'general';
          newErrors[fieldName] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix the form errors and try again.');
      } else if (error.message) {
        toast.error(error.message);
        setErrors({ general: error.message });
      } else {
        toast.error('Validation failed. Please check your input.');
        setErrors({ general: 'Validation failed. Please check your input.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Client-side validation for BHK requirement
    if (field === 'propertyType') {
      if (['Apartment', 'Villa'].includes(value) && (!formData.bhk || formData.bhk === '')) {
        setErrors(prev => ({ ...prev, bhk: 'BHK is required for Apartment and Villa properties' }));
      } else if (!['Apartment', 'Villa'].includes(value) && errors.bhk) {
        setErrors(prev => ({ ...prev, bhk: '' }));
      }
    }

    if (field === 'bhk' && ['Apartment', 'Villa'].includes(formData.propertyType)) {
      if (!value || value === '') {
        setErrors(prev => ({ ...prev, bhk: 'BHK is required for Apartment and Villa properties' }));
      } else {
        setErrors(prev => ({ ...prev, bhk: '' }));
      }
    }

    // Client-side validation for budget range
    if (field === 'budgetMin' || field === 'budgetMax') {
      const min = field === 'budgetMin' ? Number(value) : Number(formData.budgetMin);
      const max = field === 'budgetMax' ? Number(value) : Number(formData.budgetMax);
      
      if (min && max && min > max) {
        setErrors(prev => ({ ...prev, budgetMax: 'Budget maximum must be greater than or equal to budget minimum' }));
      } else if (errors.budgetMax) {
        setErrors(prev => ({ ...prev, budgetMax: '' }));
      }
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
            Edit Buyer Details
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.fullName && (
                  <span className="text-red-600 text-sm mt-1">{errors.fullName}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.phone && (
                  <span className="text-red-600 text-sm mt-1">{errors.phone}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.email && (
                  <span className="text-red-600 text-sm mt-1">{errors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Zirakpur">Zirakpur</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Other">Other</option>
                </Select>
                {errors.city && (
                  <span className="text-red-600 text-sm mt-1">{errors.city}</span>
                )}
              </div>
            </div>
          </div>

          {/* Property Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Property Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </Select>
                {errors.propertyType && (
                  <span className="text-red-600 text-sm mt-1">{errors.propertyType}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK {(['Apartment', 'Villa'].includes(formData.propertyType)) && <span className="text-red-500">*</span>}
                </label>
                <Select
                  value={formData.bhk}
                  onChange={(e) => handleInputChange('bhk', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required={['Apartment', 'Villa'].includes(formData.propertyType)}
                >
                  <option value="">Select BHK</option>
                  <option value="Studio">Studio</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                </Select>
                {errors.bhk && (
                  <span className="text-red-600 text-sm mt-1">{errors.bhk}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </Select>
                {errors.purpose && (
                  <span className="text-red-600 text-sm mt-1">{errors.purpose}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Min (₹)
                </label>
                <Input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 5000000"
                />
                {errors.budgetMin && (
                  <span className="text-red-600 text-sm mt-1">{errors.budgetMin}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Max (₹)
                </label>
                <Input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 7000000"
                />
                {errors.budgetMax && (
                  <span className="text-red-600 text-sm mt-1">{errors.budgetMax}</span>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="0-3m">0-3 months</option>
                  <option value="3-6m">3-6 months</option>
                  <option value=">6m">6+ months</option>
                  <option value="Exploring">Just exploring</option>
                </Select>
                {errors.timeline && (
                  <span className="text-red-600 text-sm mt-1">{errors.timeline}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Call">Call</option>
                  <option value="Other">Other</option>
                </Select>
                {errors.source && (
                  <span className="text-red-600 text-sm mt-1">{errors.source}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                  <span className="text-red-600 text-sm mt-1">{errors.status}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., urgent, first-time-buyer, premium"
              />
              {errors.tags && (
                <span className="text-red-600 text-sm mt-1">{errors.tags}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional notes about the buyer..."
              />
              {errors.notes && (
                <span className="text-red-600 text-sm mt-1">{errors.notes}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Buyer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
