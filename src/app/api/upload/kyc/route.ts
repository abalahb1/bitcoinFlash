import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { sendTelegramMessage } from '@/lib/telegram'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'passport' or 'selfie'

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 3MB for Base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 3MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Update user record with Base64 data directly
    const updateData = type === 'passport'
      ? { kyc_passport_url: base64String, kyc_status: 'pending' }
      : { kyc_selfie_url: base64String, kyc_status: 'pending' }

    await db.user.update({
      where: { id: userId },
      data: updateData
    })

    // Fetch user details for notification
    const user = await db.user.findUnique({ where: { id: userId } })
    
    // Check if both documents are uploaded
    const bothUploaded = user?.kyc_passport_url && user?.kyc_selfie_url
    
    // Send Telegram notification ONLY when BOTH documents are uploaded
    if (bothUploaded) {
      await sendTelegramMessage(
        `🔔 *New KYC Submission*\n\n` +
        `👤 Name: ${user?.name || 'Unknown'}\n` +
        `📧 Email: ${user?.email}\n` +
        `📱 User ID: \`${userId}\`\n\n` +
        `✅ Both documents uploaded\n` +
        `⏳ Status: Pending Review\n\n` +
        `Use /start in the bot to review and approve.`
      )
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      bothUploaded: bothUploaded
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    )
  }
}
