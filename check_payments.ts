
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const payments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      created_at: 'desc'
    },
    include: {
      user: {
        select: {
          email: true,
          account_tier: true
        }
      },
      package: {
        select: {
          name: true,
          price_usd: true
        }
      }
    }
  })

  console.log('Last 5 Payments:')
  payments.forEach(p => {
    console.log(`ID: ${p.id}`)
    console.log(`User: ${p.user.email} (${p.user.account_tier})`)
    console.log(`Package: ${p.package.name} ($${p.package.price_usd})`)
    console.log(`Commission: ${p.commission}`)
    console.log(`Status: ${p.status}`)
    console.log('---')
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
