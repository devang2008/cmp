// ============================================================
// CLIENT PROVIDERS — React Query, etc.
// ============================================================
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,          // Show cached data instantly for 60s
            gcTime: 5 * 60_000,         // Keep unused cache for 5 min
            refetchOnWindowFocus: false, // Don't refetch on tab switch
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
