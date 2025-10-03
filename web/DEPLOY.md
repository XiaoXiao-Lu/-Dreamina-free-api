# Dreamina AI Web 部署指南

本文档详细说明如何在不同环境下部署 Dreamina AI Web 版本。

## 📋 目录

- [本地开发部署](#本地开发部署)
- [局域网部署](#局域网部署)
- [云服务器部署](#云服务器部署)
- [Docker 部署](#docker-部署)
- [常见问题](#常见问题)

---

## 🏠 本地开发部署

### 1. 环境要求

- Python 3.7+
- pip
- 现代浏览器（Chrome, Firefox, Safari, Edge）

### 2. 快速启动

**Windows:**
```bash
cd web
start.bat
```

**Linux/Mac:**
```bash
cd web
chmod +x start.sh
./start.sh
```

### 3. 手动启动

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务器
python server.py
```

### 4. 访问

打开浏览器访问: http://localhost:5000

---

## 🌐 局域网部署

### 1. 配置防火墙

**Windows:**
```powershell
# 允许 5000 端口
netsh advfirewall firewall add rule name="Dreamina Web" dir=in action=allow protocol=TCP localport=5000
```

**Linux (UFW):**
```bash
sudo ufw allow 5000/tcp
```

**Linux (iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

### 2. 获取本机 IP

**Windows:**
```bash
ipconfig
```
查找 "IPv4 地址"

**Linux/Mac:**
```bash
hostname -I
# 或
ip addr show
```

### 3. 手机访问

确保手机和电脑在同一 WiFi 网络下，然后访问:
```
http://[你的电脑IP]:5000
```

例如: `http://192.168.1.100:5000`

---

## ☁️ 云服务器部署

### 1. 服务器要求

- Ubuntu 20.04+ / CentOS 7+
- 2GB+ RAM
- Python 3.7+
- 公网 IP

### 2. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 和 pip
sudo apt install python3 python3-pip -y

# 安装项目依赖
cd /path/to/Comfyui_Free_Dreamina-main/web
pip3 install -r requirements.txt
```

### 3. 配置服务器

编辑 `server.py`，修改启动配置:

```python
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=5000,
        debug=False      # 生产环境关闭 debug
    )
```

### 4. 使用 Gunicorn 部署（推荐）

```bash
# 安装 Gunicorn
pip3 install gunicorn

# 启动服务
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

### 5. 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/dreamina
```

添加以下内容:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置:

```bash
sudo ln -s /etc/nginx/sites-available/dreamina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 配置 SSL (可选)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 7. 配置开机自启

创建 systemd 服务:

```bash
sudo nano /etc/systemd/system/dreamina.service
```

添加以下内容:

```ini
[Unit]
Description=Dreamina AI Web Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/Comfyui_Free_Dreamina-main/web
ExecStart=/usr/bin/gunicorn -w 4 -b 127.0.0.1:5000 server:app
Restart=always

[Install]
WantedBy=multi-user.target
```

启用服务:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dreamina
sudo systemctl start dreamina
sudo systemctl status dreamina
```

---

## 🐳 Docker 部署

### 1. 创建 Dockerfile

在 `web` 目录下创建 `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 复制项目文件
COPY . /app/
COPY ../core /app/core/
COPY ../config.json.template /app/

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "server.py"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  dreamina-web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./config.json:/app/config.json
    restart: unless-stopped
    environment:
      - FLASK_ENV=production
```

### 3. 构建和运行

```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

---

## 🔧 常见问题

### 1. 端口被占用

**问题**: `Address already in use`

**解决**:
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000

# 杀死进程或更改端口
```

### 2. 跨域问题

**问题**: CORS 错误

**解决**: 确保已安装 `flask-cors`:
```bash
pip install flask-cors
```

### 3. SessionID 失效

**问题**: 401 Unauthorized

**解决**:
1. 重新登录 Dreamina 官网
2. 获取新的 SessionID
3. 更新 config.json

### 4. 手机无法访问

**问题**: 手机浏览器无法打开页面

**解决**:
1. 确保手机和电脑在同一网络
2. 检查防火墙设置
3. 使用正确的 IP 地址
4. 尝试关闭 VPN

### 5. 生成速度慢

**问题**: 图片生成时间过长

**解决**:
1. 检查网络连接
2. 降低分辨率（使用 1K 或 2K）
3. 减少生成数量
4. 检查服务器负载

### 6. 内存不足

**问题**: 服务器内存占用过高

**解决**:
1. 增加服务器内存
2. 减少 Gunicorn worker 数量
3. 限制并发请求数

---

## 📊 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 配置缓存

```nginx
location /static/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将静态资源（CSS, JS, 图片）托管到 CDN。

---

## 🔒 安全建议

1. **不要暴露 SessionID**: 永远不要在前端代码中硬编码 SessionID
2. **使用 HTTPS**: 在生产环境中始终使用 SSL/TLS
3. **限制访问**: 使用防火墙限制访问来源
4. **定期更新**: 保持依赖包更新到最新版本
5. **备份配置**: 定期备份 config.json

---

## 📝 监控和日志

### 1. 查看应用日志

```bash
# 实时查看日志
tail -f /var/log/dreamina/app.log

# 使用 journalctl
sudo journalctl -u dreamina -f
```

### 2. 监控资源使用

```bash
# 查看进程状态
htop

# 查看端口监听
netstat -tlnp | grep 5000
```

---

## 🆘 获取帮助

如果遇到问题:

1. 查看日志文件
2. 检查配置文件
3. 阅读错误信息
4. 提交 Issue

---

**祝部署顺利！** 🚀

