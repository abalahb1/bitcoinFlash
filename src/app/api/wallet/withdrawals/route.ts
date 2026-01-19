import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

// GET: Fetch user's withdrawal history
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    // Fetch all withdrawal requests for this user
    const withdrawals = await db.withdrawalRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(withdrawals)

  } catch (error) {
    console.error('Fetch withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal history' },
      { status: 500 }
    )
  }
}
