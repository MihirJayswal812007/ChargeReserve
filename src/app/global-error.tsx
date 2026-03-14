'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="bg-red-500/10 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Something went critically wrong!
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              An unexpected global error occurred. Please try reloading the page.
            </p>
          </div>

          <Button onClick={() => reset()} size="lg" className="gap-2 mt-4">
            <RefreshCcw className="w-4 h-4" />
            Reload Page
          </Button>
        </div>
      </body>
    </html>
  );
}
