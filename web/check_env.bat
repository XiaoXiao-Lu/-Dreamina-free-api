@echo off
REM 环境检查脚本

echo ========================================
echo   环境诊断工具
echo ========================================
echo.

echo [1] 检查当前目录
echo 当前目录: %CD%
echo.
echo 目录内容:
dir /b
echo.

echo [2] 检查 Python
python --version 2>nul
if errorlevel 1 (
    echo [失败] 未找到 Python
    echo.
    echo 可能的原因:
    echo - Python 未安装
    echo - Python 未添加到 PATH 环境变量
    echo.
    echo 解决方法:
    echo 1. 下载 Python: https://www.python.org/downloads/
    echo 2. 安装时勾选 "Add Python to PATH"
    echo.
) else (
    echo [成功] Python 已安装
)
echo.

echo [3] 检查 pip
pip --version 2>nul
if errorlevel 1 (
    echo [失败] 未找到 pip
) else (
    echo [成功] pip 已安装
)
echo.

echo [4] 检查 Flask
pip show flask 2>nul
if errorlevel 1 (
    echo [失败] Flask 未安装
    echo 运行以下命令安装: pip install flask
) else (
    echo [成功] Flask 已安装
)
echo.

echo [5] 检查 Flask-CORS
pip show flask-cors 2>nul
if errorlevel 1 (
    echo [失败] Flask-CORS 未安装
    echo 运行以下命令安装: pip install flask-cors
) else (
    echo [成功] Flask-CORS 已安装
)
echo.

echo [6] 检查必要文件
if exist "server.py" (
    echo [成功] server.py 存在
) else (
    echo [失败] server.py 不存在
)

if exist "index.html" (
    echo [成功] index.html 存在
) else (
    echo [失败] index.html 不存在
)

if exist "..\config.json.template" (
    echo [成功] config.json.template 存在
) else (
    echo [失败] config.json.template 不存在
)

if exist "..\config.json" (
    echo [成功] config.json 存在
) else (
    echo [警告] config.json 不存在 (首次运行会自动创建)
)
echo.

echo [7] 检查核心模块
if exist "..\core\token_manager.py" (
    echo [成功] token_manager.py 存在
) else (
    echo [失败] token_manager.py 不存在
)

if exist "..\core\api_client.py" (
    echo [成功] api_client.py 存在
) else (
    echo [失败] api_client.py 不存在
)
echo.

echo ========================================
echo   诊断完成
echo ========================================
echo.

echo 如果所有检查都通过，可以运行 start.bat 启动服务器
echo 如果有失败项，请根据提示解决问题
echo.

pause

