@echo off
echo ========================================
echo Starting PropFirm Platform
echo ========================================
echo.

echo Starting Backend on port 5000...
start "PropFirm Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3000...
start "PropFirm Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers starting...
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each terminal to stop
echo ========================================
