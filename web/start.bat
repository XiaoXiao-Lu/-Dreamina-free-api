@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Dreamina AI Web Server
echo ========================================
echo.

REM 检查 Python 是否安装
echo [1/4] 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.7+
    echo.
    echo 下载地址: https://www.python.org/downloads/
    echo.
    echo 安装完成后请重新运行此脚本
    echo.
    pause
    exit /b 1
)

python --version
echo [成功] Python 已安装
echo.

REM 检查依赖
echo [2/4] 检查依赖...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo 正在安装 Flask...
    pip install flask flask-cors
    if errorlevel 1 (
        echo [错误] 安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

pip show flask-cors >nul 2>&1
if errorlevel 1 (
    echo 正在安装 Flask-CORS...
    pip install flask-cors
    if errorlevel 1 (
        echo [错误] 安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

echo [成功] 依赖检查完成
echo.

REM 检查配置文件
echo [3/4] 检查配置文件...
if not exist "..\config.json" (
    echo [警告] 未找到 config.json，正在从模板创建...
    if exist "..\config.json.template" (
        copy "..\config.json.template" "..\config.json" >nul
        echo [成功] 配置文件已创建
        echo.
        echo [重要] 请编辑 config.json 添加你的 SessionID
        echo 文件位置: %CD%\..\config.json
        echo.
        echo 获取 SessionID 的方法:
        echo 1. 访问 https://dreamina.capcut.com
        echo 2. 登录你的账号
        echo 3. 按 F12 打开开发者工具
        echo 4. Application - Cookies - sessionid
        echo 5. 复制值到 config.json
        echo.
        pause
    ) else (
        echo [错误] 未找到配置模板文件
        echo 请确保 config.json.template 存在于上级目录
        pause
        exit /b 1
    )
) else (
    echo [成功] 配置文件已存在
)
echo.

REM 获取本机 IP
echo [4/4] 获取本机 IP 地址...
set IP=未获取到
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" 2^>nul') do (
    set IP=%%a
    goto :found
)
:found
if not "%IP%"=="未获取到" (
    set IP=%IP:~1%
)
echo.

REM 启动服务器
echo ========================================
echo 启动服务器...
echo ========================================
echo.
echo [本地访问] http://localhost:5000
echo [手机访问] http://%IP%:5000
echo.
echo 提示: 按 Ctrl+C 可以停止服务器
echo ========================================
echo.

REM 检查 server.py 是否存在
if not exist "server.py" (
    echo [错误] 未找到 server.py 文件
    echo 请确保在 web 目录下运行此脚本
    pause
    exit /b 1
)

python server.py

echo.
echo.
echo 服务器已停止
pause

