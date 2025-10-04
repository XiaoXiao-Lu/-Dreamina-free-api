@echo off
chcp 65001 >nul
echo ========================================
echo    Clear Browser Cache Helper
echo ========================================
echo.
echo This script will help you clear browser cache
echo.
echo Please follow these steps:
echo.
echo 1. Close all browser windows
echo 2. Press any key to continue...
pause >nul
echo.
echo 3. Open your browser
echo 4. Press Ctrl + Shift + Delete
echo 5. Select "Cached images and files"
echo 6. Click "Clear data"
echo.
echo Or use these shortcuts:
echo   - Chrome/Edge: Ctrl + Shift + Delete
echo   - Firefox: Ctrl + Shift + Delete
echo   - Safari: Cmd + Option + E
echo.
echo After clearing cache:
echo 1. Visit: http://localhost:5000/check-version.html
echo 2. Check if all items show green checkmarks
echo 3. If yes, go to: http://localhost:5000
echo.
echo Press any key to open check-version page...
pause >nul
start http://localhost:5000/check-version.html
echo.
echo Done!
pause

