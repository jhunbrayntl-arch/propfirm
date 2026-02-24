# Quick Start Guide

## 1. Setup Database

Make sure PostgreSQL is running. Create a database:

```sql
CREATE DATABASE propfirm;
```

## 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and edit
cp .env.example .env
# Edit DATABASE_URL in .env with your PostgreSQL credentials

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates database tables)
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend runs on: http://localhost:5000

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on: http://localhost:3000

## 4. Create Admin User

You can create an admin user directly in the database or via API:

```bash
# Using Prisma Studio
npm run prisma:studio
# Navigate to User table and change role to ADMIN
```

## 5. Test the Platform

1. Visit http://localhost:3000
2. Register a new account
3. Browse challenges
4. Purchase a challenge (payment integration ready)
5. Start trading with simulated prices

## Default Configuration

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Database: PostgreSQL on localhost:5432

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database 'propfirm' exists

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Next.js will prompt for different port

### Prisma Errors
```bash
npm run prisma:generate
npm run prisma:migrate
```

## API Testing

Test with curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

1. Configure Stripe for real payments
2. Set up email notifications
3. Integrate with real trading platform (MT4/MT5)
4. Deploy to production (Vercel + Railway/Heroku)
