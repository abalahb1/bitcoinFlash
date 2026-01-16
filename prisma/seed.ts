import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if user already exists
  const userCount = await prisma.user.count()

  if (userCount === 0) {
    // Seed test user
    const hashedPassword = await bcrypt.hash('aaa@1111', 10)
    await prisma.user.create({
      data: {
        name: 'Mohammed Test',
        email: 'mohmmaed211@gmail.com',
        password: hashedPassword,
        phone: '+966512345678',
        wallet_balance_usdt: 0,
        wallet_balance_btc: 0,
        wallet_ref: 'REF-TEST-001',
      },
    })
    console.log('✅ Test user created successfully')
  } else {
    console.log('ℹ️ Users already exist')
  }

  // Check if packages already exist
  const count = await prisma.package.count()

  if (count === 0) {
    // Seed packages
    const packages = [
      {
        name: 'Package 1',
        usdt_amount: '21,620,000', // 230 * 94000
        btc_amount: '230',
        price_usd: 300000,
        duration: 45,
        transfers: 27,
      },
      {
        name: 'Package 2',
        usdt_amount: '9,400,000', // 100 * 94000
        btc_amount: '100',
        price_usd: 150000,
        duration: 45,
        transfers: 27,
      },
      {
        name: 'Package 3',
        usdt_amount: '53,580,000', // 570 * 94000
        btc_amount: '570',
        price_usd: 500000,
        duration: 45,
        transfers: 27,
      },
      {
        name: 'Package 4',
        usdt_amount: '18,800,000', // 200 * 94000
        btc_amount: '200',
        price_usd: 250000,
        duration: 45,
        transfers: 27,
      },
    ]

    await prisma.package.createMany({
      data: packages,
    })

    console.log('✅ Packages seeded successfully')
  } else {
    console.log('ℹ️ Packages already exist')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
