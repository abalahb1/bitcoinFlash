import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'mohmmaed211@gmail.com'
const ADMIN_PASSWORD = '66666666'
const ADMIN_NAME = 'Admin'

async function main() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })

    if (existingUser) {
      // Update password
      const updatedUser = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { password: hashedPassword }
      })
      console.log('✅ Admin password updated successfully!')
      console.log('  Email:', updatedUser.email)
      console.log('  User ID:', updatedUser.id)
    } else {
      // Generate wallet reference
      const walletRef = `BF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      // Create user
      const user = await prisma.user.create({
        data: {
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          phone: '+966 50 000 0000',
          password: hashedPassword,
          wallet_ref: walletRef,
          wallet_balance_usdt: 0.00,
          wallet_balance_btc: 0.00,
        }
      })

      console.log('✅ Admin user created successfully!')
      console.log('  Name:', user.name)
      console.log('  Email:', user.email)
      console.log('  User ID:', user.id)
    }

    console.log('')
    console.log('🔐 Admin Credentials:')
    console.log('  Email:', ADMIN_EMAIL)
    console.log('  Password:', ADMIN_PASSWORD)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
