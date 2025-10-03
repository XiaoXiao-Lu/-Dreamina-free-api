@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================================
echo   Stopping Dreamina AI Server
echo ============================================================
echo.

set found=0

REM Check if PID file exists
if exist ".server_pid.txt" (
    set /p SERVER_PID=<.server_pid.txt
    echo Found saved process ID: %SERVER_PID%
    taskkill /PID %SERVER_PID% /F >nul 2>&1
    if not errorlevel 1 (
        echo [OK] Stopped process %SERVER_PID%
        set found=1
    )
    del .server_pid.txt >nul 2>&1
)

REM Kill all Python processes running server.py
echo Searching for server processes...
echo.

for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo Stopping python.exe process %%i...
        taskkill /PID %%i /F >nul 2>&1
        set found=1
    )
)

for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq pythonw.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo Stopping pythonw.exe process %%i...
        taskkill /PID %%i /F >nul 2>&1
        set found=1
    )
)

echo.
if %found%==1 (
    echo ============================================================
    echo [OK] Server stopped successfully
    echo ============================================================
) else (
    echo ============================================================
    echo [INFO] No running server found
    echo ============================================================
)
echo.
pause

