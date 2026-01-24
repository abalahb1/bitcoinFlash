'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { ThemeProvider } from 'next-themes'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create a new QueryClient instance for each session
  // This ensures proper hydration and prevents shared state between users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 60 seconds by default
            staleTime: 60 * 1000,
            // Cache time of 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed queries 3 times
            retry: 3,
            // Don't refetch on window focus by default (saves API calls)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
