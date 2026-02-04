import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      )
    }
    
    const { name, username, phone, password } = validation.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
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
        username: username.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        wallet_ref: walletRef,
        wallet_balance_usdt: 0.00,
        wallet_balance_btc: 0.00,
      },
      select: {
        id: true,
        name: true,
        username: true,
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
