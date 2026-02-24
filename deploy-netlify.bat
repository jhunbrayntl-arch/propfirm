@echo off
echo ========================================
echo PropFirm - Netlify Deployment Script
echo ========================================
echo.

echo [1/4] Installing Netlify CLI...
npm install -g netlify-cli

echo.
echo [2/4] Building frontend...
cd frontend
call npm install
call npm run build

echo.
echo [3/4] Linking to Netlify...
netlify link

echo.
echo [4/4] Deploying to production...
netlify deploy --prod

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set NEXT_PUBLIC_API_URL in Netlify dashboard
echo 2. Deploy backend to Render/Railway
echo 3. Update NEXT_PUBLIC_API_URL with backend URL
echo.
pause
