import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

// GET: Fetch all packages
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const packages = await db.package.findMany({
      orderBy: { price_usd: 'asc' },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    })

    return NextResponse.json(packages)

  } catch (error) {
    console.error('Fetch packages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

// POST: Create new package
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { name, usdt_amount, btc_amount, price_usd, duration, transfers } = body

    if (!name || !usdt_amount || !btc_amount || !price_usd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const pkg = await db.package.create({
      data: {
        name,
        usdt_amount,
        btc_amount,
        price_usd: parseFloat(price_usd),
        duration: parseInt(duration?.toString() || '45'),
        transfers: parseInt(transfers?.toString() || '27')
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      package: pkg
    })

  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}

// PUT: Update package
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { packageId, updates } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Parse updates to correct types
    const parsedUpdates: any = {}
    if (updates.name) parsedUpdates.name = updates.name
    if (updates.usdt_amount) parsedUpdates.usdt_amount = updates.usdt_amount
    if (updates.btc_amount) parsedUpdates.btc_amount = updates.btc_amount
    if (updates.price_usd) parsedUpdates.price_usd = parseFloat(updates.price_usd)
    if (updates.duration) parsedUpdates.duration = parseInt(updates.duration?.toString() || '45')
    if (updates.transfers) parsedUpdates.transfers = parseInt(updates.transfers?.toString() || '27')

    const pkg = await db.package.update({
      where: { id: packageId },
      data: parsedUpdates
    })

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      package: pkg
    })

  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

// DELETE: Delete package
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    await db.package.delete({
      where: { id: packageId }
    })

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })

  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}

// PATCH: Lock/Unlock package
export async function PATCH(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { packageId, locked } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    if (typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'Locked status must be a boolean' },
        { status: 400 }
      )
    }

    const pkg = await db.package.update({
      where: { id: packageId },
      data: { locked }
    })

    return NextResponse.json({
      success: true,
      message: `Package ${locked ? 'locked' : 'unlocked'} successfully`,
      package: pkg
    })

  } catch (error) {
    console.error('Lock/Unlock package error:', error)
    return NextResponse.json(
      { error: 'Failed to update package lock status' },
      { status: 500 }
    )
  }
}
