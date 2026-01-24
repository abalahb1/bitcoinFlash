import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { calculateCommission } from '@/lib/tiers'
import { paymentSchema } from '@/lib/validations'
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
    const validation = paymentSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return apiValidationError(firstError, validation.error.issues)
    }
    
    const { package_id, bitcoin_wallet } = validation.data

    // Check if package exists
    const pkg = await db.package.findUnique({
      where: { id: package_id }
    })

    if (!pkg) {
      return apiNotFound('Package not found')
    }

    // Get user with current balance
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return apiNotFound('User not found')
    }

    // Check if user has sufficient balance
    if (user.wallet_balance_usdt < pkg.price_usd) {
      return apiInsufficientFunds('Insufficient wallet balance', {
        current: user.wallet_balance_usdt,
        required: pkg.price_usd,
        shortage: pkg.price_usd - user.wallet_balance_usdt
      })
    }

    // Calculate commission based on user tier
    const commission = calculateCommission(pkg.price_usd, user.account_tier)

    // Process payment in a transaction
    const result = await db.$transaction(async (tx) => {
      // Deduct amount from user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          wallet_balance_usdt: {
            decrement: pkg.price_usd
          }
        }
      })

      // Create payment record with completed status
      const payment = await tx.payment.create({
        data: {
          user_id: userId,
          package_id,
          buyer_wallet: bitcoin_wallet,
          network_type: 'BTC',
          amount: pkg.price_usd,
          commission: commission,
          status: 'completed'
        }
      })

      // Add commission to user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          wallet_balance_usdt: {
            increment: commission
          }
        }
      })

      console.log('[API] Payment Record Created:', payment)
      
      return payment
    }, {
      maxWait: 5000,
      timeout: 20000,
    })

    return apiSuccess({
      paymentId: result.id,
      message: 'Package purchased successfully! Commission added to your balance.',
      commission: commission,
      new_balance: user.wallet_balance_usdt - pkg.price_usd + commission
    })
    
  } catch (error) {
    console.error('Payment error details:', error)
    return handleApiError(error)
  }
}
