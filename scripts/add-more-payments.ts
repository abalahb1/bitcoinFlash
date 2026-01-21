import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding 25 more payment records...\n')

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: 'hus11amahmed@gmail.com' }
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }

  // Get packages
  const packages = await prisma.package.findMany()

  // Target Date Range: Jan 20, 2026 to Jan 22, 2026 (Current Timeframe)
  // We use 2026 to match the user's creation date and current system time
  const startDate = new Date('2026-01-20T00:00:00')
  const endDate = new Date('2026-01-22T23:59:59')
  
  console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`)

  const numberOfPayments = 25
  const payments = []

  for (let i = 0; i < numberOfPayments; i++) {
    const pkg = packages[Math.floor(Math.random() * packages.length)]
    
    // Distribute randomly between Jan 20 and Jan 22
    const timeDiff = endDate.getTime() - startDate.getTime()
    const randomTime = Math.random() * timeDiff
    const paymentDate = new Date(startDate.getTime() + randomTime)
    
    const commission = pkg.price_usd * 0.10

    payments.push({
      user_id: user.id,
      package_id: pkg.id,
      amount: pkg.price_usd,
      buyer_wallet: user.usdt_trc20_address || 'TRC20-WALLET',
      status: 'completed',
      commission: commission,
      created_at: paymentDate,
      updated_at: paymentDate
    })
  }

  // Sort by date
  payments.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())

  // Insert
  await prisma.payment.createMany({
    data: payments
  })

  console.log(`\n✅ Added ${payments.length} new payments ending Jan 22, 2026`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
