@echo off
REM 简化版启动脚本 - 用于调试

echo ========================================
echo   Dreamina AI Web Server (Simple)
echo ========================================
echo.

REM 显示当前目录
echo 当前目录: %CD%
echo.

REM 检查 Python
echo 检查 Python...
python --version
if errorlevel 1 (
    echo.
    echo 错误: 未找到 Python
    echo 请安装 Python 3.7 或更高版本
    echo.
    pause
    exit /b 1
)
echo.

REM 检查 server.py
echo 检查 server.py...
if not exist "server.py" (
    echo.
    echo 错误: 未找到 server.py
    echo 请确保在 web 目录下运行此脚本
    echo.
    dir
    echo.
    pause
    exit /b 1
)
echo 找到 server.py
echo.

REM 安装依赖
echo 安装依赖...
pip install flask flask-cors
echo.

REM 启动服务器
echo 启动服务器...
echo 访问地址: http://localhost:5000
echo.
python server.py

pause

