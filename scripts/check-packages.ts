import { db } from '../src/lib/db'

async function checkPaymentPackages() {
  try {
    const payments = await db.payment.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        package: true
      }
    })

    console.log('--- RECENT PAYMENTS ---')
    payments.forEach(p => {
      console.log(`Payment ID: ${p.id}`)
      console.log(`  Package: ${p.package ? p.package.name : 'NULL'} (ID: ${p.package_id})`)
      console.log(`  Wallet: ${p.buyer_wallet}`)
      console.log(`  Status: ${p.status}`)
      console.log('-------------------')
    })

  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}

checkPaymentPackages()
