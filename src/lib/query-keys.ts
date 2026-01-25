// ============================================
// REACT QUERY KEY FACTORY
// ============================================
// Standardized query keys for consistent caching and invalidation

export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
  },

  // Package queries
  packages: {
    all: ['packages'] as const,
    list: () => [...queryKeys.packages.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.packages.all, 'detail', id] as const,
  },

  // Transaction queries
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: { status?: string; page?: number }) =>
      [...queryKeys.transactions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
  },

  // Wallet queries
  wallet: {
    all: ['wallet'] as const,
    deposits: () => [...queryKeys.wallet.all, 'deposits'] as const,
    withdrawals: () => [...queryKeys.wallet.all, 'withdrawals'] as const,
    balance: () => [...queryKeys.wallet.all, 'balance'] as const,
  },

  // Admin queries
  admin: {
    all: ['admin'] as const,
    users: {
      all: () => [...queryKeys.admin.all, 'users'] as const,
      list: (filters?: { page?: number; search?: string }) =>
        [...queryKeys.admin.all, 'users', 'list', filters] as const,
      detail: (id: string) => [...queryKeys.admin.all, 'users', 'detail', id] as const,
    },
    transactions: {
      all: () => [...queryKeys.admin.all, 'transactions'] as const,
      list: (filters?: { status?: string; page?: number }) =>
        [...queryKeys.admin.all, 'transactions', 'list', filters] as const,
    },
    withdrawals: {
      all: () => [...queryKeys.admin.all, 'withdrawals'] as const,
      pending: () => [...queryKeys.admin.all, 'withdrawals', 'pending'] as const,
    },
    deposits: {
      all: () => [...queryKeys.admin.all, 'deposits'] as const,
      pending: () => [...queryKeys.admin.all, 'deposits', 'pending'] as const,
    },
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
  },
} as const

// Type helper for extracting query key types
export type QueryKeyFactory = typeof queryKeys
