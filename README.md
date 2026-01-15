# Bitcoin Flash - Professional Next.js Application

A professional, full-featured cryptocurrency flash application built with Next.js 15, TypeScript, Prisma, and shadcn/ui components.

## 🚀 Features

### Authentication System
- ✅ User registration with email validation
- ✅ Secure login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Session management with HTTP-only cookies
- ✅ Protected routes and API endpoints

### Wallet & Payments
- ✅ User wallet dashboard with balance tracking
- ✅ Multiple package tiers (5 levels from $500 to $5000)
- ✅ Payment processing with countdown timer
- ✅ Transaction history and status tracking
- ✅ 60-minute payment cooldown system

### User Interface
- ✅ Cyber/Neon aesthetic design
- ✅ Fully responsive (mobile-first approach)
- ✅ Dark mode theme
- ✅ Sticky footer
- ✅ Smooth animations and transitions
- ✅ Professional shadcn/ui components
- ✅ Accessible and keyboard-navigable

### Technical Features
- ✅ Next.js 15 with App Router
- ✅ TypeScript 5 for type safety
- ✅ Prisma ORM with SQLite database
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ Input validation and error handling
- ✅ SEO-friendly structure

## 📦 Package Tiers

| Package | USDT Amount | BTC Amount | Price | Duration | Transfers |
|---------|-------------|------------|-------|----------|-----------|
| Flash Starter | 150,000 | 100 | $500 | 45 days | 27 |
| Flash Pro | 250,000 | 200 | $1,000 | 45 days | 27 |
| Flash Elite | 300,000 | 230 | $1,500 | 45 days | 27 |
| Whale Tier | 500,000 | 570 | $3,000 | 45 days | 27 |
| Ultimate Flash | 1,000,000 | 1,000 | $5,000 | 45 days | 27 |

## 🎨 Design System

### Color Palette
- **Primary:** Cyan (#00f3ff)
- **Secondary:** Purple (#bc13fe)
- **Success:** Emerald (#00ff9d)
- **Error:** Red (#ff0055)
- **Background:** Dark gradient (#050510 to #0a0a1f)
- **Text:** White (#ffffff) and Gray (#a0a0c0)

### Typography
- Headings: Bold, uppercase for main titles
- Body: System fonts for optimal readability
- Monospace: For wallet addresses and IDs

## 🔧 Tech Stack

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT with HTTP-only cookies

### Frontend
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect)
- **Forms:** Controlled components with validation

### Backend
- **API:** Next.js API Routes
- **Database:** Prisma Client
- **Security:** bcryptjs, jose (JWT)
- **Validation:** Input sanitization and type checking

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── packages/route.ts
│   │   └── payment/route.ts
│   └── page.tsx
├── components/
│   └── ui/          # shadcn/ui components
└── lib/
    └── db.ts        # Prisma client

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seed script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/me` - Get current authenticated user

### Data
- `GET /api/packages` - Retrieve all available packages

### Payments
- `POST /api/payment` - Process payment transaction

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and Bun
- Modern web browser

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
# .env
DATABASE_URL=file:./db/custom.db
JWT_SECRET=your-secret-key-here
```

3. Initialize database:
```bash
bun run db:push
bun run prisma/seed.ts
```

4. Start development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
bun run build
bun run start
```

## 🛡️ Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **HTTP-Only Cookies:** Prevents XSS attacks
- **Input Validation:** All inputs sanitized
- **SQL Injection Protection:** Prisma ORM parameterized queries
- **CSRF Protection:** SameSite cookie attribute

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🧪 Code Quality

- **ESLint:** Configured with Next.js rules
- **TypeScript:** Strict type checking enabled
- **Code Style:** Consistent formatting and naming conventions

## 📄 License

This is a demonstration application. Use responsibly and in compliance with applicable laws and regulations.

## 🤝 Support

For issues or questions, please refer to the worklog.md file for detailed implementation notes.

---

**Built with ❤️ using Next.js 15 and modern web technologies**
