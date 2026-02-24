# Fix "Page Not Found" Error

## Quick Fix

Run these commands in order:

```bash
# 1. Go to project root
cd propfirm-platform

# 2. Install backend dependencies
cd backend
npm install
npm run prisma:generate

# 3. Install frontend dependencies (THIS IS THE KEY FIX!)
cd ../frontend
npm install

# 4. Build frontend
npm run build

# 5. Start frontend
npm run dev
```

## What Was Fixed?

The "Page not found" error usually happens because:

1. **Frontend dependencies not installed** - Next.js, React are missing
2. **Frontend not built** - Production build required
3. **Wrong API URL** - Check `.env.local` has correct backend URL

## Verify It Works

1. Open browser to `http://localhost:3000`
2. You should see the PropFirm homepage
3. Try registering a new account
4. Check browser console (F12) for any errors

## Still Not Working?

Check these files exist:
- `frontend/package.json` - should have next, react dependencies
- `frontend/.env.local` - should have NEXT_PUBLIC_API_URL
- `frontend/src/app/page.tsx` - homepage component
- `frontend/src/app/layout.tsx` - root layout

Run diagnostic:
```bash
cd frontend
npm list next react
```

Should show installed versions. If not, run `npm install` again.
