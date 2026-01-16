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
    const { 
      usdt_trc20_address,
      commission_wallet 
    } = body

    const updateData: any = {}
    
    if (usdt_trc20_address !== undefined) {
      updateData.usdt_trc20_address = usdt_trc20_address
    }
    
    if (commission_wallet !== undefined) {
      updateData.commission_wallet = commission_wallet
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        usdt_trc20_address: user.usdt_trc20_address,
        commission_wallet: user.commission_wallet
      }
    })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    )
  }
}
