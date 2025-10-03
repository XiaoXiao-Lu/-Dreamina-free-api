# Dreamina AI Web 版

这是 Dreamina AI 的网页版本，专为手机浏览器优化，提供完整的文生图和图生图功能。

---

## 📚 文档导航

- **[🚀 快速开始](QUICKSTART.md)** - 5分钟快速上手指南
- **[📖 完整说明](README.md)** - 详细使用说明（本文档）
- **[🚢 部署指南](DEPLOY.md)** - 各种环境部署方法
- **[📊 项目总览](PROJECT_OVERVIEW.md)** - 技术架构和设计
- **[🔄 转换总结](CONVERSION_SUMMARY.md)** - 从插件到Web的转换过程
- **[📸 界面展示](SCREENSHOTS.md)** - UI设计和截图指南

---

## ⚡ 快速开始

**Windows 用户**: 双击 `start.bat`
**Mac/Linux 用户**: 运行 `./start.sh`
**详细步骤**: 查看 [快速开始指南](QUICKSTART.md)

---

## ✨ 特性

- 📱 **移动端优化** - 完美适配手机浏览器
- 🎨 **文生图** - 根据文本描述生成图片
- 🖼️ **图生图** - 基于参考图生成新图片（最多6张）
- 👥 **多账号管理** - 支持添加和切换多个账号
- 💰 **积分管理** - 实时查看积分余额和消耗
- 📊 **历史记录** - 保存生成历史，方便重用
- 🌙 **暗色主题** - 护眼的深色界面
- ⚡ **响应式设计** - 自适应各种屏幕尺寸

## 📦 安装

### 1. 安装依赖

```bash
pip install flask flask-cors
```

### 2. 配置账号

复制配置模板并填入你的 SessionID:

```bash
cp ../config.json.template ../config.json
```

编辑 `config.json`，在 `accounts` 数组中添加你的账号信息:

```json
{
    "accounts": [
        {
            "sessionid": "你的SessionID",
            "description": "账号1"
        }
    ]
}
```

### 3. 获取 SessionID

1. 访问 [Dreamina 官网](https://dreamina.capcut.com)
2. 登录你的账号
3. 按 F12 打开开发者工具
4. 切换到 "Application" 或 "应用" 标签
5. 在左侧找到 "Cookies"
6. 找到名为 `sessionid` 的 Cookie，复制其值

## 🚀 启动

### 方法一：使用 Python 直接启动

```bash
cd web
python server.py
```

### 方法二：使用启动脚本

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

## 📱 访问

启动后，你可以通过以下方式访问:

- **本地访问**: http://localhost:5000
- **手机访问**: http://[你的电脑IP]:5000

### 如何获取电脑 IP:

**Windows:**
```bash
ipconfig
```
查找 "IPv4 地址"

**Linux/Mac:**
```bash
ifconfig
```
或
```bash
ip addr
```

## 🎯 使用指南

### 1. 添加账号

1. 点击右上角菜单按钮
2. 在侧边栏点击 "添加账号"
3. 输入 SessionID 和账号描述
4. 点击确认

### 2. 文生图

1. 确保已选择账号
2. 在提示词框输入描述
3. 选择模型、分辨率、比例
4. 点击 "开始生成"
5. 等待生成完成

### 3. 图生图

1. 切换到 "图生图" 模式
2. 上传 1-6 张参考图
3. 输入提示词
4. 选择参数
5. 点击 "开始生成"

### 4. 查看历史

- 在主页底部可以看到历史记录
- 点击历史记录可以快速加载之前的参数

## ⚙️ 配置说明

### 模型选择

- **NanoBanana** - 谷歌最新模型，影视质感
- **图片 4.0** - 最新版本，文字更准确
- **图片 3.0** - 推荐使用，平衡性能和质量
- **图片 2.1** - 稳定的结构和影视质感
- **图片 1.4** - 多样的风格组合

### 分辨率

- **1K** - 快速生成，适合预览
- **2K** - 推荐使用，质量和速度平衡
- **4K** - 最高质量，生成较慢

### 比例

- **1:1** - 方形，适合头像、图标
- **16:9** - 横屏，适合壁纸、海报
- **9:16** - 竖屏，适合手机壁纸
- **4:3, 3:4, 2:3, 3:2** - 其他常用比例

## 💡 积分说明

- **文生图**: 每次消耗 2 积分
- **图生图**: 每次消耗 4 积分
- 积分不足时会提示，请及时充值或切换账号

## 🔧 故障排除

### 1. 无法连接服务器

- 检查 Python 是否正确安装
- 确认端口 5000 未被占用
- 检查防火墙设置

### 2. SessionID 无效

- 重新登录 Dreamina 官网
- 获取新的 SessionID
- 更新 config.json

### 3. 生成失败

- 检查网络连接
- 确认账号积分充足
- 查看控制台错误信息

### 4. 手机无法访问

- 确保手机和电脑在同一网络
- 检查电脑防火墙设置
- 使用正确的 IP 地址

## 📝 开发说明

### 项目结构

```
web/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── config.js      # 配置文件
│   ├── api.js         # API 调用
│   ├── ui.js          # UI 交互
│   └── app.js         # 主应用逻辑
├── server.py          # Flask 后端服务器
├── start.bat          # Windows 启动脚本
├── start.sh           # Linux/Mac 启动脚本
└── README.md          # 说明文档
```

### 技术栈

- **前端**: HTML5, CSS3, JavaScript (原生)
- **后端**: Python Flask
- **存储**: LocalStorage (浏览器本地存储)
- **UI**: 响应式设计，移动端优先

### API 接口

- `GET /api/health` - 健康检查
- `GET /api/accounts` - 获取账号列表
- `GET /api/accounts/:id/credit` - 获取积分信息
- `POST /api/generate/t2i` - 文生图
- `POST /api/generate/i2i` - 图生图
- `GET /api/generate/status/:id` - 查询生成状态

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于原 ComfyUI 插件开发，遵循相同的许可证。

## ⚠️ 免责声明

- 本工具仅供学习和研究使用
- 使用本工具需要切换至特殊的网络环境
- 请遵守 Dreamina 服务条款
- 生成的内容请合法使用

## 🔗 相关链接

- [Dreamina 官网](https://dreamina.capcut.com)
- [原 ComfyUI 插件](https://github.com/Lingyuzhou111/Comfyui_Free_Dreamina)

## 📮 联系方式

如有问题或建议，请提交 Issue。

---

**享受创作的乐趣！** 🎨✨

