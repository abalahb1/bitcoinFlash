import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: 'hus11amahmed@gmail.com' }
  })

  if (!user) {
    console.error('❌ User not found with email: hus11amahmed@gmail.com')
    return
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)

  // Get all packages
  const packages = await prisma.package.findMany()

  if (packages.length === 0) {
    console.error('❌ No packages found in database')
    return
  }

  console.log(`✅ Found ${packages.length} packages`)

  // Generate 50 transactions between Nov 15, 2025 and Jan 18, 2026
  const startDate = new Date('2025-11-15')
  const endDate = new Date('2026-01-18')
  const transactions = []

  for (let i = 0; i < 50; i++) {
    // Random date between start and end
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    const randomDate = new Date(randomTime)

    // Random package
    const randomPackage = packages[Math.floor(Math.random() * packages.length)]

    // Random status (mostly completed)
    const statuses = ['completed', 'completed', 'completed', 'completed', 'pending']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Calculate commission based on user tier
    const tierCommissions = {
      'bronze': 0.05,
      'silver': 0.07,
      'gold': 0.10
    }
    const commissionRate = tierCommissions[user.account_tier as keyof typeof tierCommissions] || 0.05
    const commission = randomPackage.price_usd * commissionRate

    // Generate random wallet address
    const walletPrefixes = ['T', 'bc1', '0x', '1', '3']
    const prefix = walletPrefixes[Math.floor(Math.random() * walletPrefixes.length)]
    let wallet = prefix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const length = prefix === '0x' ? 40 : 33
    for (let j = 0; j < length; j++) {
      wallet += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    transactions.push({
      user_id: user.id,
      package_id: randomPackage.id,
      amount: randomPackage.price_usd,
      buyer_wallet: wallet,
      status: status,
      commission: commission,
      created_at: randomDate,
      updated_at: randomDate
    })
  }

  // Sort by date
  transactions.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())

  // Insert transactions
  console.log('\n📝 Creating 50 transactions...')
  
  for (const transaction of transactions) {
    await prisma.payment.create({
      data: transaction
    })
  }

  console.log('✅ Successfully created 50 transactions!')
  
  // Show summary
  const completedCount = transactions.filter(t => t.status === 'completed').length
  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const totalCommission = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.commission, 0)

  console.log('\n📊 Summary:')
  console.log(`   Total Transactions: 50`)
  console.log(`   Completed: ${completedCount}`)
  console.log(`   Pending: ${pendingCount}`)
  console.log(`   Total Commission Earned: $${totalCommission.toFixed(2)}`)
  console.log(`   Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
