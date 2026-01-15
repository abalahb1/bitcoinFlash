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
    const { package_id, buyer_wallet } = body

    if (!package_id || !buyer_wallet) {
      return NextResponse.json(
        { error: 'Package ID and wallet address are required' },
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

    // Check for recent pending payment
    const now = Math.floor(Date.now() / 1000)
    const oneHourAgo = now - 3600

    const existingPayment = await db.payment.findFirst({
      where: {
        user_id: userId,
        status: 'pending',
        created_at: { gt: oneHourAgo }
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'You already have a pending transaction' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        user_id: userId,
        package_id,
        buyer_wallet,
        status: 'pending',
        created_at: now,
      }
    })

    return NextResponse.json({
      message: 'Payment submitted successfully',
      payment
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
