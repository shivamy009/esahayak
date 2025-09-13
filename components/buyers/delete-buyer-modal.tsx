'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import type { Buyer } from '@/lib/db/schema';

interface DeleteBuyerModalProps {
  buyer: Buyer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteBuyerModal({ buyer, isOpen, onClose, onSuccess }: DeleteBuyerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Small delay to ensure server processes the deletion
        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete buyer');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Delete Buyer
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete this buyer? This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  <span className="text-gray-900">{buyer.fullName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>{' '}
                  <span className="text-gray-900">{buyer.phone}</span>
                </div>
                {buyer.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    <span className="text-gray-900">{buyer.email}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Property:</span>{' '}
                  <span className="text-gray-900">
                    {buyer.propertyType} in {buyer.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Warning:</p>
                  <p>This will permanently remove the buyer and all associated history from the system.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Buyer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}