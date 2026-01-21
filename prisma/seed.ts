import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting database seed...\n')

  // 1. Create Admin User
  console.log('👤 Setting up Admin user...')
  const adminEmail = 'mohmmaed211@gmail.com'
  const adminPassword = '66666666'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        name: 'Admin'
      }
    })
    console.log('   ✅ Admin password updated')
  } else {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+966500000000',
        wallet_balance_usdt: 0,
        wallet_balance_btc: 0,
        wallet_ref: `BF-ADMIN-${Date.now().toString(36).toUpperCase()}`,
        is_verified: true,
        kyc_status: 'approved',
        account_tier: 'platinum'
      },
    })
    console.log('   ✅ Admin user created')
  }

  // 2. Seed Packages
  console.log('\n📦 Setting up Packages...')
  
  // Delete existing packages first
  await prisma.package.deleteMany()
  console.log('   🗑️ Cleared existing packages')

  const packages = [
    {
      name: 'Starter Package',
      usdt_amount: '9,400,000',
      btc_amount: '100',
      price_usd: 150000,
      duration: 45,
      transfers: 27,
    },
    {
      name: 'Standard Package',
      usdt_amount: '18,800,000',
      btc_amount: '200',
      price_usd: 250000,
      duration: 45,
      transfers: 27,
    },
    {
      name: 'Professional Package',
      usdt_amount: '21,620,000',
      btc_amount: '230',
      price_usd: 300000,
      duration: 45,
      transfers: 27,
    },
    {
      name: 'Enterprise Package',
      usdt_amount: '53,580,000',
      btc_amount: '570',
      price_usd: 500000,
      duration: 45,
      transfers: 27,
    },
  ]

  await prisma.package.createMany({
    data: packages,
  })
  console.log('   ✅ 4 packages created')

  // 3. Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ DATABASE SETUP COMPLETE!')
  console.log('='.repeat(50))
  console.log('\n🔐 Admin Credentials:')
  console.log(`   Email:    ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log('\n📦 Packages Created: 4')
  console.log('   - Starter Package ($150,000)')
  console.log('   - Standard Package ($250,000)')
  console.log('   - Professional Package ($300,000)')
  console.log('   - Enterprise Package ($500,000)')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
