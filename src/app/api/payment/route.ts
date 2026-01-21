import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { calculateCommission } from '@/lib/tiers'

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
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { package_id } = body

    if (!package_id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Check if package exists
    const pkg = await db.package.findUnique({
      where: { id: package_id }
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Get user with current balance
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has sufficient balance
    if (user.wallet_balance_usdt < pkg.price_usd) {
      return NextResponse.json(
        { 
          error: 'Insufficient wallet balance',
          details: {
            current_balance: user.wallet_balance_usdt,
            required: pkg.price_usd,
            shortage: pkg.price_usd - user.wallet_balance_usdt
          }
        },
        { status: 400 }
      )
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
          buyer_wallet: user.usdt_trc20_address || 'N/A',
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

      return payment
    })


    return NextResponse.json({ 
      success: true, 
      paymentId: result.id,
      message: 'Package purchased successfully! Commission added to your balance.',
      commission: commission,
      new_balance: user.wallet_balance_usdt - pkg.price_usd + commission
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment. Please try again.' },
      { status: 500 }
    )
  }
}
