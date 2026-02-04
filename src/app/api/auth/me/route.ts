import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function GET(request: NextRequest) {
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store, max-age=0')

  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    // Fetch user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        wallet_balance_usdt: true,
        wallet_balance_btc: true,
        wallet_ref: true,
        usdt_trc20_address: true,
        kyc_passport_url: true,
        kyc_selfie_url: true,
        kyc_status: true,
        is_verified: true,
        commission_wallet: true,
        account_tier: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      console.log('User not found in DB')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user, { headers })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
}
