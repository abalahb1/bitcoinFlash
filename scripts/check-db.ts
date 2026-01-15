import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const packages = await prisma.package.findMany({
    orderBy: { price_usd: 'asc' }
  })

  console.log('📦 Available Packages:')
  console.log('─'.repeat(80))
  
  packages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.name}`)
    console.log(`   USDT: ${pkg.usdt_amount} | BTC: ${pkg.btc_amount}`)
    console.log(`   Price: $${pkg.price_usd} | Duration: ${pkg.duration} days`)
    console.log('')
  })

  const userCount = await prisma.user.count()
  console.log(`\n👥 Total Users: ${userCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
