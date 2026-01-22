import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample Bitcoin addresses for variety
const bitcoinAddresses = [
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy',
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
  '3Nxwenay9Z8Lc9JBiywExpnEFiLp6Afp8v',
  'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  '1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF',
  '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC',
  'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
  '1HQ3Go3ggs8pFnXuHVHRytPCq5fGG8Hbhx'
]

function getRandomBitcoinAddress(): string {
  return bitcoinAddresses[Math.floor(Math.random() * bitcoinAddresses.length)]
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function generateTransactions() {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'hus11amahmed@gmail.com' }
    })

    if (!user) {
      console.error('❌ User not found: hus11amahmed@gmail.com')
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

    // Sort packages by price (expensive ones last)
    const sortedPackages = [...packages].sort((a, b) => a.price_usd - b.price_usd)
    const cheapPackages = sortedPackages.slice(0, -1) // All except most expensive
    const expensivePackage = sortedPackages[sortedPackages.length - 1] // Most expensive

    // Date range
    const startDate = new Date('2025-10-20T00:00:00')
    const endDate = new Date('2026-01-22T23:59:59')

    console.log(`\n📅 Generating 350 transactions from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`)
    console.log(`💰 Package distribution: 95% varied packages, 5% expensive (${expensivePackage.name})`)

    const transactions = []
    const totalTransactions = 350
    const expensiveCount = Math.floor(totalTransactions * 0.05) // 5% expensive
    const regularCount = totalTransactions - expensiveCount

    // Generate regular transactions (95%)
    for (let i = 0; i < regularCount; i++) {
      const pkg = cheapPackages[Math.floor(Math.random() * cheapPackages.length)]
      const commission = pkg.price_usd * 0.1 // 10% commission
      
      transactions.push({
        user_id: user.id,
        package_id: pkg.id,
        amount: pkg.price_usd,
        buyer_wallet: getRandomBitcoinAddress(),
        network_type: 'BTC',
        status: 'completed',
        commission: commission,
        created_at: getRandomDate(startDate, endDate),
        updated_at: new Date()
      })
    }

    // Generate expensive transactions (5%)
    for (let i = 0; i < expensiveCount; i++) {
      const commission = expensivePackage.price_usd * 0.1
      
      transactions.push({
        user_id: user.id,
        package_id: expensivePackage.id,
        amount: expensivePackage.price_usd,
        buyer_wallet: getRandomBitcoinAddress(),
        network_type: 'BTC',
        status: 'completed',
        commission: commission,
        created_at: getRandomDate(startDate, endDate),
        updated_at: new Date()
      })
    }

    // Sort by date
    transactions.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())

    console.log(`\n🔄 Inserting ${transactions.length} transactions...`)

    // Insert in batches for better performance
    const batchSize = 50
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      await prisma.payment.createMany({
        data: batch
      })
      console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactions.length / batchSize)}`)
    }

    // Calculate statistics
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalCommission = transactions.reduce((sum, tx) => sum + tx.commission, 0)

    console.log(`\n✅ Successfully created ${transactions.length} transactions!`)
    console.log(`\n📊 Statistics:`)
    console.log(`   Total Amount: $${totalAmount.toLocaleString()} USDT`)
    console.log(`   Total Commission: $${totalCommission.toLocaleString()} USDT`)
    console.log(`   Regular Packages: ${regularCount} transactions`)
    console.log(`   Expensive Package (${expensivePackage.name}): ${expensiveCount} transactions`)
    console.log(`   Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`)

  } catch (error) {
    console.error('❌ Error generating transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateTransactions()
