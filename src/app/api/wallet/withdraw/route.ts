import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { withdrawalSchema } from '@/lib/validations'
import { 
  apiSuccess, 
  apiUnauthorized, 
  apiNotFound, 
  apiValidationError, 
  apiInsufficientFunds,
  handleApiError 
} from '@/lib/api-response'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return apiUnauthorized()
    }

    const body = await request.json()
    
    // Validate with Zod schema
    const validation = withdrawalSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return apiValidationError(firstError, validation.error.issues)
    }
    
    const { amount, address, network } = validation.data

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return apiNotFound('User not found')
    }

    // Check balance
    if (user.wallet_balance_usdt < amount) {
      return apiInsufficientFunds('Insufficient balance for withdrawal', {
        current: user.wallet_balance_usdt,
        required: amount,
        shortage: amount - user.wallet_balance_usdt
      })
    }

    // Create withdrawal request
    const withdrawalRequest = await db.withdrawalRequest.create({
      data: {
        user_id: userId,
        amount: amount,
        address: address.trim(),
        network: network,
        status: 'pending'
      }
    })

    // Deduct amount from user balance (hold it)
    await db.user.update({
      where: { id: userId },
      data: {
        wallet_balance_usdt: {
          decrement: amount
        }
      }
    })

    return apiSuccess({
      message: 'Withdrawal request submitted successfully. Processing time: 1-24 hours.',
      request_id: withdrawalRequest.id,
      amount: amount,
      new_balance: user.wallet_balance_usdt - amount
    })

  } catch (error) {
    console.error('Withdrawal error:', error)
    return handleApiError(error)
  }
}

// GET: Fetch user's withdrawal requests
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return apiUnauthorized()
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return apiSuccess(withdrawals)

  } catch (error) {
    console.error('Fetch withdrawals error:', error)
    return handleApiError(error)
  }
}
