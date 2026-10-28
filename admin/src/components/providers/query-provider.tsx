// src/components/providers/query-provider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

// Dynamically import Devtools with SSR disabled to prevent Turbopack/React 19 hydration suppression
const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((mod) => ({
      default: mod.ReactQueryDevtools,
    })),
  { ssr: false }
);

function makeQueryClient(): QueryClient {
  return new QueryClient({
    
    defaultOptions: {
      queries: {
        // --- UX behavior ---
        refetchOnWindowFocus: false,   // academic search: data doesn't go stale that fast
        refetchOnReconnect: true,      // but DO catch up when the network returns

        // --- Caching ---
        staleTime: 1000 * 60 * 2,      // 2 min — fresh enough for search, avoids refetch storms
        gcTime: 1000 * 60 * 5,         // keep inactive cache 5 min (matches integration plan)

        // --- Retry policy ---
        // Don't burn time retrying client errors (4xx) — they fail identically.
        // Do retry once on network errors / 5xx / timeouts.
        retry: (failureCount, error) => {
          const status =
            error instanceof Error && 'statusCode' in error
              ? (error as { statusCode: number }).statusCode
              : 0;
          if (status >= 400 && status < 500) return false; // 4xx: permanent, don't retry
          return failureCount < 1;                           // else: retry once
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(): QueryClient {
  // Server: always a fresh client (per request, no shared cache between users)
  if (isServer) return makeQueryClient();
  // Browser: reuse a single client across the session
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: useState lazy init — never recreate the client on re-renders.
  const [queryClient] = useState(getQueryClient);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {mounted && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}