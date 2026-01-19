import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// POST: Create manual transaction for user
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { userId, packageId, amount, commission, status, transactionDate } = body

    if (!userId || !packageId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user and package
    const [user, pkg] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.package.findUnique({ where: { id: packageId } })
    ])

    if (!user || !pkg) {
      return NextResponse.json(
        { error: 'User or package not found' },
        { status: 404 }
      )
    }

    // Parse transaction date or use current date
    const createdAt = transactionDate ? new Date(transactionDate) : new Date()

    // Create payment record
    const payment = await db.payment.create({
      data: {
        user_id: userId,
        package_id: packageId,
        amount: parseFloat(amount),
        buyer_wallet: user.usdt_trc20_address || 'Manual Entry',
        commission: commission ? parseFloat(commission) : 0,
        status: status || 'completed',
        created_at: createdAt,
        updated_at: createdAt
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction created successfully',
      payment 
    })

  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

// PUT: Update existing transaction
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { paymentId, updates } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const payment = await db.payment.update({
      where: { id: paymentId },
      data: updates,
      include: {
        user: true,
        package: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction updated successfully',
      payment 
    })

  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE: Delete transaction
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    await db.payment.delete({
      where: { id: paymentId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction deleted successfully' 
    })

  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
