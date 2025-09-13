'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnvStatus {
  configured: boolean;
  missing: string[];
}

export function EnvironmentChecker() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setEnvStatus(data);
    } catch (error) {
      setEnvStatus({
        configured: false,
        missing: ['NEXT_PUBLIC_DATABASE_URL', 'NEXTAUTH_SECRET'],
      });
    }
  };

  const copyEnvTemplate = () => {
    const template = `# Database
NEXT_PUBLIC_DATABASE_URL=your_supabase_NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Demo login
DEMO_EMAIL=demo@example.com`;

    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!envStatus) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Checking environment...</div>
        </CardContent>
      </Card>
    );
  }

  if (envStatus.configured) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Environment Configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            All required environment variables are configured. The application is ready to use!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          Environment Configuration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-red-700">
          The following environment variables need to be configured:
        </p>
        
        <ul className="list-disc list-inside text-red-600 space-y-1">
          {envStatus.missing.map((key) => (
            <li key={key}><code className="bg-red-50 px-1 rounded">{key}</code></li>
          ))}
        </ul>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Quick Setup:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Copy the environment template below to your <code className="bg-yellow-100 px-1 rounded">.env</code> file</li>
            <li>Replace placeholder values with your actual Supabase credentials</li>
            <li>Generate a random secret for NEXTAUTH_SECRET: <code className="bg-yellow-100 px-1 rounded">node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code></li>
            <li>Run <code className="bg-yellow-100 px-1 rounded">npm run db:push</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Environment Template:</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyEnvTemplate}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`# Database
NEXT_PUBLIC_DATABASE_URL=your_supabase_NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Demo login
DEMO_EMAIL=demo@example.com`}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Getting Supabase Credentials:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a> and create an account</li>
            <li>Create a new project</li>
            <li>Go to Settings → Database → Connection string (URI format) for NEXT_PUBLIC_DATABASE_URL</li>
            <li>Go to Settings → API for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}