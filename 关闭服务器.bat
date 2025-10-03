@echo off
chcp 65001 >nul
title Dreamina AI 服务器 - 关闭

echo ============================================================
echo Dreamina AI Web Server - 关闭中...
echo ============================================================
echo.

REM 检查PID文件是否存在
if not exist ".server_pid.txt" (
    echo ⚠️ 未找到服务器进程ID文件
    echo 尝试查找所有Python服务器进程...
    echo.
    goto :kill_all
)

REM 读取PID
set /p SERVER_PID=<.server_pid.txt

echo 找到服务器进程ID: %SERVER_PID%
echo.

REM 尝试终止进程
taskkill /PID %SERVER_PID% /F >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 进程 %SERVER_PID% 可能已经关闭
    echo 尝试查找其他Python服务器进程...
    echo.
    goto :kill_all
) else (
    echo ✅ 服务器进程已终止
    del .server_pid.txt >nul 2>&1
    goto :success
)

:kill_all
REM 查找并终止所有运行server.py的Python进程
echo 正在查找Python服务器进程...
echo.

set found=0
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo 找到进程: %%i
        taskkill /PID %%i /F >nul 2>&1
        set found=1
    )
)

for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq pythonw.exe" /FO LIST ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "server.py" >nul
    if not errorlevel 1 (
        echo 找到进程: %%i
        taskkill /PID %%i /F >nul 2>&1
        set found=1
    )
)

if %found%==1 (
    echo.
    echo ✅ 已终止所有服务器进程
    del .server_pid.txt >nul 2>&1
    goto :success
) else (
    echo.
    echo ℹ️ 未找到运行中的服务器进程
    echo 服务器可能已经关闭
    del .server_pid.txt >nul 2>&1
    goto :end
)

:success
echo.
echo ============================================================
echo ✅ 服务器已成功关闭
echo ============================================================
goto :end

:end
echo.
echo 按任意键关闭此窗口...
pause >nul

