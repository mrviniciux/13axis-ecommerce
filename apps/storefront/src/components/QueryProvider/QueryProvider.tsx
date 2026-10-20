'use client';

import { useState, type ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Default QueryClient options.
 *
 * - staleTime: 60s — avoids redundant refetches for data that rarely changes
 *   (product catalog, etc.). Override per-query when needed.
 * - gcTime: 5min — keeps inactive cache entries in memory a bit longer than
 *   the default to reduce cold fetches on navigation.
 * - retry: 2 — transient network errors get two retries before surfacing.
 * - refetchOnWindowFocus: false — disabled to avoid surprise refetches while
 *   the user is filling forms; enable per-query for real-time data.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Browser: reuse the same QueryClient across renders (singleton pattern
// recommended by TanStack for Next.js App Router).
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always create a new client so request state is never shared
    // between users.
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Wraps the application with TanStack Query's `QueryClientProvider`.
 *
 * Place this provider high in the component tree (e.g. in the root layout),
 * wrapping all client components that need data-fetching.
 *
 * The React Query Devtools panel is included automatically in development and
 * excluded from production builds.
 */
function QueryProvider({ children }: QueryProviderProps) {
  // useState ensures the QueryClient is not recreated on every render while
  // still being lazily initialised (avoids creating it during SSR for the
  // browser singleton path).
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default QueryProvider;
