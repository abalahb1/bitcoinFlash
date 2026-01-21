import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding 150 MORE payment records (Weighted)...\n')

  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: { email: 'hus11amahmed@gmail.com' }
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }
  console.log(`👤 User: ${user.name}`)

  // 2. Get and sort packages
  const packages = await prisma.package.findMany()
  packages.sort((a, b) => a.price_usd - b.price_usd)
  
  const cheapPackages = packages.slice(0, 2)
  const midPackages = packages.slice(2, packages.length - 2)
  const expensivePackages = packages.slice(packages.length - 2)

  // 3. Generate 150 payments
  const targetCount = 150
  const startDate = new Date('2025-11-20T00:00:00')
  const endDate = new Date('2026-01-22T23:59:59')
  const timeDiff = endDate.getTime() - startDate.getTime()

  const payments = []

  for (let i = 0; i < targetCount; i++) {
    // Determine tier
    const rand = Math.random()
    let selectedPkg

    if (rand < 0.85) {
      // 85% chance for cheap
      selectedPkg = cheapPackages[Math.floor(Math.random() * cheapPackages.length)]
    } else if (rand < 0.97) {
      // 12% chance for mid
      selectedPkg = midPackages.length > 0 
        ? midPackages[Math.floor(Math.random() * midPackages.length)]
        : cheapPackages[0] // Fallback
    } else {
      // 3% chance for expensive
      selectedPkg = expensivePackages[Math.floor(Math.random() * expensivePackages.length)]
    }

    // Random date
    const randomTime = Math.random() * timeDiff
    const paymentDate = new Date(startDate.getTime() + randomTime)

    // Commission (10%)
    const commission = selectedPkg.price_usd * 0.10

    payments.push({
      user_id: user.id,
      package_id: selectedPkg.id,
      amount: selectedPkg.price_usd,
      buyer_wallet: user.usdt_trc20_address || 'TRC20-WALLET',
      status: 'completed',
      commission: commission,
      created_at: paymentDate,
      updated_at: paymentDate
    })
  }

  // Sort by date (oldest first)
  payments.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())

  // 4. Insert
  await prisma.payment.createMany({
    data: payments
  })

  // 5. Summary
  const summary: {[key: string]: number} = {}
  payments.forEach(p => {
    const name = packages.find(pkg => pkg.id === p.package_id)?.name || 'Unknown'
    summary[name] = (summary[name] || 0) + 1
  })

  console.log(`\n✅ Added ${payments.length} NEW payments`)
  console.log('📊 Distribution of New Payments:')
  Object.entries(summary).forEach(([name, count]) => {
    console.log(`   ${name}: ${count} (${((count/targetCount)*100).toFixed(1)}%)`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
