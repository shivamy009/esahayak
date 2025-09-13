'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface CsvError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

interface ImportResult {
  success: boolean;
  createdCount: number;
  validCount: number;
  errorCount: number;
  errors?: CsvError[];
  createdBuyers?: any[];
}

interface ImportExportActionsProps {
  onImportSuccess?: () => void;
}

export function ImportExportActions({ onImportSuccess }: ImportExportActionsProps) {
  const searchParams = useSearchParams();
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportStatus('success');
        setImportResult(result);
        toast.success(`Successfully imported ${result.createdCount} buyers!`);
        // Call the callback to refresh the buyers list
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setImportStatus('error');
        setImportResult(result);
        toast.error('Import failed. Please check the errors and try again.');
      }
    } catch (error) {
      setImportStatus('error');
      setImportResult({
        success: false,
        createdCount: 0,
        validCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: 'Upload failed. Please try again.', data: {} }],
      });
      toast.error('Upload failed. Please try again.');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const response = await fetch(`/api/buyers/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buyers_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Buyers exported successfully!');
      } else {
        toast.error('Export failed. Please try again.');
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = [
      'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status',
      'John Doe,john@example.com,9876543210,Chandigarh,Apartment,3,Buy,5000000,8000000,0-3m,Website,"Looking for 3BHK in sector 22","vip;urgent",New',
      'Jane Smith,jane@example.com,9876543211,Mohali,Villa,4,Buy,10000000,15000000,3-6m,Referral,"Prefers independent house","family;spacious",Qualified'
    ].join('\n');
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowImportModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
          <Download className="w-4 h-4 mr-2" />
          {exportLoading ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Buyers from CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload CSV File</p>
                    <p className="text-gray-500 mb-4">Maximum 200 rows allowed</p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button variant="link" onClick={downloadSampleCsv}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample CSV
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Required columns:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, notes, tags, status
                    </code>
                  </div>
                </div>
              )}

              {importStatus === 'uploading' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Processing CSV file...</p>
                </div>
              )}

              {importStatus === 'success' && importResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Import Successful!</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{importResult.createdCount}</div>
                      <div className="text-sm text-green-700">Created</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{importResult.validCount}</div>
                      <div className="text-sm text-blue-700">Valid Rows</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{importResult.errorCount}</div>
                      <div className="text-sm text-red-700">Errors</div>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded mb-2">
                          <span className="font-medium">Row {error.row}:</span> {error.message}
                          {error.field && <span className="text-gray-600"> (Field: {error.field})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {importStatus === 'error' && importResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Import Failed</span>
                  </div>
                  
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded mb-2">
                          <span className="font-medium">Row {error.row}:</span> {error.message}
                          {error.field && <span className="text-gray-600"> (Field: {error.field})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStatus('idle');
                    setImportResult(null);
                  }}
                >
                  Close
                </Button>
                {(importStatus === 'success' || importStatus === 'error') && (
                  <Button onClick={() => {
                    setImportStatus('idle');
                    setImportResult(null);
                  }}>
                    Import Another File
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}