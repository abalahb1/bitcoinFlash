import { db } from '../src/lib/db'

async function diagnostics() {
  try {
    console.log('--- USER DIAGNOSTICS ---')
    const users = await db.user.findMany({
      include: {
        _count: {
          select: { payments: true }
        }
      }
    })
    
    users.forEach(u => {
      console.log(`User: ${u.email} (ID: ${u.id}) - Payments: ${u._count.payments}`)
    })

    console.log('\n--- PAYMENT DIAGNOSTICS ---')
    const payments = await db.payment.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    })

    payments.forEach(p => {
      console.log(`Payment: ${p.id} | UserID: ${p.user_id} | Status: ${p.status} | Amount: ${p.amount}`)
    })

  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}

diagnostics()
