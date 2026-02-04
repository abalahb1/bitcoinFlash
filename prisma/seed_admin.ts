import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const username = 'admin'
  const email = 'mohmmaed211@gmail.com'
  const password = 'AdminPassword123!'
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    // Try to find user by email first
    const existingUser = await db.user.findFirst({
      where: { email: email }
    })

    if (existingUser) {
      console.log('Updating existing admin user...')
      const admin = await db.user.update({
        where: { id: existingUser.id },
        data: {
          username: username,
          password: hashedPassword,
          account_tier: 'gold',
          is_verified: true,
          kyc_status: 'approved'
        }
      })
      console.log('Admin user updated:', admin.username)
    } else {
      console.log('Creating new admin user...')
      // Create new if email doesn't exist
      const admin = await db.user.upsert({
        where: { username: username },
        update: {},
        create: {
          name: 'Admin User',
          username: username,
          email: email,
          password: hashedPassword,
          account_tier: 'gold',
          is_verified: true,
          kyc_status: 'approved',
          wallet_ref: 'ADMIN-001'
        }
      })
      console.log('Admin user created:', admin.username)
    }
  } catch (e) {
    console.error('Error creating admin:', e)
  }
}

createAdmin()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
