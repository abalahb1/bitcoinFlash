/**
 * Activity Log Utility
 * 
 * Logs security and activity events for users
 */

import { db } from './db'

export interface ActivityLogParams {
    userId: string
    eventType: 'login' | 'logout' | 'withdrawal' | '2fa_sent' | 'password_change' | 'package_purchase' | 'profile_update' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected'
    ipAddress?: string
    deviceInfo?: string
    location?: string
    metadata?: Record<string, any>
}

/**
 * Log a security event
 */
export async function logActivity(params: ActivityLogParams) {
    try {
        await db.securityEvent.create({
            data: {
                user_id: params.userId,
                event_type: params.eventType,
                ip_address: params.ipAddress || null,
                device_info: params.deviceInfo || null,
                location: params.location || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            },
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
        // Don't throw - activity logging should not break the app
    }
}

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(userId: string, limit = 50) {
    return await db.securityEvent.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
    })
}

/**
 * Extract IP from request headers
 */
export function getClientIP(headers: Headers): string | undefined {
    return (
        headers.get('x-forwarded-for')?.split(',')[0] ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        undefined
    )
}

/**
 * Get device info from user-agent
 */
export function getDeviceInfo(userAgent: string | null): string {
    if (!userAgent) return 'Unknown Device'

    // Simple device detection
    if (/mobile/i.test(userAgent)) {
        if (/iphone/i.test(userAgent)) return 'iPhone'
        if (/ipad/i.test(userAgent)) return 'iPad'
        if (/android/i.test(userAgent)) return 'Android Device'
        return 'Mobile Device'
    }

    if (/mac/i.test(userAgent)) return 'Mac'
    if (/windows/i.test(userAgent)) return 'Windows PC'
    if (/linux/i.test(userAgent)) return 'Linux'

    return 'Desktop'
}
