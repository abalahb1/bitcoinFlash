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

// GET: Fetch user's deposit history
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const deposits = await db.depositNotification.findMany({
      where: { 
        user_id: userId,
        status: 'confirmed' // Only show confirmed deposits
      },
      orderBy: { confirmed_at: 'desc' }
    })

    return NextResponse.json(deposits)

  } catch (error) {
    console.error('Fetch deposits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposit history' },
      { status: 500 }
    )
  }
}
