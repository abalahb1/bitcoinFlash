'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, type Package } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

// ============================================
// PACKAGES LIST QUERY
// ============================================

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.packages.list(),
    queryFn: () => apiClient.packages.list(),
    staleTime: 1000 * 60 * 10, // 10 minutes - packages don't change often
  })
}

// ============================================
// SINGLE PACKAGE QUERY
// ============================================

export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.packages.detail(id ?? ''),
    queryFn: () => apiClient.packages.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}
