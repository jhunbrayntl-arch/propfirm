@echo off
echo ========================================
echo Push to GitHub
echo ========================================
echo.
echo Enter your GitHub repository URL:
echo (Format: https://github.com/USERNAME/REPO_NAME.git)
echo.
set /p REPO_URL=
echo.
echo Adding remote repository...
git remote add origin %REPO_URL%
echo.
echo Pushing to GitHub...
git push -u origin main
echo.
echo ========================================
echo Done! Your code is now on GitHub
echo ========================================
echo.
echo Next: Go to https://app.netlify.com and import from Git
pause
