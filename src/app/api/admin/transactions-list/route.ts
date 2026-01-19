import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// GET: Fetch all transactions with filters
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (userId) {
      where.user_id = userId
    }

    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) {
        where.created_at.gte = new Date(startDate)
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate)
      }
    }

    const [transactions, stats] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          package: {
            select: {
              id: true,
              name: true,
              price_usd: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      db.payment.aggregate({
        where,
        _count: true,
        _sum: {
          amount: true,
          commission: true
        }
      })
    ])

    return NextResponse.json({
      transactions,
      stats: {
        total: stats._count,
        totalAmount: stats._sum.amount || 0,
        totalCommission: stats._sum.commission || 0
      }
    })

  } catch (error) {
    console.error('Fetch transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
