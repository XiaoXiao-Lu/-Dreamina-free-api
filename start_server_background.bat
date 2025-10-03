@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================================
echo   Dreamina AI Web Server - Background Mode
echo ============================================================
echo.
echo Starting server in background...
echo.

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not detected
    echo Please install Python 3.8+ first
    echo.
    pause
    exit /b 1
)

REM Check if server.py exists
if not exist "web\server.py" (
    echo [ERROR] web\server.py not found
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

REM Start server in background using pythonw.exe (no console window)
start /B pythonw web\server.py

REM Wait 3 seconds for server to start
timeout /t 3 /nobreak >nul

REM Try to find the process and save PID
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq pythonw.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo %%i > .server_pid.txt
        goto :found
    )
)

:found
if exist .server_pid.txt (
    set /p SERVER_PID=<.server_pid.txt
    echo [OK] Server started in background
    echo Process ID: %SERVER_PID%
    echo.
    echo ============================================================
    echo Access URLs:
    echo    Local: http://localhost:5000
    echo    Network: http://192.168.3.68:5000
    echo ============================================================
    echo.
    echo Tips:
    echo    - Server is running in background (no window)
    echo    - Run "stop_server.bat" to stop the server
    echo    - Or check Task Manager for pythonw.exe process
    echo ============================================================
    echo.
    
    REM Ask if open browser
    set /p open_browser="Open browser? (Y/N): "
    if /i "%open_browser%"=="Y" (
        start http://localhost:5000
        echo.
        echo [OK] Browser opened
    )
) else (
    echo [ERROR] Failed to start server
    echo Please check if port 5000 is available
    echo.
)

echo.
echo Press any key to close this window...
pause >nul

