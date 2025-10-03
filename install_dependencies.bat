@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================================
echo   Installing Dreamina AI Dependencies
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python 3.8 or higher from:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python detected:
python --version
echo.

REM Install main dependencies
echo Installing main dependencies...
echo.
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo [WARNING] Some dependencies failed to install
    echo This might be OK if you're using ComfyUI environment
    echo.
)

echo.
echo Installing web server dependencies...
echo.
pip install -r web\requirements.txt
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install web dependencies
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [OK] Installation complete!
echo ============================================================
echo.
echo You can now run: start_server.bat
echo.
pause

