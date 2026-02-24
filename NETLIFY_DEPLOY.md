# Netlify Deployment Guide

## Quick Deploy to Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

```bash
# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Navigate to frontend directory
cd frontend

# 4. Install dependencies
npm install

# 5. Link to your Netlify site
netlify link

# 6. Set environment variables
netlify env:set NEXT_PUBLIC_API_URL https://your-backend.onrender.com/api

# 7. Deploy to production
netlify deploy --prod
```

### Option 2: Deploy via Git (GitHub/GitLab/Bitbucket)

1. **Push your code to Git repository**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/propfirm-platform.git
git push -u origin main
```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

4. **Add Environment Variables**
   In Netlify Dashboard → Site Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://yoursite.netlify.app`

### Option 3: Drag & Drop Deploy

```bash
# 1. Build the frontend
cd frontend
npm install
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy the .next folder
netlify deploy --prod --dir=.next
```

## Backend Deployment (Required)

Since Netlify is for frontend hosting, deploy your backend separately:

### Option A: Deploy Backend to Render

1. Create account at [render.com](https://render.com)

2. Create new Web Service:
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`

3. Add Environment Variables in Render:
   ```
   DATABASE_URL = postgresql://...
   JWT_SECRET = your-secret-key
   PORT = 5000
   FRONTEND_URL = https://yoursite.netlify.app
   ```

4. Create PostgreSQL database on Render:
   - Click "New" → "Database"
   - Copy the connection URL
   - Add to `DATABASE_URL` environment variable

5. Run migrations:
   ```bash
   # In Render dashboard, open shell
   npx prisma migrate deploy
   ```

### Option B: Deploy Backend to Railway

1. Create account at [railway.app](https://railway.app)

2. Deploy PostgreSQL:
   - Click "New Project" → "Provision PostgreSQL"

3. Deploy Backend:
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Set **Root Directory**: `backend`
   - Add environment variables

4. Railway will auto-detect and deploy

### Option C: Deploy Backend to Vercel (Serverless)

1. Modify backend for serverless (create `api/index.js`)
2. Deploy to Vercel as serverless functions

## Environment Variables Setup

### Netlify (Frontend)

Add these in Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` |
| `NODE_VERSION` | `18` |
| `NPM_VERSION` | `9` |

### Render/Railway (Backend)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/propfirm` |
| `JWT_SECRET` | `your-super-secret-key-change-this` |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://yoursite.netlify.app` |
| `STRIPE_SECRET_KEY` | `sk_test_your_key` (optional) |

## Update API URL After Deployment

After deploying backend, update frontend:

### Method 1: Netlify Dashboard
1. Go to Site Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Set to your backend URL (e.g., `https://your-backend.onrender.com/api`)
4. Redeploy: Site Settings → Deploys → Trigger deploy

### Method 2: Netlify CLI
```bash
netlify env:set NEXT_PUBLIC_API_URL https://your-backend.onrender.com/api
netlify deploy --prod
```

## Testing After Deployment

### 1. Test Frontend
```bash
# Visit your Netlify URL
https://yoursite.netlify.app
```

### 2. Test Backend Health
```bash
# Visit your backend URL
https://your-backend.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Test API Connection
Open browser console on your Netlify site and run:
```javascript
fetch('https://your-backend.onrender.com/api/challenges/types')
  .then(r => r.json())
  .then(console.log)
```

### 4. Test Full Flow
1. Register new account
2. Login
3. Browse challenges
4. Check browser console for errors

## Common Issues & Solutions

### Issue: "Page Not Found" on Netlify

**Solution:** The `netlify.toml` already includes SPA fallback redirects. Make sure:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: CORS Error

**Solution:** Update backend CORS settings:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Issue: API Not Reachable

**Solutions:**
1. Check backend is deployed and running
2. Verify `NEXT_PUBLIC_API_URL` in Netlify environment variables
3. Test backend health endpoint directly
4. Check backend logs for errors

### Issue: Database Connection Failed

**Solutions:**
1. Verify `DATABASE_URL` in backend environment variables
2. Ensure PostgreSQL is running
3. Run migrations: `npx prisma migrate deploy`

### Issue: Build Fails on Netlify

**Solutions:**
1. Check build logs in Netlify dashboard
2. Verify `frontend/package.json` has all dependencies
3. Try clearing cache and redeploying:
   ```bash
   netlify deploy --prod --force
   ```

## Custom Domain Setup

### On Netlify:
1. Go to Domain Settings
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### On Render:
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

## Continuous Deployment

With Git-based deployment, every push to `main` branch will:
1. Trigger Netlify build (frontend)
2. Trigger Render build (backend)
3. Deploy automatically

## Monitoring

### Netlify Analytics
- Enable in Netlify Dashboard
- View visits, bandwidth, popular pages

### Backend Monitoring
- Render: Check Logs tab
- Railway: Check Logs and Metrics
- Set up alerts for downtime

## Cost Optimization

### Netlify Free Tier:
- 100GB bandwidth/month
- Unlimited sites
- 300 build minutes/month

### Render Free Tier:
- 750 hours/month (shared between services)
- PostgreSQL: 1GB storage
- May sleep after inactivity

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use strong JWT_SECRET**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable HTTPS** (automatic on Netlify/Render)

4. **Set up CORS properly** in backend

5. **Use environment variables** for all secrets

## Support

For issues:
1. Check Netlify deploy logs
2. Check backend logs (Render/Railway dashboard)
3. Test API endpoints directly
4. Review browser console for errors

---

**Your Netlify site will be live at:** `https://yoursite.netlify.app`

**Your backend API will be at:** `https://your-backend.onrender.com`
