import { csvBuyerSchema, type CsvBuyerData } from '@/lib/validations/buyer';

export interface CsvValidationError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

export interface CsvParseResult {
  validData: CsvBuyerData[];
  errors: CsvValidationError[];
}

export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  const text = await file.text();
  const errors: CsvValidationError[] = [];
  const validData: CsvBuyerData[] = [];

  try {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      try {
        // Simple CSV parsing (handles basic cases)
        const values = parseCSVLine(line);
        
        if (values.length !== headers.length) {
          errors.push({
            row: i + 1,
            message: `Expected ${headers.length} columns, got ${values.length}`,
            data: line,
          });
          continue;
        }

        // Create row object
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Validate row
        const validatedRow = csvBuyerSchema.parse(row);
        validData.push(validatedRow);
      } catch (error: any) {
        if (error.errors) {
          error.errors.forEach((err: any) => {
            errors.push({
              row: i + 1,
              field: err.path.join('.'),
              message: err.message,
              data: line,
            });
          });
        } else {
          errors.push({
            row: i + 1,
            message: error.message || 'Validation error',
            data: line,
          });
        }
      }
    }

    return { validData, errors };
  } catch (error: any) {
    return {
      validData: [],
      errors: [{
        row: 0,
        message: error.message || 'Failed to parse CSV file',
        data: '',
      }]
    };
  }
}

// Simple CSV line parser
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

export function generateCsvContent(buyers: any[]): string {
  if (buyers.length === 0) {
    return '';
  }

  const headers = [
    'fullName',
    'email',
    'phone',
    'city',
    'propertyType',
    'bhk',
    'purpose',
    'budgetMin',
    'budgetMax',
    'timeline',
    'source',
    'notes',
    'tags',
    'status',
    'createdAt',
    'updatedAt'
  ];

  const csvRows = [
    headers.join(','),
    ...buyers.map(buyer => 
      headers.map(header => {
        let value = buyer[header];
        
        if (header === 'tags' && Array.isArray(value)) {
          value = value.join(';');
        }
        
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}