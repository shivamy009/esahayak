'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { createBuyerSchema } from '@/lib/validations/buyer';

interface QuickAddFormProps {
  onSuccess?: () => void;
}

export function QuickAddForm({ onSuccess }: QuickAddFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Chandigarh' as const,
    propertyType: 'Apartment' as const,
    purpose: 'Buy' as const,
    timeline: '0-3m' as const,
    source: 'Website' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = createBuyerSchema.parse(formData);

      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          city: 'Chandigarh',
          propertyType: 'Apartment',
          purpose: 'Buy',
          timeline: '0-3m',
          source: 'Website',
        });
        setIsOpen(false);
        onSuccess?.();
      } else {
        if (result.details) {
          const newErrors: Record<string, string> = {};
          result.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: result.error || 'Something went wrong' });
        }
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: 'Validation failed' });
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
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Quick Add Buyer
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quick Add Buyer</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-red-600 text-sm">{errors.general}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
              {errors.fullName && (
                <span className="text-red-600 text-sm">{errors.fullName}</span>
              )}
            </div>

            <div>
              <Input
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
              {errors.phone && (
                <span className="text-red-600 text-sm">{errors.phone}</span>
              )}
            </div>

            <div>
              <Input
                placeholder="Email (optional)"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && (
                <span className="text-red-600 text-sm">{errors.email}</span>
              )}
            </div>

            <div>
              <Select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <Select
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Office">Office</option>
                <option value="Retail">Retail</option>
              </Select>
            </div>

            <div>
              <Select
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
              >
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Buyer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}