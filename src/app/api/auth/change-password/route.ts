import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { passwordChangeSchema } from '@/lib/validations'
import { apiUnauthorized, apiValidationError, handleApiError } from '@/lib/api-response'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return apiUnauthorized('Not authenticated')
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    if (!userId) {
      return apiUnauthorized('Invalid token')
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validation = passwordChangeSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return apiValidationError(firstError, validation.error.issues)
    }
    
    const { current_password, new_password } = validation.data

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return apiUnauthorized('User not found')
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { message: 'Current password is incorrect' } },
        { status: 400 }
      )
    }

    // Check if new password is the same as current
    const isSamePassword = await bcrypt.compare(new_password, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: { message: 'New password must be different from current password' } },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password changed successfully'
      }
    })
  } catch (error) {
    console.error('Change password error:', error)
    return handleApiError(error)
  }
}
