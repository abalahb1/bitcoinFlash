import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    message: 'Logout successful'
  })

  // Clear the auth token cookie
  response.cookies.delete('auth-token')

  return response
}
