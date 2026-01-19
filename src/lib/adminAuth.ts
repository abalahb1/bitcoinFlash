import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
const ADMIN_EMAIL = 'mohmmaed@gmail.com'

export async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null; email: string | null }> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return { isAdmin: false, userId: null, email: null }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const email = payload.email as string
    const userId = payload.userId as string

    return {
      isAdmin: email === ADMIN_EMAIL,
      userId,
      email
    }
  } catch {
    return { isAdmin: false, userId: null, email: null }
  }
}

export async function requireAdmin(request: NextRequest) {
  const { isAdmin, email } = await checkAdminAccess(request)
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  return null // No error, proceed
}
