import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getUserActivityLogs } from '@/lib/activity-log'

/**
 * GET /api/activity
 * Get activity logs for authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request)
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')

        const activities = await getUserActivityLogs(user.id, Math.min(limit, 100))

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
