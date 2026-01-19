import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// GET: Fetch user details with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { userId } = await params

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        payments: {
          include: {
            package: true
          },
          orderBy: { created_at: 'desc' }
        },
        withdrawalRequests: {
          orderBy: { created_at: 'desc' }
        },
        deposits: {
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Fetch user details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

// PUT: Update user details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { userId } = await params
    const body = await request.json()
    const { updates } = body

    const user = await db.user.update({
      where: { id: userId },
      data: updates
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully',
      user 
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
