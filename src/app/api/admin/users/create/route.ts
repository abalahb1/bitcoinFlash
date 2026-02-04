import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'
import bcrypt from 'bcryptjs'

// POST: Create new user (Admin only)
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      phone, 
      account_tier = 'bronze',
      wallet_balance_usdt = 0,
      is_verified = false
    } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!['bronze', 'silver', 'gold'].includes(account_tier)) {
      return NextResponse.json(
        { error: 'Invalid account tier' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate username from email part before @
    let username = email.split('@')[0].toLowerCase()
    
    // Check if username taken, append random numbers if so
    let usernameExists = await db.user.findUnique({ where: { username } })
    while (usernameExists) {
      username = `${username}${Math.floor(Math.random() * 1000)}`
      usernameExists = await db.user.findUnique({ where: { username } })
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        account_tier,
        wallet_balance_usdt: parseFloat(wallet_balance_usdt.toString()),
        is_verified
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
