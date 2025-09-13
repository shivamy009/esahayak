'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function DatabaseError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Database Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The application requires a properly configured database connection.
          </p>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Create a Supabase account at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
              <li>Create a new project</li>
              <li>Get your database credentials</li>
              <li>Update the <code className="bg-yellow-100 px-1 rounded">.env</code> file with your actual values</li>
              <li>Run <code className="bg-yellow-100 px-1 rounded">npm run db:push</code> to create tables</li>
              <li>Restart the development server</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Required Environment Variables:</h4>
            <code className="text-xs text-gray-600 block whitespace-pre-wrap">
{`DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DEMO_EMAIL=demo@example.com`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}