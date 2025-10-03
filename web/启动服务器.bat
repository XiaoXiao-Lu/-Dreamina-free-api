@echo off
title Dreamina AI Web Server
color 0A

echo.
echo ========================================
echo   Dreamina AI Web Server
echo ========================================
echo.
echo 正在启动服务器...
echo.

python server.py

if errorlevel 1 (
    echo.
    echo [错误] 服务器启动失败
    echo.
    pause
)

