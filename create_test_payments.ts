
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userEmail = 'mohmmaed211@gmail.com'
  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  
  if (!user) {
    console.log(`User ${userEmail} not found.`)
    return
  }
  
  console.log(`Creating test payments for: ${user.email} (${user.id})`)

  // Get a package to reference
  const pkg = await prisma.package.findFirst()
  if (!pkg) {
    console.log('No packages found to link to.')
    return
  }

  // Create 3 test payments
  const payments = await prisma.payment.createMany({
    data: [
      {
        user_id: user.id,
        package_id: pkg.id,
        amount: pkg.price_usd,
        commission: pkg.price_usd * 0.1, // 10%
        buyer_wallet: 'T9yD14Nj9j7xAB4dbGeiX9h8zzDXL5Dk',
        status: 'completed',
        created_at: new Date()
      },
      {
        user_id: user.id,
        package_id: pkg.id,
        amount: pkg.price_usd,
        commission: pkg.price_usd * 0.1,
        buyer_wallet: 'T9yD14Nj9j7xAB4dbGeiX9h8zzDXL5Dk',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000) // Yesterday
      }
    ]
  })

  console.log(`Created ${payments.count} test payments.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
