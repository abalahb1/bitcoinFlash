import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

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
    const { amount, tx_hash } = body

    // Validation
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      )
    }

    // Check minimum deposit
    const MIN_DEPOSIT = 10
    if (depositAmount < MIN_DEPOSIT) {
      return NextResponse.json(
        { error: `Minimum deposit amount is ${MIN_DEPOSIT} USDT` },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create deposit notification
    const notification = await db.depositNotification.create({
      data: {
        user_id: userId,
        amount: depositAmount,
        tx_hash: tx_hash || null,
        status: 'pending'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Deposit notification sent to admin. Your balance will be updated once confirmed.',
      notification_id: notification.id,
      amount: depositAmount
    })

  } catch (error) {
    console.error('Deposit notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send deposit notification. Please try again.' },
      { status: 500 }
    )
  }
}
