'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export function BuyersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    city: searchParams?.get('city') || '',
    propertyType: searchParams?.get('propertyType') || '',
    status: searchParams?.get('status') || '',
    timeline: searchParams?.get('timeline') || '',
  });

  const [searchDebounce, setSearchDebounce] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    const query = params.toString();
    router.push(`/buyers${query ? `?${query}` : ''}`, { scroll: false });
  }, [filters, router]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      propertyType: '',
      status: '',
      timeline: '',
    });
    setSearchDebounce('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, phone, email..."
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <Select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Mohali">Mohali</option>
              <option value="Zirakpur">Zirakpur</option>
              <option value="Panchkula">Panchkula</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div>
            <Select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Visited">Visited</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Converted">Converted</option>
              <option value="Dropped">Dropped</option>
            </Select>
          </div>

          {/* Timeline Filter */}
          <div>
            <Select
              value={filters.timeline}
              onChange={(e) => handleFilterChange('timeline', e.target.value)}
            >
              <option value="">All Timelines</option>
              <option value="0-3m">0-3 months</option>
              <option value="3-6m">3-6 months</option>
              <option value=">6m">&gt;6 months</option>
              <option value="Exploring">Exploring</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}