@echo off
chcp 65001 >nul
title Dreamina AI 服务器

echo ============================================================
echo Dreamina AI Web Server - 启动中...
echo ============================================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Python，请先安装Python 3.8+
    echo.
    pause
    exit /b 1
)

echo ✅ Python环境检测成功
echo.

REM 检查server.py是否存在
if not exist "web\server.py" (
    echo ❌ 错误: 未找到 web\server.py 文件
    echo 请确保在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ 服务器文件检测成功
echo.

REM 保存进程ID到文件
echo 正在启动服务器...
echo.

REM 使用pythonw.exe隐藏窗口运行
start /B pythonw web\server.py

REM 等待2秒让服务器启动
timeout /t 2 /nobreak >nul

REM 查找Python进程ID并保存
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq pythonw.exe" /FO LIST ^| find "PID:"') do (
    echo %%i > .server_pid.txt
    goto :found
)

:found
if exist .server_pid.txt (
    echo ✅ 服务器已在后台启动
    echo.
    echo ============================================================
    echo 📡 访问地址:
    echo    本地: http://localhost:5000
    echo    局域网: http://192.168.3.68:5000
    echo ============================================================
    echo.
    echo 💡 提示:
    echo    - 服务器正在后台运行
    echo    - 双击"关闭服务器.bat"可以停止服务器
    echo    - 可以关闭此窗口，服务器会继续运行
    echo ============================================================
    echo.
    
    REM 询问是否打开浏览器
    set /p open_browser="是否打开浏览器? (Y/N): "
    if /i "%open_browser%"=="Y" (
        start http://localhost:5000
        echo.
        echo ✅ 已打开浏览器
    )
) else (
    echo ❌ 服务器启动失败
    echo 请检查错误信息
)

echo.
echo 按任意键关闭此窗口...
pause >nul

