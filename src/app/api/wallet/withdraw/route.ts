import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

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

// Validate TRC20 address
function validateTRC20Address(address: string): boolean {
  return /^T[A-Za-z1-9]{33}$/.test(address.trim())
}

// Validate ERC20 address
function validateERC20Address(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
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

    const body = await request.json()
    const { amount, address, network = 'TRC20' } = body

    // Validation
    if (!amount || !address) {
      return NextResponse.json(
        { error: 'Amount and address are required' },
        { status: 400 }
      )
    }

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      )
    }

    // Validate Address based on Network
    let isValidAddress = false
    if (network === 'TRC20') {
      isValidAddress = validateTRC20Address(address)
      if (!isValidAddress) {
        return NextResponse.json(
          { error: 'Invalid TRC20 address format. Start with T and 34 characters.' },
          { status: 400 }
        )
      }
    } else if (network === 'ERC20') {
      isValidAddress = validateERC20Address(address)
      if (!isValidAddress) {
        return NextResponse.json(
          { error: 'Invalid ERC20 address format. Start with 0x and 42 characters.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid network type. Only TRC20 and ERC20 supported.' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check minimum withdrawal
    const MIN_WITHDRAWAL = 10
    if (withdrawAmount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL} USDT` },
        { status: 400 }
      )
    }

    // Check balance
    if (user.wallet_balance_usdt < withdrawAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          details: {
            current_balance: user.wallet_balance_usdt,
            requested: withdrawAmount,
            shortage: withdrawAmount - user.wallet_balance_usdt
          }
        },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const withdrawalRequest = await db.withdrawalRequest.create({
      data: {
        user_id: userId,
        amount: withdrawAmount,
        address: address.trim(),
        network: network,
        status: 'pending'
      }
    })

    // Deduct amount from user balance (hold it)
    await db.user.update({
      where: { id: userId },
      data: {
        wallet_balance_usdt: {
          decrement: withdrawAmount
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Withdrawal request submitted successfully. Processing time: 1-24 hours.',
      request_id: withdrawalRequest.id,
      amount: withdrawAmount,
      new_balance: user.wallet_balance_usdt - withdrawAmount
    })

  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal request. Please try again.' },
      { status: 500 }
    )
  }
}

// GET: Fetch user's withdrawal requests
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(withdrawals)

  } catch (error) {
    console.error('Fetch withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
}
