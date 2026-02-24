# PropFirm - Funded Trading Platform

A complete prop trading firm platform similar to FundedNext, featuring challenge evaluations, funded accounts, trading simulation, and payout management.

## Features

### 🎯 Challenge System
- **Evaluation Phase**: 10% profit target, 5% daily loss, 10% max loss
- **Verification Phase**: 5% profit target, same risk rules
- **Express Challenge**: 8% profit target, no minimum trading days
- **Direct Funding**: Skip evaluation, get funded immediately

### 💼 Funded Accounts
- Up to $200,000 in funding
- 80% profit split to trader
- Flexible withdrawal options
- Real-time performance tracking

### 📊 Trading Platform
- Simulated trading engine with real-time prices
- Support for Forex, Indices, Commodities, Crypto
- Stop Loss & Take Profit orders
- Real-time P&L calculations
- Automatic position monitoring

### 🔐 Security
- JWT authentication
- Role-based access control (Trader, Admin, Super Admin)
- Secure password hashing with bcrypt
- Protected API routes

### 💳 Payment Integration
- Stripe integration ready
- Challenge purchase flow
- Payout request and approval system
- Transaction history

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
propfirm-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, error handling
│   │   ├── services/          # Business logic
│   │   ├── index.ts           # Entry point
│   │   └── .env               # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/               # Next.js pages
    │   ├── components/        # React components
    │   ├── context/           # React context
    │   ├── lib/               # API client
    │   └── app/
    │       ├── layout.tsx
    │       └── page.tsx
    └── package.json
```

## Getting Started

### 🌐 Deploy to Netlify (Production)

For production deployment, see [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)

**Quick deploy:**
```bash
# Frontend to Netlify
cd frontend
npm install
netlify deploy --prod

# Backend to Render/Railway
# See NETLIFY_DEPLOY.md for backend deployment
```

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Quick Setup (Windows)

1. Run the setup script:
```bash
setup.bat
```

2. Edit `backend\.env` with your database credentials

3. Run database migrations:
```bash
cd backend
npm run prisma:migrate
```

4. Start both servers:
```bash
start.bat
```

### Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd propfirm-platform/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

**Important:** Make sure to install dependencies before running:

1. Navigate to frontend directory:
```bash
cd propfirm-platform/frontend
```

2. Install dependencies (required!):
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local with:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Challenges
- `GET /api/challenges/types` - Get challenge types
- `GET /api/challenges` - Get user's challenges
- `GET /api/challenges/:id` - Get challenge details
- `GET /api/challenges/:id/progress` - Get challenge progress
- `POST /api/challenges` - Create new challenge

### Accounts
- `GET /api/accounts` - Get funded accounts
- `GET /api/accounts/:id` - Get account details
- `GET /api/accounts/:id/stats` - Get account statistics
- `GET /api/accounts/:id/rules` - Get account rules
- `POST /api/accounts/:id/payout` - Request payout

### Trading
- `GET /api/trading/market` - Get market data
- `GET /api/trading/positions` - Get open positions
- `GET /api/trading/history` - Get trade history
- `POST /api/trading/open` - Open new trade
- `POST /api/trading/close/:id` - Close trade

### Admin
- `GET /api/users/admin/all` - Get all users
- `GET /api/users/admin/:id` - Get user details
- `GET /api/users/admin/dashboard/stats` - Dashboard stats
- `GET /api/payouts/admin/history` - Payout history
- `POST /api/payouts/admin/:id/approve` - Approve payout
- `POST /api/payouts/admin/:id/reject` - Reject payout

## Database Schema

### Key Models

- **User** - Traders and admins
- **Challenge** - Evaluation challenges
- **FundedAccount** - Funded trading accounts
- **Trade** - Trading positions
- **Transaction** - Payments and withdrawals
- **Payout** - Profit withdrawals
- **Violation** - Rule violations

## Challenge Rules

### Evaluation Phase
- Profit Target: 10%
- Maximum Daily Loss: 5%
- Maximum Total Loss: 10%
- Minimum Trading Days: 5
- Leverage: 1:100

### Verification Phase
- Profit Target: 5%
- Maximum Daily Loss: 5%
- Maximum Total Loss: 10%
- Minimum Trading Days: 3
- Leverage: 1:100

## Trading Instruments

- **Forex**: EURUSD, GBPUSD, USDJPY, etc.
- **Indices**: US30, SPX500, NAS100
- **Commodities**: XAUUSD (Gold), XAGUSD (Silver)
- **Crypto**: BTCUSD, ETHUSD

## Admin Features

- User management
- Challenge oversight
- Payout approval/rejection
- Dashboard statistics
- Pass rate tracking

## Troubleshooting

### "Page Not Found" Error

If you see "Page not found" after deploying or running:

**Solution 1: Install Frontend Dependencies**
```bash
cd frontend
npm install
npm run build
npm run dev
```

**Solution 2: Check API URL Configuration**
Make sure `frontend/.env.local` exists with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Solution 3: Build Frontend**
```bash
cd frontend
npm run build
npm start
```

**Solution 4: Check Backend is Running**
Visit `http://localhost:5000/health` - should return `{"status":"ok"}`

### Database Connection Error

- Ensure PostgreSQL is running
- Check `backend/.env` has correct `DATABASE_URL`
- Run: `npm run prisma:migrate`

### CORS Error

- Make sure backend `FRONTEND_URL` in `.env` matches your frontend URL
- Restart backend after changing `.env`

1. **Authentication**: JWT tokens with 7-day expiration
2. **Password**: Hashed with bcrypt (12 rounds)
3. **Authorization**: Role-based access control
4. **CORS**: Configured for specific origins
5. **Environment Variables**: Sensitive data in .env files

## Future Enhancements

- [ ] MT4/MT5/cTrader API integration
- [ ] Real trading platform bridge
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Advanced charting
- [ ] Mobile app
- [ ] Multiple language support
- [ ] KYC verification
- [ ] Automated payouts via Stripe

## License

MIT License - feel free to use for learning or commercial purposes.

## Support

For questions or issues, please check the documentation or review the code comments.

---

**Note**: This is a demonstration/prototype platform. For production use, ensure proper security measures, compliance with financial regulations, and integration with real trading platforms.
