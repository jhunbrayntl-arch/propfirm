# ✅ Netlify Deployment Checklist

## Before Deploying

### 1. Backend Setup (Deploy First)

- [ ] Create account on Render.com or Railway.app
- [ ] Deploy PostgreSQL database
- [ ] Deploy backend as web service
- [ ] Set backend environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL` (will add Netlify URL later)
  - [ ] `PORT=5000`
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Test backend health: `https://your-backend.onrender.com/health`
- [ ] Copy backend URL for next steps

### 2. Frontend Setup

- [ ] Navigate to `frontend` folder
- [ ] Run `npm install`
- [ ] Run `npm run build` (verify no errors)
- [ ] Create Netlify account at [netlify.com](https://netlify.com)

## Deploy Frontend to Netlify

### Option A: Using Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to frontend
cd frontend

# Initialize Netlify
netlify init

# Set environment variable
netlify env:set NEXT_PUBLIC_API_URL https://your-backend.onrender.com/api

# Deploy
netlify deploy --prod
```

### Option B: Using Git Integration

- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] In Netlify dashboard: "Add new site" → "Import from Git"
- [ ] Connect Git provider and select repository
- [ ] Configure:
  - **Base directory**: `frontend`
  - **Build command**: `npm run build`
  - **Publish directory**: `.next`
- [ ] Add environment variable:
  - Key: `NEXT_PUBLIC_API_URL`
  - Value: `https://your-backend.onrender.com/api`
- [ ] Click "Deploy site"

## After Deployment

### 3. Update Backend CORS

- [ ] In Render/Railway dashboard, update `FRONTEND_URL`:
  - Value: `https://yoursite.netlify.app`
- [ ] Restart backend service
- [ ] Test CORS by visiting your Netlify site

### 4. Test Everything

- [ ] Visit Netlify site: `https://yoursite.netlify.app`
- [ ] Homepage loads correctly
- [ ] Register new account
- [ ] Login works
- [ ] Dashboard loads
- [ ] Challenges page shows data
- [ ] Open browser console (F12) - no errors
- [ ] Network tab shows successful API calls

## Troubleshooting

### Page Not Found on Netlify
- ✅ `netlify.toml` is configured with SPA redirects
- ✅ Build completes successfully
- **Fix**: Check build logs, verify `.next` folder is published

### API Calls Failing
- ✅ `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Backend is running and accessible
- **Fix**: Check Netlify environment variables, test backend directly

### CORS Errors
- ✅ Backend `FRONTEND_URL` includes Netlify domain
- ✅ Backend CORS is configured properly
- **Fix**: Update backend environment variables, restart backend

### Build Fails
- ✅ All dependencies are installed
- ✅ `package.json` has correct scripts
- **Fix**: Check build logs, clear cache and redeploy

## Quick Commands Reference

```bash
# Local testing
cd frontend && npm run dev
cd backend && npm run dev

# Deploy to Netlify
netlify deploy --prod

# Set environment variable
netlify env:set NEXT_PUBLIC_API_URL https://your-backend.onrender.com/api

# View deploy logs
netlify deploy --prod --build

# Open site in browser
netlify open
```

## Environment Variables Summary

### Netlify (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NODE_VERSION=18
NPM_VERSION=9
```

### Render/Railway (Backend)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=https://yoursite.netlify.app
STRIPE_SECRET_KEY=sk_test_... (optional)
```

## Success Indicators

✅ Backend health check returns: `{"status":"ok"}`
✅ Frontend builds without errors
✅ Homepage loads on Netlify URL
✅ Can register and login
✅ API calls show status 200 in network tab
✅ No CORS errors in console
✅ Challenges data loads
✅ Dashboard shows correctly

## Next Steps After Successful Deployment

1. **Add Custom Domain** (optional)
   - Netlify: Domain Settings → Add custom domain
   - Render: Settings → Custom Domain

2. **Enable HTTPS** (automatic on both platforms)

3. **Set up Monitoring**
   - Netlify Analytics
   - Render/Railway logs

4. **Configure Automatic Deploys**
   - Connect Git for auto-deploy on push

5. **Add SSL/TLS** (automatic)

6. **Set up Backups**
   - Database backups on Render/Railway

---

## Support Resources

- Netlify Docs: https://docs.netlify.com
- Render Docs: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

**Estimated Setup Time**: 15-20 minutes

**Cost**: 
- Netlify: Free tier (100GB/month)
- Render: Free tier available (may sleep)
- Railway: Free trial, then pay-as-you-go
