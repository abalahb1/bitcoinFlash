import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${userId}_${type}_${timestamp}.${extension}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'kyc', filename)

    // Save file
    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/kyc/${filename}`

    // Update user record
    const updateData = type === 'passport'
      ? { kyc_passport_url: fileUrl }
      : { kyc_selfie_url: fileUrl }

    await db.user.update({
      where: { id: userId },
      data: updateData
    })

    // Notify Admin via Telegram
    const user = await db.user.findUnique({ where: { id: userId } })
    await sendTelegramMessage(
      `🔔 *New KYC Upload*\n` +
      `User: ${user?.name || 'Unknown'}\n` +
      `Type: ${type}\n` +
      `Action: Check bot menu /kyc to approve.`
    )

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: fileUrl
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
