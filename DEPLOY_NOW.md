# 🚀 Netlify Deployment - Quick Start

## 5-Minute Deployment

### Step 1: Deploy Backend (5 mins)

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `propfirm-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
5. Add PostgreSQL database:
   - Click "New +" → "Database"
   - Copy the connection URL
6. Add environment variables in Render:
   ```
   DATABASE_URL = [paste from Render database]
   JWT_SECRET = your-secret-key-123456
   PORT = 5000
   ```
7. Click "Create Web Service"
8. Wait for deployment, copy your backend URL (e.g., `https://propfirm-backend.onrender.com`)

### Step 2: Deploy Frontend to Netlify (3 mins)

#### Option A: Using Netlify CLI (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Go to frontend folder
cd frontend

# Login to Netlify
netlify login

# Initialize (first time only)
netlify init

# Set backend URL (use your Render URL from Step 1)
netlify env:set NEXT_PUBLIC_API_URL https://propfirm-backend.onrender.com/api

# Deploy!
netlify deploy --prod
```

#### Option B: Deploy via Netlify Dashboard

1. Go to [Netlify.com](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `frontend/.next` folder
4. After deploy, go to Site Settings → Environment Variables
5. Add: `NEXT_PUBLIC_API_URL = https://propfirm-backend.onrender.com/api`
6. Redeploy

### Step 3: Update Backend CORS (1 min)

1. In Render dashboard, add environment variable:
   ```
   FRONTEND_URL = https://yoursite.netlify.app
   ```
2. Restart the service
3. Done!

## Test Your Deployment

1. Visit your Netlify URL: `https://yoursite.netlify.app`
2. Register a new account
3. Login
4. Browse challenges

## Verify Backend is Working

Visit: `https://propfirm-backend.onrender.com/health`

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Common Issues

### "Page Not Found"
- Make sure you deployed from the `frontend` folder
- Check that `.next` folder was published

### "API Not Reachable"
- Check `NEXT_PUBLIC_API_URL` in Netlify environment variables
- Verify backend URL is correct (no trailing slash)
- Test backend health endpoint directly

### "CORS Error"
- Update `FRONTEND_URL` in Render to your Netlify URL
- Restart backend service

## Need Help?

- Full guide: [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)
- Checklist: [NETLIFY_CHECKLIST.md](NETLIFY_CHECKLIST.md)
- Troubleshooting: See NETLIFY_DEPLOY.md

---

**Your app is now live!** 🎉

- Frontend: `https://yoursite.netlify.app`
- Backend API: `https://propfirm-backend.onrender.com`
