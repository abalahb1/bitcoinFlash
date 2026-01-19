import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// PUT: Update user tier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { userId } = await params
    const body = await request.json()
    const { tier } = body

    if (!tier || !['bronze', 'silver', 'gold'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be bronze, silver, or gold' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { account_tier: tier }
    })

    return NextResponse.json({ 
      success: true, 
      message: `User tier updated to ${tier}`,
      user 
    })

  } catch (error) {
    console.error('Update tier error:', error)
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    )
  }
}
