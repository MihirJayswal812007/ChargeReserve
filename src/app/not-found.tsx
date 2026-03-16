'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 bg-zinc-950 min-h-[80vh]">
      <div className="space-y-4">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-900/40 rounded-full animate-ping opacity-75"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-blue-900/60 rounded-full text-blue-400">
            <MapPin className="w-10 h-10 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 font-mono bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 font-bold text-sm">
            404
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Station Not Found
        </h1>
        <p className="text-lg text-zinc-400 max-w-md mx-auto">
          We couldn&apos;t find the page or charging station you&apos;re looking for. It might have been moved or removed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/find">
            <Search className="w-4 h-4" />
            Find a Station
          </Link>
        </Button>
      </div>
    </main>
  );
}
