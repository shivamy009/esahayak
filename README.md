# eSahayak - Buyer Management System

A comprehensive buyer management system built with Next.js, Supabase, Drizzle ORM, and NextAuth.js for real estate professionals.

## Features

### Core Functionality
- **Buyer Management**: Create, read, update, and delete buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email with filters for city, property type, status, and timeline
- **Pagination**: Server-side pagination with 10 records per page
- **CSV Import/Export**: Bulk import up to 200 buyers with validation, export filtered results
- **Change History**: Track all changes made to buyer records
- **Concurrency Control**: Prevent conflicts when multiple users edit the same record

### Data Model
- **Buyers Table**: Complete buyer information including contact details, property preferences, budget, and status
- **User Management**: Authentication and authorization
- **History Tracking**: Detailed change logs for all buyer modifications

### Authentication
- **Magic Link Login**: Secure email-based authentication
- **Demo Login**: Quick access for testing purposes
- **Role-based Access**: Users can only edit their own buyers (admin can edit all)

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **UI Components**: Custom components with Lucide React icons

## Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- Git (optional)

### 1. Environment Setup

Update the `.env` file with your actual values:

```env
# Database
NEXT_PUBLIC_DATABASE_URL=your_supabase_NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY

# Auth
NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_NEXTAUTH_SECRET=your_NEXT_PUBLIC_NEXTAUTH_SECRET_key

# Demo login
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
```

### 2. Database Setup

First, run the database migration:

```bash
npm run db:push
```

This will create all the necessary tables in your Supabase database.

### 3. Install Dependencies (Already Done)

The dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Go to Settings > Database
4. Copy the Connection String (URI format) for `NEXT_PUBLIC_DATABASE_URL`
5. Go to Settings > API
6. Copy the Project URL for `NEXT_PUBLIC_SUPABASE_URL`
7. Copy the anon/public key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Usage Guide

### 1. Authentication
- Visit `http://localhost:3000`
- Click "Demo Login" for immediate access, or
- Enter your email for a magic link login

### 2. Managing Buyers

#### Creating a New Buyer
1. Click "Add Buyer" button
2. Fill in the required fields:
   - Full Name (required)
   - Phone (required, 10-15 digits)
   - City (required)
   - Property Type (required)
   - BHK (required for Apartment/Villa)
   - Purpose (required)
   - Timeline (required)
   - Source (required)
3. Optional fields: Email, Budget range, Status, Notes, Tags
4. Click "Create Buyer"

#### Searching and Filtering
- Use the search bar to find buyers by name, phone, or email
- Apply filters for City, Property Type, Status, and Timeline
- Results update automatically with debounced search
- Clear all filters with the "Clear All" button

#### Viewing Buyer Details
- Click the eye icon in the Actions column
- View complete buyer information and change history

#### Editing Buyers
- Click the edit icon in the Actions column
- Modify any field and save changes
- Concurrency protection prevents conflicts

### 3. Import/Export

#### CSV Import
1. Click "Import" button
2. Download the sample CSV to see the required format
3. Upload your CSV file (max 200 rows)
4. Review validation errors and successful imports
5. Only valid rows are imported

#### CSV Export
1. Apply any filters you want
2. Click "Export" button
3. All filtered results are exported to CSV

#### CSV Format
Required columns:
```
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
```

Example:
```csv
John Doe,john@example.com,9876543210,Chandigarh,Apartment,3,Buy,5000000,8000000,0-3m,Website,"Looking for 3BHK","vip;urgent",New
```

## Data Validation Rules

### Required Fields
- Full Name (2-80 characters)
- Phone (10-15 digits, numeric only)
- City (must be one of: Chandigarh, Mohali, Zirakpur, Panchkula, Other)
- Property Type (Apartment, Villa, Plot, Office, Retail)
- Purpose (Buy, Rent)
- Timeline (0-3m, 3-6m, >6m, Exploring)
- Source (Website, Referral, Walk-in, Call, Other)

### Conditional Requirements
- BHK is required for Apartment and Villa property types
- Budget Max must be ≥ Budget Min when both are provided

### Optional Fields
- Email (must be valid if provided)
- Budget Min/Max (positive integers)
- Notes (max 1000 characters)
- Tags (array of strings)
- Status (defaults to "New")

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Database
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)

# Production
npm run build        # Build for production
npm run start        # Start production server
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your `NEXT_PUBLIC_DATABASE_URL` is correct
   - Ensure your Supabase project is active
   - Check if you've run `npm run db:push`

2. **Authentication Issues**
   - Verify `NEXT_PUBLIC_NEXTAUTH_SECRET` is set
   - Check `NEXT_PUBLIC_NEXTAUTH_URL` matches your domain
   - For magic links, ensure email provider is configured

3. **Import/Export Issues**
   - CSV must have exact column headers
   - Ensure proper data types (numbers for budget fields)
   - Check enum values match exactly

## Architecture

The application follows a clean architecture with:
- Next.js App Router for routing and API
- Drizzle ORM for type-safe database operations
- Zod for validation schemas
- NextAuth.js for authentication
- Tailwind CSS for styling
- TypeScript for type safety

## Contributing

This is a demo application built for specific requirements. The codebase is clean and well-structured for easy understanding and modification.
