import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Transactions fetch started')
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      console.log('[API] No token found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    let payload;
    try {
      const verified = await jwtVerify(token.value, secret)
      payload = verified.payload
    } catch (e) {
      console.error('[API] Token verification failed:', e)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId as string
    console.log('[API] Fetching for user:', userId)
    
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

    console.log(`[API] Found ${transactions.length} transactions`)

    // Transform data for frontend
    const history = transactions.map(tx => ({
      id: tx.id,
      package: tx.package?.name || 'Unknown Package',
      amount: tx.amount,
      btc_amount: tx.package?.btc_amount || 'N/A', // Add BTC amount from package
      commission: Number(tx.commission), // Ensure it's a number
      buyer_wallet: tx.buyer_wallet,
      date: tx.created_at,
      status: tx.status
    }))

    return NextResponse.json(history)

  } catch (error) {
    console.error('Transactions fetch error stack:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
