import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const packages = await db.package.findMany({
      orderBy: { price_usd: 'asc' }
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Packages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
