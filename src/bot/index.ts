
import { Telegraf, Markup, Scenes, session, Context } from 'telegraf'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// Bot Token & Admin ID
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const ADMIN_ID = parseInt(process.env.ADMIN_CHAT_ID as string)

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing')
}

// Interface for Wizard Session
interface WizardSession extends Scenes.WizardSessionData {
  userData: {
    email?: string
    password?: string
    name?: string
  }
}

interface BotContext extends Context {
  scene: Scenes.SceneContextScene<BotContext, WizardSession>
  wizard: Scenes.WizardContextWizard<BotContext>
  session: WizardSession
}

// --- WIZARD: Add User ---
const addUserWizard = new Scenes.WizardScene<BotContext>(
  'ADD_USER_WIZARD',
  async (ctx) => {
    ctx.reply('👤 *New User Setup (1/3)*\n\nPlease enter the **Email Address**:', { parse_mode: 'Markdown' })
    ctx.scene.session.userData = {}
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return ctx.reply('⚠️ Please send text only.')
    ctx.scene.session.userData.email = ctx.message.text
    ctx.reply('🔑 *New User Setup (2/3)*\n\nPlease enter a **Password**:', { parse_mode: 'Markdown' })
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return ctx.reply('⚠️ Please send text only.')
    ctx.scene.session.userData.password = ctx.message.text
    ctx.reply('abc *New User Setup (3/3)*\n\nPlease enter the **Full Name**:', { parse_mode: 'Markdown' })
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return ctx.reply('⚠️ Please send text only.')
    ctx.scene.session.userData.name = ctx.message.text

    const { email, password, name } = ctx.scene.session.userData
    
    await ctx.reply(
      `📋 *Review Details*\n\nName: ${name}\nEmail: ${email}\nPassword: ${password}\n\nCreate this user?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ Yes, Create', 'confirm_create_user'),
          Markup.button.callback('❌ Cancel', 'cancel_create_user')
        ])
      }
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
     // This step catches the callback query for confirmation
     if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        if (ctx.callbackQuery.data === 'confirm_create_user') {
             const { email, password, name } = ctx.scene.session.userData
             try {
                 const hashedPassword = await bcrypt.hash(password!, 10)
                 await prisma.user.create({
                     data: {
                         email: email!,
                         password: hashedPassword,
                         name: name!,
                         wallet_ref: `REF-${Math.floor(1000 + Math.random() * 9000)}-PRO`
                     }
                 })
                 await ctx.answerCbQuery()
                 await ctx.reply('✅ User created successfully!', Markup.removeKeyboard())
                 return ctx.scene.leave()
             } catch (e) {
                 await ctx.reply('❌ Error: Email already exists.')
                 return ctx.scene.leave()
             }
        } else {
             await ctx.answerCbQuery('Cancelled')
             await ctx.reply('🚫 Operation cancelled.', Markup.removeKeyboard())
             return ctx.scene.leave()
        }
     }
  }
)

// Initialize Stage
const stage = new Scenes.Stage<BotContext>([addUserWizard])

const bot = new Telegraf<BotContext>(BOT_TOKEN)
bot.use(session())
bot.use(stage.middleware())

// Middleware: Admin Guard
bot.use(async (ctx, next) => {
  if (ctx.from?.id !== ADMIN_ID) {
    // Silent ignore or reply
    // return ctx.reply('⛔ Unauthorized.')
    return 
  }
  return next()
})

// --- MAIN MENU ---
const sendMainMenu = async (ctx: BotContext) => {
  await ctx.reply(
    '🏢 *Bitcoin Flash - Admin Dashboard*\nSelect a module below:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👥 User Management', 'menu_users')],
        [Markup.button.callback('💰 Transactions & Payments', 'menu_finance')],
        [Markup.button.callback('🆔 KYC Requests', 'menu_kyc'), Markup.button.callback('📊 System Stats', 'menu_stats')]
      ])
    }
  )
}

bot.command('start', sendMainMenu)
bot.action('menu_main', sendMainMenu)

// --- USER MODULE ---
bot.action('menu_users', async (ctx) => {
    await ctx.editMessageText('👥 *User Management*', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('➕ Create New User', 'wizard_add_user')],
            [Markup.button.callback('📜 List All Users', 'list_users')],
            [Markup.button.callback('⬅️ Back to Dashboard', 'menu_main')]
        ])
    })
})

bot.action('wizard_add_user', (ctx) => {
    ctx.scene.enter('ADD_USER_WIZARD')
})

bot.action('list_users', async (ctx) => {
    const users = await prisma.user.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
    if (users.length === 0) {
        await ctx.answerCbQuery('No users found')
        return
    }
    for (const u of users) {
        const verifyBtn = u.is_verified 
            ? Markup.button.callback('✅ Verified', `toggle_verify_${u.id}`)
            : Markup.button.callback('❌ Not Verified', `toggle_verify_${u.id}`)
        
        await ctx.reply(
            `👤 *${u.name}*\n📧 ${u.email}\n💰 USDT: $${u.wallet_balance_usdt}\n🆔 \`${u.id}\`\n${u.is_verified ? '✅ Account Verified' : '❌ Not Verified'}`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [verifyBtn],
                    [Markup.button.callback('🗑 Delete', `delete_user_${u.email}`)]
                ])
            }
        )
    }
    await ctx.reply('End of list.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to User Menu', 'menu_users')]]))
})

bot.action(/^delete_user_(.+)$/, async (ctx) => {
    const email = ctx.match[1]
    try {
        await prisma.user.delete({ where: { email } })
        await ctx.answerCbQuery('User deleted')
        await ctx.deleteMessage()
    } catch (e) {
        await ctx.answerCbQuery('Failed to delete')
    }
})

bot.action(/^toggle_verify_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            await ctx.answerCbQuery('User not found')
            return
        }
        
        const newStatus = !user.is_verified
        await prisma.user.update({ 
            where: { id }, 
            data: { is_verified: newStatus } 
        })
        
        await ctx.answerCbQuery(newStatus ? '✅ Verified' : '❌ Unverified')
        await ctx.editMessageText(
            `👤 *${user.name}*\n📧 ${user.email}\n💰 USDT: $${user.wallet_balance_usdt}\n🆔 \`${id}\`\n${newStatus ? '✅ Account Verified' : '❌ Not Verified'}`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [newStatus 
                        ? Markup.button.callback('✅ Verified', `toggle_verify_${id}`)
                        : Markup.button.callback('❌ Not Verified', `toggle_verify_${id}`)
                    ],
                    [Markup.button.callback('🗑 Delete', `delete_user_${user.email}`)]
                ])
            }
        )
    } catch (e) {
        await ctx.answerCbQuery('Failed to update')
    }
})



// --- FINANCE MODULE ---
bot.action('menu_finance', async (ctx) => {
     await ctx.editMessageText('💰 *Finance & Payments*', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('⏳ Pending Requests', 'list_pending_payments')],
            [Markup.button.callback('📜 Transaction History', 'list_history')],
            [Markup.button.callback('⬅️ Back to Dashboard', 'menu_main')]
        ])
    })
})

bot.action('list_pending_payments', async (ctx) => {
    const pending = await prisma.payment.findMany({ 
        where: { status: 'pending' },
        include: { user: true, package: true }
    })

    if (pending.length === 0) {
        await ctx.reply('✅ No pending payments found.')
        return
    }

    for (const p of pending) {
        await ctx.reply(
            `💸 *Verify Payment*\n\nUser: ${p.user.name}\nPackage: ${p.package.usdt_amount} USDT\nWallet: \`${p.buyer_wallet}\``,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('✅ Confirm', `confirm_pay_${p.id}`),
                    Markup.button.callback('❌ Reject', `reject_pay_${p.id}`)
                ])
            }
        )
    }
})

bot.action('list_history', async (ctx) => {
    const history = await prisma.payment.findMany({
        where: { status: 'completed' },
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { user: true, package: true }
    })

    if (history.length === 0) {
        await ctx.reply('📭 No transaction history.')
        return
    }

    for (const p of history) {
        await ctx.reply(
             `📅 *${new Date(p.created_at).toISOString().split('T')[0]}*\n${p.user.name} - ${p.package.name}\n+${p.package.usdt_amount} USDT`,
             Markup.inlineKeyboard([Markup.button.callback('🗑️ Delete Entry', `del_trans_${p.id}`)])
        )
    }
})

bot.action(/^confirm_pay_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    const p = await prisma.payment.findUnique({ where: { id }, include: { package: true } })
    if(!p) return ctx.answerCbQuery('Not found')
    
    await prisma.$transaction([
        prisma.payment.update({ where: { id }, data: { status: 'completed' } }),
        prisma.user.update({
            where: { id: p.user_id },
            data: {
                wallet_balance_usdt: { increment: parseFloat(p.package.usdt_amount.replace(/,/g,'')) },
                wallet_balance_btc: { increment: parseFloat(p.package.btc_amount) }
            }
        })
    ])
    
    await ctx.answerCbQuery('Confirmed!')
    await ctx.deleteMessage()
    await ctx.reply(`✅ *Payment Confirmed* for ${p.package.name}`, { parse_mode: 'Markdown' })
})

bot.action(/^reject_pay_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    await prisma.payment.update({ where: { id }, data: { status: 'failed' } })
    await ctx.answerCbQuery('Rejected')
    await ctx.deleteMessage()
})

bot.action(/^del_trans_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    await prisma.payment.delete({ where: { id } })
    await ctx.answerCbQuery('Deleted')
    await ctx.deleteMessage()
})


// --- KYC ---
bot.action('menu_kyc', async (ctx) => {
    const kycs = await prisma.user.findMany({
        where: { kyc_status: 'pending' }
    })
    
    if (kycs.length === 0) {
        await ctx.answerCbQuery('No pending KYC')
        await ctx.reply('✅ No pending KYC requests', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu_main')]]))
        return
    }
    
    for (const u of kycs) {
        await ctx.reply(
            `🆔 *KYC Request*\n\n` +
            `👤 Name: ${u.name}\n` +
            `📧 Email: ${u.email}\n` +
            `🆔 ID: \`${u.id}\`\n\n` +
            `📄 Status: Pending Review`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📄 View Passport', `see_pass_${u.id}`), Markup.button.callback('🤳 View Selfie', `see_selfie_${u.id}`)],
                    [Markup.button.callback('✅ Approve KYC', `kyc_app_${u.id}`), Markup.button.callback('❌ Reject KYC', `kyc_rej_${u.id}`)]
                ])
            }
        )
    }
})

bot.action(/^see_pass_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    const u = await prisma.user.findUnique({ where: { id } })
    if (u && u.kyc_passport_url) {
        try {
            // Check if it's base64
            if (u.kyc_passport_url.startsWith('data:')) {
                const base64Data = u.kyc_passport_url.split(',')[1]
                const buffer = Buffer.from(base64Data, 'base64')
                await ctx.replyWithPhoto({ source: buffer })
            } else {
                // Fallback for old file urls or placeholders
                const p = path.join(process.cwd(), 'public', u.kyc_passport_url)
                if(fs.existsSync(p)) await ctx.replyWithPhoto({ source: p })
                else await ctx.reply(`Image URL: ${u.kyc_passport_url}`)
            }
        } catch (e) {
            await ctx.reply('❌ Error rendering image')
        }
    } else {
        await ctx.reply('No passport uploaded')
    }
})

// View Selfie Handler
bot.action(/^see_selfie_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    const u = await prisma.user.findUnique({ where: { id } })
    if (u && u.kyc_selfie_url) {
        try {
            // Check if it's base64
            if (u.kyc_selfie_url.startsWith('data:')) {
                const base64Data = u.kyc_selfie_url.split(',')[1]
                const buffer = Buffer.from(base64Data, 'base64')
                await ctx.replyWithPhoto({ source: buffer })
            } else {
                // Fallback for old file urls
                const p = path.join(process.cwd(), 'public', u.kyc_selfie_url)
                if(fs.existsSync(p)) await ctx.replyWithPhoto({ source: p })
                else await ctx.reply(`Image URL: ${u.kyc_selfie_url}`)
            }
        } catch (e) {
            await ctx.reply('❌ Error rendering selfie')
        }
    } else {
        await ctx.reply('No selfie uploaded')
    }
})



bot.action(/^kyc_app_(.+)$/, async (ctx) => {
    const id = ctx.match[1]
    const user = await prisma.user.findUnique({ where: { id } })
    
    await prisma.user.update({ where: { id }, data: { kyc_status: 'approved' } })
    await ctx.answerCbQuery('Approved')
    await ctx.deleteMessage()
    await ctx.reply(`✅ *KYC Approved* for ${user?.name}\n\nUser has been notified.`, { parse_mode: 'Markdown' })
})
bot.action(/^kyc_rej_(.+)$/, async (ctx) => {
     const id = ctx.match[1]
     const user = await prisma.user.findUnique({ where: { id } })
     
    await prisma.user.update({ where: { id }, data: { kyc_status: 'rejected' } })
    await ctx.answerCbQuery('Rejected')
    await ctx.deleteMessage()
    await ctx.reply(`❌ *KYC Rejected* for ${user?.name}\n\nUser has been notified to resubmit.`, { parse_mode: 'Markdown' })
})

// --- STATS ---
bot.action('menu_stats', async (ctx) => {
    const userCount = await prisma.user.count()
    const payCount = await prisma.payment.count({ where: { status: 'completed' } })
    // Simple revenue calc
    const pays = await prisma.payment.findMany({ where: { status: 'completed' }, include: { package: true } })
    const revenue = pays.reduce((sum, p) => sum + p.package.price_usd, 0)
    
    await ctx.editMessageText(
        `📊 *System Statistics*\n\n` +
        `👥 Users: ${userCount}\n` +
        `✅ Completed Orders: ${payCount}\n` +
        `💰 Revenue: $${revenue.toLocaleString()}`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu_main')]])
        }
    )
})

// Launch
bot.launch().then(() => {
    console.log('🚀 Professional Bot Dashboard Online')
    bot.telegram.sendMessage(ADMIN_ID, '🚀 *Professional Dashboard Online*\nType /start to begin.', { parse_mode: 'Markdown' })
}).catch(e => console.error(e))

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
