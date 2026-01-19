import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    // Get statistics
    const [
      totalUsers,
      verifiedUsers,
      pendingKYC,
      totalTransactions,
      completedTransactions,
      pendingWithdrawals,
      totalRevenue
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { is_verified: true } }),
      db.user.count({ where: { kyc_status: 'pending' } }),
      db.payment.count(),
      db.payment.count({ where: { status: 'completed' } }),
      db.withdrawalRequest.count({ where: { status: 'pending' } }),
      db.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ])

    // Get recent activity (last 10 transactions)
    const recentTransactions = await db.payment.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } }
      }
    })

    // Get recent users (last 5)
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        is_verified: true,
        kyc_status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        verifiedUsers,
        pendingKYC,
        totalTransactions,
        completedTransactions,
        pendingWithdrawals,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentTransactions,
      recentUsers
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
