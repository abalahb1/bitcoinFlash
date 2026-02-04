import { db } from '@/lib/db'

async function checkUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        account_tier: true,
        createdAt: true
      }
    })
    
    console.log('Total users:', users.length)
    console.log('--- Users List ---')
    users.forEach(u => {
      console.log(`Username: ${u.username} | Email: ${u.email} | Tier: ${u.account_tier}`)
    })
  } catch (e) {
    console.error('Error fetching users:', e)
  } finally {
    await db.$disconnect()
  }
}

checkUsers()
