@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================================
echo   Dreamina AI Server - Status Check
echo ============================================================
echo.

set found=0

REM Check if PID file exists
if exist ".server_pid.txt" (
    set /p SERVER_PID=<.server_pid.txt
    echo Saved Process ID: %SERVER_PID%
    
    REM Check if process is still running
    tasklist /FI "PID eq %SERVER_PID%" 2>nul | find "%SERVER_PID%" >nul
    if not errorlevel 1 (
        echo Status: RUNNING
        set found=1
    ) else (
        echo Status: NOT RUNNING (PID file is stale)
        del .server_pid.txt >nul 2>&1
    )
    echo.
)

REM Search for all server processes
echo Searching for server processes...
echo.

for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo Found: python.exe (PID: %%i)
        set found=1
    )
)

for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq pythonw.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo Found: pythonw.exe (PID: %%i) [Background]
        set found=1
    )
)

echo.
echo ============================================================
if %found%==1 (
    echo [OK] Server is RUNNING
    echo.
    echo Access URLs:
    echo    Local: http://localhost:5000
    echo    Network: http://192.168.3.68:5000
) else (
    echo [INFO] Server is NOT RUNNING
    echo.
    echo To start the server:
    echo    - Foreground: start_server.bat
    echo    - Background: start_server_background.bat
    echo    - Silent: start_server_background.vbs
)
echo ============================================================
echo.

REM Try to check if port 5000 is listening
echo Checking port 5000...
netstat -ano | find ":5000" | find "LISTENING" >nul
if not errorlevel 1 (
    echo [OK] Port 5000 is LISTENING
) else (
    echo [INFO] Port 5000 is NOT listening
)

echo.
pause

