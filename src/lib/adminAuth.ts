import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
const ADMIN_EMAIL = 'mohmmaed211@gmail.com'
const ADMIN_USERNAME = 'admin'

export async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null; email: string | null; username: string | null }> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return { isAdmin: false, userId: null, email: null, username: null }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const email = payload.email as string || null
    const username = payload.username as string || null
    const userId = payload.userId as string

    // Check if user is admin by email OR username
    const isAdmin = (email === ADMIN_EMAIL) || (username === ADMIN_USERNAME)

    return {
      isAdmin,
      userId,
      email,
      username
    }
  } catch {
    return { isAdmin: false, userId: null, email: null, username: null }
  }
}

export async function requireAdmin(request: NextRequest) {
  const { isAdmin } = await checkAdminAccess(request)
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  return null // No error, proceed
}
