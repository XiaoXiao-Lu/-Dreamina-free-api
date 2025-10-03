# Dreamina AI 启动指南

## 快速开始

### 1. 安装依赖

双击运行:
```
install_dependencies.bat
```

或手动安装:
```bash
pip install -r requirements.txt
pip install -r web/requirements.txt
```

### 2. 配置 Token

1. 复制配置模板:
   ```bash
   copy config.json.template config.json
   ```

2. 编辑 `config.json` 文件，填入你的 Dreamina token:
   ```json
   {
     "dreamina_token": "你的token"
   }
   ```

3. 获取 Token 的方法:
   - 打开浏览器访问 https://dreamina.com
   - 登录你的账号
   - 按 F12 打开开发者工具
   - 切换到 Network (网络) 标签
   - 刷新页面
   - 查找请求头中的 token 或 authorization 字段

### 3. 启动服务器

**方法 1: 前台启动 (推荐新手)**
```
双击: start_server.bat
```
- 显示控制台窗口
- 可以看到服务器日志
- 关闭窗口即停止服务器

**方法 2: 后台启动 (推荐)**
```
双击: start_server_background.bat
```
- 在后台运行,有控制台窗口
- 可以看到启动信息
- 需要用 stop_server.bat 停止

**方法 3: 静默后台启动 (最简洁)**
```
双击: start_server_background.vbs
```
- 完全静默启动,无窗口
- 弹窗提示启动成功
- 需要用 stop_server.bat 停止

**方法 4: 手动启动**
```bash
cd web
python server.py
```

### 4. 访问 Web 界面

服务器启动后，在浏览器中打开:
- 本地访问: http://localhost:5000
- 局域网访问: http://你的IP:5000

### 5. 检查服务器状态

```
双击: check_server_status.bat
```
- 显示服务器是否在运行
- 显示进程 ID
- 检查端口占用情况

### 6. 停止服务器

**方法 1: 使用停止脚本 (推荐)**
```
双击: stop_server.bat
```
- 自动查找并停止所有服务器进程
- 支持前台和后台进程

**方法 2: 手动停止**
- 如果是前台启动: 关闭服务器窗口或按 Ctrl+C
- 如果是后台启动: 必须使用 stop_server.bat

## 常见问题

### 问题 1: 脚本出现乱码

**原因**: Windows 终端编码问题

**解决方案**:
1. 使用新的 `start_server.bat` 脚本 (已修复编码问题)
2. 或者在 PowerShell 中运行:
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   python web\server.py
   ```

### 问题 2: Python 未找到

**解决方案**:
1. 安装 Python 3.8+: https://www.python.org/downloads/
2. 安装时勾选 "Add Python to PATH"
3. 重启终端/电脑

### 问题 3: 端口 5000 被占用

**解决方案**:
1. 修改 `web/server.py` 中的端口号
2. 或者关闭占用 5000 端口的程序:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <进程ID> /F
   ```

### 问题 4: 依赖安装失败

**解决方案**:
1. 升级 pip:
   ```bash
   python -m pip install --upgrade pip
   ```
2. 使用国内镜像:
   ```bash
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
   pip install -r web/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```

### 问题 5: Token 无效

**解决方案**:
1. 确认 token 已正确复制到 `config.json`
2. Token 可能已过期，重新获取
3. 检查 token 格式是否正确 (不要包含引号或空格)

## 文件说明

### 启动脚本
- `start_server.bat` - 前台启动 (显示控制台)
- `start_server_background.bat` - 后台启动 (有启动窗口)
- `start_server_background.vbs` - 静默后台启动 (无窗口)
- `stop_server.bat` - 停止服务器
- `check_server_status.bat` - 检查服务器状态
- `install_dependencies.bat` - 安装依赖

### 旧版脚本 (可选)
- `启动服务器.bat` - 原始启动脚本
- `关闭服务器.bat` - 原始停止脚本
- `启动服务器(静默).vbs` - 原始静默启动脚本

### 配置文件
- `config.json` - 主配置文件 (需要创建)
- `config.json.template` - 配置模板

### 核心文件
- `web/server.py` - Web 服务器
- `web/index.html` - Web 界面
- `dreamina_image_node.py` - ComfyUI 节点

## 开发模式

如果你想修改代码并实时查看效果:

1. 修改 `web/server.py`，启用调试模式:
   ```python
   app.run(host='0.0.0.0', port=5000, debug=True)
   ```

2. 启动服务器后，修改代码会自动重启服务器

## 技术支持

如果遇到其他问题:
1. 查看服务器日志输出
2. 检查浏览器控制台 (F12)
3. 提交 Issue 到项目仓库

