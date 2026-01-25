import { z } from 'zod'

// ============================================
// API CLIENT CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const DEFAULT_TIMEOUT = 10000 // 10 seconds

// ============================================
// ERROR TYPES
// ============================================

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const

// ============================================
// REQUEST CONFIG
// ============================================

interface RequestConfig<T = unknown> extends Omit<RequestInit, 'body'> {
  timeout?: number
  body?: T
  params?: Record<string, string | number | boolean | undefined>
}

// ============================================
// API CLIENT
// ============================================

async function request<TResponse>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<TResponse> {
  const { timeout = DEFAULT_TIMEOUT, body, params, ...init } = config

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Setup abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      credentials: 'include', // Always include cookies for auth
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    clearTimeout(timeoutId)

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
      let code: ErrorCode = ErrorCodes.UNKNOWN
      if (response.status === 401) code = ErrorCodes.UNAUTHORIZED
      else if (response.status === 403) code = ErrorCodes.FORBIDDEN
      else if (response.status === 404) code = ErrorCodes.NOT_FOUND
      else if (response.status === 400) code = ErrorCodes.VALIDATION_ERROR
      else if (response.status >= 500) code = ErrorCodes.SERVER_ERROR

      throw new ApiError(
        code,
        errorData.error || errorData.message || 'Request failed',
        response.status,
        errorData.details
      )
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as TResponse
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(ErrorCodes.TIMEOUT, 'Request timed out', 408)
      }
      throw new ApiError(ErrorCodes.NETWORK_ERROR, error.message, 0)
    }

    throw new ApiError(ErrorCodes.UNKNOWN, 'Unknown error occurred', 0)
  }
}

// ============================================
// API METHODS
// ============================================

export const api = {
  get: <T>(endpoint: string, config?: Omit<RequestConfig, 'body'>) =>
    request<T>(endpoint, { ...config, method: 'GET' }),

  post: <T, B = unknown>(endpoint: string, body?: B, config?: Omit<RequestConfig, 'body'>) =>
    request<T>(endpoint, { ...config, method: 'POST', body }),

  put: <T, B = unknown>(endpoint: string, body?: B, config?: Omit<RequestConfig, 'body'>) =>
    request<T>(endpoint, { ...config, method: 'PUT', body }),

  patch: <T, B = unknown>(endpoint: string, body?: B, config?: Omit<RequestConfig, 'body'>) =>
    request<T>(endpoint, { ...config, method: 'PATCH', body }),

  delete: <T>(endpoint: string, config?: Omit<RequestConfig, 'body'>) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),
}

// ============================================
// TYPE-SAFE API ENDPOINTS
// ============================================

// User types
export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  wallet_balance_usdt: number
  wallet_balance_btc: number
  wallet_ref: string | null
  usdt_trc20_address: string | null
  kyc_passport_url: string | null
  kyc_selfie_url: string | null
  kyc_status: string
  is_verified: boolean
  commission_wallet: string | null
  account_tier: string
  createdAt: string
  updatedAt: string
}

// Package types
export interface Package {
  id: string
  name: string
  usdt_amount: string
  btc_amount: string
  price_usd: number
  duration: number
  transfers: number
}

// Transaction types
export interface Transaction {
  id: string
  package: string
  amount: number
  btc_amount: string
  commission: number
  buyer_wallet: string
  network_type: string
  date: string
  status: 'pending' | 'completed' | 'failed'
}

// Payment response
export interface PaymentResponse {
  success: boolean
  paymentId: string
  message: string
  commission: number
  new_balance: number
}

// Withdrawal request
export interface WithdrawalResponse {
  success: boolean
  message: string
  request_id: string
}

// ============================================
// TYPED API FUNCTIONS
// ============================================

export const apiClient = {
  // Auth
  auth: {
    me: () => api.get<User>('/api/auth/me'),
    login: (email: string, password: string) => 
      api.post<{ user: User }>('/api/auth/login', { email, password }),
    logout: () => api.post<{ success: boolean }>('/api/auth/logout'),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      api.post<{ user: User }>('/api/auth/register', data),
  },

  // Packages
  packages: {
    list: () => api.get<Package[]>('/api/packages'),
    getById: (id: string) => api.get<Package>(`/api/packages/${id}`),
  },

  // Transactions
  transactions: {
    list: () => api.get<Transaction[]>('/api/transactions'),
  },

  // Payments
  payments: {
    create: (data: { package_id: string; bitcoin_wallet: string }) =>
      api.post<PaymentResponse>('/api/payment', data),
  },

  // Wallet
  wallet: {
    withdraw: (data: { amount: number; address: string; network: 'TRC20' | 'ERC20' }) =>
      api.post<WithdrawalResponse>('/api/wallet/withdraw', data),
    depositHistory: () => api.get<unknown[]>('/api/wallet/deposits'),
    withdrawalHistory: () => api.get<unknown[]>('/api/wallet/withdrawals'),
  },

  // User
  user: {
    update: (data: Partial<User>) => api.patch<User>('/api/user', data),
    updatePassword: (data: { current_password: string; new_password: string }) =>
      api.post<{ success: boolean }>('/api/user/password', data),
  },
}
