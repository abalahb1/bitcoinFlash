import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
const ADMIN_EMAIL = 'mohmmaed211@gmail.com'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // 1. Define route types
  const isUserAuthRoute = pathname === '/login'
  const isAdminAuthRoute = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminAuthRoute
  const isUserProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/kyc') || pathname.startsWith('/wallet')
  const isRoot = pathname === '/'

  // 2. Verify Token and get user info
  let isValidToken = false
  let userEmail: string | null = null
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      isValidToken = true
      userEmail = payload.email as string
    } catch {
      isValidToken = false
    }
  }

  // 3. Check if user is admin
  const isAdmin = userEmail === ADMIN_EMAIL

  // 4. Handle Admin Routes
  if (isAdminRoute) {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (!isAdmin) {
      // User is logged in but not admin - redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 5. Handle Admin Login Page
  if (isAdminAuthRoute) {
    if (isValidToken && isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 6. Handle User Protected Routes
  if (isUserProtectedRoute) {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // 7. Handle User Login Page
  if (isUserAuthRoute) {
    if (isValidToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 8. Handle Root
  if (isRoot) {
    if (isValidToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure paths that trigger middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
