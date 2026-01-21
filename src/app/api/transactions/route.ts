import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token.value, secret)
    const userId = payload.userId as string

    // Fetch payments for this user that are completed
    // In a real scenario, an "Agent" might want to see THEIR sales.
    // Assuming the user is the agent.
    const transactions = await db.payment.findMany({
      where: {
        user_id: userId,
        // Show all statuses (pending, completed, failed)
      },
      include: {
        package: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Transform data for frontend
    const history = transactions.map(tx => ({
      id: tx.id,
      package: tx.package.name,
      amount: tx.amount,
      btc_amount: tx.package.btc_amount, // Add BTC amount from package
      commission: tx.commission, // Using the stored commission
      buyer_wallet: tx.buyer_wallet,
      date: tx.created_at,
      status: tx.status
    }))

    return NextResponse.json(history)

  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
