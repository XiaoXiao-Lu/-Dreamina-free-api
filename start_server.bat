@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================================
echo   Dreamina AI Web Server
echo ============================================================
echo.
echo Starting server...
echo.

cd /d "%~dp0"

python web\server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start
    echo.
    echo Please check:
    echo 1. Python is installed (python --version)
    echo 2. Dependencies are installed (pip install -r requirements.txt)
    echo 3. Port 5000 is not in use
    echo.
    pause
)

