import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate wallet reference
    const walletRef = `BF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        wallet_ref: walletRef,
        wallet_balance_usdt: 0.00,
        wallet_balance_btc: 0.00,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        wallet_balance_usdt: true,
        wallet_balance_btc: true,
        wallet_ref: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'Registration successful',
      user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
