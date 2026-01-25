import { z } from 'zod'

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
})

// ============================================
// PAYMENT VALIDATION SCHEMAS
// ============================================

// Bitcoin address validation regex patterns
const bitcoinLegacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
const bitcoinBech32Regex = /^bc1[a-z0-9]{39,59}$/

export const paymentSchema = z.object({
  package_id: z.string().cuid('Invalid package ID'),
  bitcoin_wallet: z.string()
    .min(26, 'Bitcoin address is too short')
    .max(62, 'Bitcoin address is too long')
    .refine(
      (val) => bitcoinLegacyRegex.test(val) || bitcoinBech32Regex.test(val),
      'Please enter a valid Bitcoin wallet address'
    ),
})

// ============================================
// WALLET VALIDATION SCHEMAS
// ============================================

// TRC20 address validation (Tron network)
const trc20Regex = /^T[A-Za-z1-9]{33}$/

// ERC20 address validation (Ethereum network)
const erc20Regex = /^0x[a-fA-F0-9]{40}$/

export const withdrawalSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than 0')
    .min(10, 'Minimum withdrawal is 10 USDT'),
  network: z.enum(['TRC20', 'ERC20'], { message: 'Please select a valid network' }),
  address: z.string().min(30, 'Address is too short'),
}).refine(
  (data) => {
    if (data.network === 'TRC20') {
      return trc20Regex.test(data.address)
    }
    if (data.network === 'ERC20') {
      return erc20Regex.test(data.address)
    }
    return false
  },
  {
    message: 'Address does not match the selected network',
    path: ['address'],
  }
)

export const depositNotificationSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  tx_hash: z.string().optional(),
})

// ============================================
// USER UPDATE VALIDATION SCHEMAS
// ============================================

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  commission_wallet: z.string()
    .refine((val) => !val || trc20Regex.test(val) || erc20Regex.test(val), {
      message: 'Please enter a valid TRC20 or ERC20 wallet address',
    })
    .optional(),
})

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// ============================================
// ADMIN VALIDATION SCHEMAS
// ============================================

export const packageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  usdt_amount: z.string(),
  btc_amount: z.string(),
  price_usd: z.number().positive('Price must be greater than 0'),
  duration: z.number().int().positive().default(45),
  transfers: z.number().int().positive().default(27),
})

export const kycApprovalSchema = z.object({
  user_id: z.string().cuid(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
})

export const withdrawalApprovalSchema = z.object({
  request_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
})

export const depositApprovalSchema = z.object({
  deposit_id: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
  notes: z.string().optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type DepositNotificationInput = z.infer<typeof depositNotificationSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type PackageInput = z.infer<typeof packageSchema>
export type KycApprovalInput = z.infer<typeof kycApprovalSchema>
export type WithdrawalApprovalInput = z.infer<typeof withdrawalApprovalSchema>
export type DepositApprovalInput = z.infer<typeof depositApprovalSchema>

// ============================================
// VALIDATION HELPER
// ============================================

/**
 * Validate input against a schema and return typed result or errors
 */
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.issues }
}
