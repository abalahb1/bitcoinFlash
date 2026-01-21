import { NextRequest, NextResponse } from 'next/server'
import { TIERS } from '@/lib/tiers'

export async function GET(request: NextRequest) {
  try {
    // Return all tier configurations
    const tiers = Object.entries(TIERS).map(([key, config]) => ({
      id: key,
      ...config
    }))

    return NextResponse.json(tiers)

  } catch (error) {
    console.error('Fetch tiers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tiers' },
      { status: 500 }
    )
  }
}
