'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type User, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

// ============================================
// USER QUERY HOOK
// ============================================

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: () => apiClient.auth.me(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  })
}

// ============================================
// USER UPDATE MUTATION
// ============================================

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.user.update(data),
    onSuccess: (updatedUser) => {
      // Update the user cache with new data
      queryClient.setQueryData(queryKeys.user.current(), updatedUser)
    },
    onError: (error) => {
      console.error('Failed to update user:', error)
    },
  })
}

// ============================================
// PASSWORD CHANGE MUTATION
// ============================================

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiClient.user.updatePassword(data),
  })
}

// ============================================
// LOGOUT MUTATION
// ============================================

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.auth.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
  })
}
