import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getUserActivityLogs } from '@/lib/activity-log'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

/**
 * GET /api/activity
 * Get activity logs for authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET)
        const userId = payload.userId as string

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')

        const activities = await getUserActivityLogs(userId, Math.min(limit, 100))

        // Format for frontend
        const formatted = activities.map(activity => ({
            id: activity.id,
            eventType: activity.event_type,
            ipAddress: activity.ip_address,
            deviceInfo: activity.device_info,
            location: activity.location,
            metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
            createdAt: activity.created_at,
        }))

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('Activity log fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        )
    }
}
