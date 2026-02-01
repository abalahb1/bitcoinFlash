import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const result = await prisma.payment.updateMany({
        where: {
            status: 'pending',
            user: { email: 'hus11amahmed@gmail.com' }
        },
        data: { status: 'completed' }
    })
    console.log('✅ Updated', result.count, 'pending transactions to completed')
}

main()
    .catch((e) => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
