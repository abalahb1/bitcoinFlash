import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { sendTelegramMessage } from '@/lib/telegram'

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

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Check for recent pending payment (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

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

    // Parse amount from package (remove commas)
    const amount = parseFloat(pkg.usdt_amount.replace(/,/g, ''))
    const commission = amount * 0.10 // 10% commission

    // Create payment
    const payment = await db.payment.create({
      data: {
        user_id: userId,
        package_id,
        buyer_wallet,
        amount: amount,
        commission: commission,
        status: 'pending',
        // created_at is default now() handled by Prisma default
      }
    })

    // Notify Admin via Telegram
    await sendTelegramMessage(
      `💰 *New Payment Request*\n` +
      `User: ${user.name}\n` +
      `Amount: ${pkg.usdt_amount} USDT\n` +
      `Package: ${pkg.name}\n` +
      `Action: Check bot menu /payments to confirm.`
    )

    return NextResponse.json({ success: true, paymentId: payment.id })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
