import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, checkAdminAccess } from '@/lib/adminAuth'

// POST: Manually add deposit to user wallet
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { email: adminEmail } = await checkAdminAccess(request)
    const body = await request.json()
    const { userId, amount, txHash, notes } = body

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      )
    }

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create deposit record and update balance in transaction
    const result = await db.$transaction([
      db.depositNotification.create({
        data: {
          user_id: userId,
          amount: depositAmount,
          tx_hash: txHash,
          status: 'confirmed',
          confirmed_by: adminEmail || 'admin',
          admin_notes: notes,
          confirmed_at: new Date()
        }
      }),
      db.user.update({
        where: { id: userId },
        data: {
          wallet_balance_usdt: {
            increment: depositAmount
          }
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: 'Deposit confirmed successfully',
      deposit: result[0],
      newBalance: user.wallet_balance_usdt + depositAmount
    })

  } catch (error) {
    console.error('Deposit confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm deposit' },
      { status: 500 }
    )
  }
}

// GET: Fetch deposit history
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where = userId ? { user_id: userId } : {}

    const deposits = await db.depositNotification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(deposits)

  } catch (error) {
    console.error('Fetch deposits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}
