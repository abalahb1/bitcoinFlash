import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // 1. Define protected and public routes
  const isAuthRoute = pathname.startsWith('/login')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/kyc') || pathname.startsWith('/wallet')
  const isRoot = pathname === '/'

  // 2. Verify Token logic
  let isValidToken = false
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      isValidToken = true
    } catch (e) {
      isValidToken = false
    }
  }

  // 3. Handling Redirects

  // Scenario A: User is Authenticated
  if (isValidToken) {
    // If trying to access login or root, redirect to dashboard
    if (isAuthRoute || isRoot) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Allow access to protected routes
    return NextResponse.next()
  }

  // Scenario B: User is NOT Authenticated
  if (!isValidToken) {
    // If trying to access protected routes, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // If root, redirect to login
    if (isRoot) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure paths that trigger middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately or let through for public APIs?) 
     *   -> Actually getting /api/auth/me needs cookie, but middleware runs before. 
     *   -> We typically exclude /api from redirect logic unless we want to protect them too.
     *   -> For now, let's exclude _next/static, images, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
