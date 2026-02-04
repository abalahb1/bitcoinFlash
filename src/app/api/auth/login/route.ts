import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { loginSchema } from '@/lib/validations'
import { apiUnauthorized, apiValidationError, handleApiError } from '@/lib/api-response'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return apiValidationError(firstError, validation.error.issues)
    }
    
    const { username, password } = validation.data

    // Find user by username OR email
    const identifier = username.toLowerCase().trim()
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    })

    if (!user) {
      return apiUnauthorized('Invalid username or password')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return apiUnauthorized('Invalid username or password')
    }

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      username: user.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          wallet_balance_usdt: user.wallet_balance_usdt,
          wallet_balance_btc: user.wallet_balance_btc,
          wallet_ref: user.wallet_ref,
          kyc_status: user.kyc_status,
          is_verified: user.is_verified,
          createdAt: user.createdAt,
        }
      }
    })

    // Set persistent httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days (seconds)
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return handleApiError(error)
  }
}
