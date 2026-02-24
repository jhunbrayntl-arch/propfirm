# Deployment Guide

## Quick Fix for "Page Not Found"

If you're seeing "Page not found" after deployment, follow these steps:

### For Local Development

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Setup database and run migrations:**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

4. **Start backend:**
```bash
cd backend
npm run dev
```

5. **In another terminal, start frontend:**
```bash
cd frontend
npm run dev
```

6. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### For Production Deployment

## Option 1: Vercel (Frontend) + Railway/Render (Backend)

### Deploy Backend to Railway/Render:

1. Create a new PostgreSQL database on Railway/Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Set build command: `npm install && npm run prisma:generate && npm run prisma:migrate`
5. Set start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` (from your database provider)
   - `JWT_SECRET`
   - `PORT`
   - `FRONTEND_URL` (your Vercel URL)

### Deploy Frontend to Vercel:

1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway/Render backend URL

## Option 2: Deploy Both on Same Server

### Using Docker:

Create `Dockerfile` in root:

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run prisma:generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]

# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Using PM2:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "propfirm-backend" -- run start

# Start frontend
cd frontend
pm2 start npm --name "propfirm-frontend" -- run start

# Save PM2 configuration
pm2 save
```

## Option 3: Deploy to Heroku

### Backend (Heroku):

```bash
cd backend
heroku create propfirm-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend-url.com
git subtree push --prefix backend heroku main
```

### Frontend (Heroku):

```bash
cd frontend
heroku create propfirm-frontend
heroku config:set NEXT_PUBLIC_API_URL=https://propfirm-backend.herokuapp.com
git subtree push --prefix frontend heroku main
```

## Common Issues & Solutions

### "Page Not Found" Error

**Cause:** Frontend not built or API URL not configured

**Solution:**
1. Make sure frontend is built: `npm run build`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Restart the frontend server after changes

### Database Connection Error

**Cause:** DATABASE_URL not configured or PostgreSQL not running

**Solution:**
1. Check `backend/.env` has correct `DATABASE_URL`
2. Ensure PostgreSQL is running
3. Run migrations: `npm run prisma:migrate`

### CORS Error

**Cause:** Backend CORS not configured for frontend URL

**Solution:**
1. In `backend/src/index.ts`, update CORS origin:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### API Not Reachable

**Cause:** Backend not running or wrong API URL

**Solution:**
1. Check backend is running on port 5000
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Test API directly: `curl http://localhost:5000/health`

## Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/propfirm?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_your_key"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Testing After Deployment

1. **Health Check:**
   - Visit: `https://your-backend-url.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Visit: `https://your-frontend-url.com`
   - Should see the homepage

3. **Register/Login:**
   - Try registering a new account
   - Check browser console for errors

4. **API Testing:**
   - Open browser DevTools → Network tab
   - Check if API calls are successful (status 200)

## Support

If you still face issues:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify all environment variables are set
4. Ensure database migrations have run successfully
