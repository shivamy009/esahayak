import { z } from 'zod';

// Enums
export const cityEnum = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkEnum = z.enum(['1', '2', '3', '4', 'Studio']);
export const purposeEnum = z.enum(['Buy', 'Rent']);
export const timelineEnum = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);
export const sourceEnum = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusEnum = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// Buyer validation schema
export const buyerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be at most 80 characters'),
  email: z.union([z.string().email('Invalid email'), z.literal(''), z.undefined()]).transform(val => val === '' ? undefined : val),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional(),
  purpose: purposeEnum,
  budgetMin: z.union([z.number().int().positive(), z.literal(''), z.undefined()]).transform(val => val === '' ? undefined : val),
  budgetMax: z.union([z.number().int().positive(), z.literal(''), z.undefined()]).transform(val => val === '' ? undefined : val),
  timeline: timelineEnum,
  source: sourceEnum,
  status: statusEnum.default('New'),
  notes: z.union([z.string().max(1000, 'Notes must be at most 1000 characters'), z.literal(''), z.undefined()]).transform(val => val === '' ? undefined : val),
  tags: z.array(z.string()).default([]),
  updatedAt: z.string().optional(), // For concurrency control
}).refine((data) => {
  // BHK required for Apartment/Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa',
  path: ['bhk'],
}).refine((data) => {
  // Budget validation
  if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax'],
});

export const createBuyerSchema = buyerSchema.omit({ updatedAt: true });
export const updateBuyerSchema = buyerSchema;

// CSV import schema
export const csvBuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().regex(/^\d{10,15}$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional().or(z.literal('').transform(() => undefined)),
  purpose: purposeEnum,
  budgetMin: z.string().transform((val) => val === '' ? undefined : parseInt(val)).pipe(z.number().int().positive().optional()),
  budgetMax: z.string().transform((val) => val === '' ? undefined : parseInt(val)).pipe(z.number().int().positive().optional()),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional().or(z.literal('').transform(() => undefined)),
  tags: z.string().transform((val) => val ? val.split(',').map(t => t.trim()) : []),
  status: statusEnum.default('New'),
}).refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa',
}).refine((data) => {
  if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
});

// Filter schema for search and filtering
export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  city: cityEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  status: statusEnum.optional(),
  timeline: timelineEnum.optional(),
  page: z.string().transform((val) => parseInt(val) || 1).pipe(z.number().int().positive().default(1)),
  sortBy: z.enum(['updatedAt', 'createdAt', 'fullName']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BuyerFormData = z.infer<typeof buyerSchema>;
export type CreateBuyerData = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerData = z.infer<typeof updateBuyerSchema>;
export type CsvBuyerData = z.infer<typeof csvBuyerSchema>;
export type BuyerFilters = z.infer<typeof buyerFilterSchema>;