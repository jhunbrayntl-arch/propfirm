@echo off
echo ========================================
echo PropFirm Platform - Setup Script
echo ========================================
echo.

echo [1/5] Setting up Backend...
cd backend

echo Installing backend dependencies...
call npm install

echo.
echo [2/5] Setting up database configuration...
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit backend\.env with your database credentials
    pause
)

echo.
echo [3/5] Generating Prisma client...
call npm run prisma:generate

echo.
echo [4/5] Setting up Frontend...
cd ..\frontend

echo Installing frontend dependencies...
call npm install

echo.
echo [5/5] Setup Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Make sure PostgreSQL is running
echo 2. Edit backend\.env with your database URL
echo 3. Run: npm run prisma:migrate (in backend folder)
echo 4. Run: npm run dev (from project root)
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo ========================================
pause
