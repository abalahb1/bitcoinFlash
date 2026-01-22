import { db } from '../src/lib/db'

async function checkLatestPayment() {
  try {
    const payment = await db.payment.findFirst({
      orderBy: { created_at: 'desc' },
      include: { user: true, package: true }
    })

    if (!payment) {
      console.log('No payments found')
    } else {
      console.log('Latest Payment:', {
        id: payment.id,
        user_id: payment.user_id,
        amount: payment.amount,
        commission: payment.commission,
        status: payment.status,
        created_at: payment.created_at
      })
    }
  } catch (error) {
    console.error('Error fetching payment:', error)
  } finally {
    await db.$disconnect()
  }
}

checkLatestPayment()
