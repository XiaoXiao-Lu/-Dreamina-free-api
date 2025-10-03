#!/bin/bash

echo "========================================"
echo "  Dreamina AI Web Server"
echo "========================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 未检测到 Python3，请先安装 Python 3.7+"
    exit 1
fi

echo "✅ Python 已安装"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if ! python3 -c "import flask" &> /dev/null; then
    echo "正在安装 Flask..."
    pip3 install flask flask-cors
fi

if ! python3 -c "import flask_cors" &> /dev/null; then
    echo "正在安装 Flask-CORS..."
    pip3 install flask-cors
fi

echo "✅ 依赖检查完成"
echo ""

# 检查配置文件
if [ ! -f "../config.json" ]; then
    echo "⚠️  未找到 config.json，正在从模板创建..."
    if [ -f "../config.json.template" ]; then
        cp "../config.json.template" "../config.json"
        echo "✅ 配置文件已创建"
        echo "⚠️  请编辑 config.json 添加你的 SessionID"
        echo ""
        read -p "按回车键继续..."
    else
        echo "❌ 未找到配置模板文件"
        exit 1
    fi
fi

# 获取本机 IP
echo "📡 获取本机 IP 地址..."
if command -v ip &> /dev/null; then
    IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -n1)
elif command -v ifconfig &> /dev/null; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
else
    IP="[无法获取]"
fi
echo ""

# 启动服务器
echo "========================================"
echo "🚀 启动服务器..."
echo "========================================"
echo ""
echo "💻 本地访问: http://localhost:5000"
echo "📱 手机访问: http://$IP:5000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

python3 server.py

