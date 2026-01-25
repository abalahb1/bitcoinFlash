'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type Transaction, type PaymentResponse } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

// ============================================
// TRANSACTIONS LIST QUERY
// ============================================

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: () => apiClient.transactions.list(),
    staleTime: 1000 * 30, // 30 seconds - transactions update frequently
  })
}

// ============================================
// CREATE PAYMENT MUTATION
// ============================================

interface CreatePaymentParams {
  package_id: string
  bitcoin_wallet: string
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreatePaymentParams) => apiClient.payments.create(params),
    onSuccess: () => {
      // Invalidate transactions and user (balance changed)
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() })
    },
  })
}

// ============================================
// WITHDRAWAL REQUEST MUTATION
// ============================================

interface WithdrawalParams {
  amount: number
  address: string
  network: 'TRC20' | 'ERC20'
}

export function useWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: WithdrawalParams) => apiClient.wallet.withdraw(params),
    onSuccess: () => {
      // Invalidate user (pending balance) and wallet queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() })
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all })
    },
  })
}
