import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllPayments() {
  try {
    const result = await prisma.payment.deleteMany({})
    console.log(`✅ Deleted ${result.count} payment records`)
  } catch (error) {
    console.error('Error deleting payments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllPayments()
