import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// GET: Fetch withdrawal requests
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const withdrawals = await db.withdrawalRequest.findMany({
      where: status !== 'all' ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet_balance_usdt: true
          }
        }
      }
    })

    return NextResponse.json(withdrawals)

  } catch (error) {
    console.error('Fetch withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
}

// POST: Approve or reject withdrawal
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { withdrawalId, action, notes, rejectionReason } = body

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: 'Withdrawal ID and action are required' },
        { status: 400 }
      )
    }

    const withdrawal = await db.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    })

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal request not found' },
        { status: 404 }
      )
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Withdrawal request already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Mark as completed
      await db.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'completed',
          admin_notes: notes,
          processed_at: new Date()
        }
      })

    } else if (action === 'reject') {
      // Return amount to user wallet
      await db.$transaction([
        db.user.update({
          where: { id: withdrawal.user_id },
          data: {
            wallet_balance_usdt: {
              increment: withdrawal.amount
            }
          }
        }),
        db.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: {
            status: 'rejected',
            rejection_reason: rejectionReason,
            admin_notes: notes,
            processed_at: new Date()
          }
        })
      ])
    }

    return NextResponse.json({ 
      success: true,
      message: `Withdrawal ${action}d successfully`
    })

  } catch (error) {
    console.error('Withdrawal action error:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal request' },
      { status: 500 }
    )
  }
}
