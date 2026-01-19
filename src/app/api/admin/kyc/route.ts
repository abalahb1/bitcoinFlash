import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// GET: Fetch pending KYC requests
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const users = await db.user.findMany({
      where: {
        kyc_status: status
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        kyc_passport_url: true,
        kyc_selfie_url: true,
        kyc_status: true,
        is_verified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Fetch KYC error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC requests' },
      { status: 500 }
    )
  }
}

// POST: Approve or reject KYC
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { userId, action, reason } = body // action: 'approve' or 'reject'

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    const updates: any = {
      kyc_status: action === 'approve' ? 'approved' : 'rejected'
    }

    if (action === 'approve') {
      updates.is_verified = true
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updates
    })

    return NextResponse.json({ 
      success: true, 
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user 
    })

  } catch (error) {
    console.error('KYC action error:', error)
    return NextResponse.json(
      { error: 'Failed to process KYC request' },
      { status: 500 }
    )
  }
}
