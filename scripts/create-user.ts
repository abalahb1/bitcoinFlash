import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mohmmaed211@gmail.com' }
    })

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email)
      console.log('User ID:', existingUser.id)
      console.log('Wallet Ref:', existingUser.wallet_ref)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Azaz6675%', 10)

    // Generate wallet reference
    const walletRef = `BF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Create user
    const user = await prisma.user.create({
      data: {
        name: 'Mohmmaed Khalid',
        email: 'mohmmaed211@gmail.com',
        phone: '+966 50 123 4567',
        password: hashedPassword,
        wallet_ref: walletRef,
        wallet_balance_usdt: 0.00,
        wallet_balance_btc: 0.00,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        wallet_ref: true,
        wallet_balance_usdt: true,
        wallet_balance_btc: true,
        createdAt: true,
      }
    })

    console.log('✅ User created successfully!')
    console.log('')
    console.log('👤 User Details:')
    console.log('  Name:', user.name)
    console.log('  Email:', user.email)
    console.log('  Phone:', user.phone)
    console.log('  Wallet Ref:', user.wallet_ref)
    console.log('  User ID:', user.id)
    console.log('  Created At:', user.createdAt.toLocaleString())
  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
