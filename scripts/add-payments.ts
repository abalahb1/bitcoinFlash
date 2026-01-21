import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding payment records...\n')

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: 'hus11amahmed@gmail.com' }
  })

  if (!user) {
    console.log('❌ User not found: hus11amahmed@gmail.com')
    return
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)

  // Get all packages
  const packages = await prisma.package.findMany()
  
  if (packages.length === 0) {
    console.log('❌ No packages found')
    return
  }

  console.log(`✅ Found ${packages.length} packages`)

  // Date range: November 20, 2024 to January 20, 2025
  const startDate = new Date('2024-11-20T00:00:00Z')
  const endDate = new Date('2025-01-20T23:59:59Z')
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()} (${totalDays} days)`)

  // Create 150 payments
  const numberOfPayments = 150
  const payments = []

  for (let i = 0; i < numberOfPayments; i++) {
    // Random package
    const pkg = packages[Math.floor(Math.random() * packages.length)]
    
    // Random date within range
    const randomDays = Math.floor(Math.random() * totalDays)
    const paymentDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000)
    // Add random hours/minutes
    paymentDate.setHours(Math.floor(Math.random() * 24))
    paymentDate.setMinutes(Math.floor(Math.random() * 60))
    
    // Commission based on tier (Gold = 10%)
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

  // Insert all payments
  const result = await prisma.payment.createMany({
    data: payments
  })

  console.log(`\n✅ Created ${result.count} payment records!`)

  // Summary
  const packageCounts: { [key: string]: number } = {}
  payments.forEach(p => {
    const pkg = packages.find(pk => pk.id === p.package_id)
    if (pkg) {
      packageCounts[pkg.name] = (packageCounts[pkg.name] || 0) + 1
    }
  })

  console.log('\n📊 Payment Summary:')
  Object.entries(packageCounts).forEach(([name, count]) => {
    console.log(`   ${name}: ${count} payments`)
  })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalCommission = payments.reduce((sum, p) => sum + p.commission, 0)
  
  console.log(`\n💰 Total Amount: $${totalAmount.toLocaleString()}`)
  console.log(`💵 Total Commission (10%): $${totalCommission.toLocaleString()}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
