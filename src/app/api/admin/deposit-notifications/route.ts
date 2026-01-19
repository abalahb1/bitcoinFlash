import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, checkAdminAccess } from '@/lib/adminAuth'

// GET: Fetch deposit notifications
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const where = status !== 'all' ? { status } : {}

    const notifications = await db.depositNotification.findMany({
      where,
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

    return NextResponse.json(notifications)

  } catch (error) {
    console.error('Fetch deposit notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposit notifications' },
      { status: 500 }
    )
  }
}

// PUT: Approve or reject deposit notification
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { email: adminEmail } = await checkAdminAccess(request)
    const body = await request.json()
    const { notificationId, action, notes } = body

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'Notification ID and action are required' },
        { status: 400 }
      )
    }

    const notification = await db.depositNotification.findUnique({
      where: { id: notificationId },
      include: { user: true }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Deposit notification not found' },
        { status: 404 }
      )
    }

    if (notification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Notification already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Credit user balance and mark as confirmed
      await db.$transaction([
        db.user.update({
          where: { id: notification.user_id },
          data: {
            wallet_balance_usdt: {
              increment: notification.amount
            }
          }
        }),
        db.depositNotification.update({
          where: { id: notificationId },
          data: {
            status: 'confirmed',
            confirmed_by: adminEmail || 'admin',
            admin_notes: notes,
            confirmed_at: new Date()
          }
        })
      ])

      return NextResponse.json({ 
        success: true,
        message: `Deposit confirmed. ${notification.amount} USDT credited to ${notification.user.name}'s account.`,
        newBalance: notification.user.wallet_balance_usdt + notification.amount
      })

    } else if (action === 'reject') {
      // Mark as rejected
      await db.depositNotification.update({
        where: { id: notificationId },
        data: {
          status: 'rejected',
          admin_notes: notes
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Deposit notification rejected'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Deposit notification action error:', error)
    return NextResponse.json(
      { error: 'Failed to process deposit notification' },
      { status: 500 }
    )
  }
}
