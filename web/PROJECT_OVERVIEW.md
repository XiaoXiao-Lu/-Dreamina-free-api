# Dreamina AI Web 版 - 项目总览

## 🎯 项目简介

这是将 ComfyUI Dreamina 插件转换为移动端友好的 Web 应用的完整实现。项目采用前后端分离架构，支持文生图和图生图功能，完美适配手机浏览器。

---

## 📁 项目结构

```
web/
├── index.html              # 主页面（完整版）
├── standalone.html         # 独立版（无需后端）
├── server.py              # Flask 后端服务器
├── requirements.txt       # Python 依赖
├── start.bat             # Windows 启动脚本
├── start.sh              # Linux/Mac 启动脚本
├── README.md             # 使用说明
├── DEPLOY.md             # 部署指南
├── PROJECT_OVERVIEW.md   # 项目总览（本文件）
│
├── css/
│   └── style.css         # 响应式样式表
│
└── js/
    ├── config.js         # 配置管理
    ├── api.js            # API 调用和本地存储
    ├── ui.js             # UI 交互逻辑
    └── app.js            # 主应用逻辑
```

---

## 🏗️ 技术架构

### 前端技术栈

- **HTML5**: 语义化标签，移动端优化
- **CSS3**: 
  - CSS Variables (主题系统)
  - Flexbox & Grid (响应式布局)
  - Animations (流畅动画)
  - Media Queries (移动端适配)
- **JavaScript (原生)**:
  - ES6+ 语法
  - Async/Await (异步处理)
  - LocalStorage (本地存储)
  - Fetch API (网络请求)

### 后端技术栈

- **Python 3.7+**
- **Flask**: 轻量级 Web 框架
- **Flask-CORS**: 跨域支持
- **原有核心模块**:
  - TokenManager: Token 和账号管理
  - ApiClient: Dreamina API 调用

---

## 🎨 设计特点

### 1. 响应式设计

- **移动端优先**: 从小屏幕开始设计
- **断点设置**:
  - 手机: < 480px
  - 平板: 480px - 768px
  - 桌面: > 768px
- **触摸优化**: 大按钮、易点击区域

### 2. 暗色主题

- 护眼的深色配色
- 高对比度文字
- 柔和的阴影效果
- 渐变色点缀

### 3. 用户体验

- **即时反馈**: Toast 提示、加载动画
- **进度显示**: 实时生成进度
- **历史记录**: 保存生成历史
- **图片预览**: 全屏预览和下载

---

## 🔄 数据流程

### 文生图流程

```
用户输入
  ↓
前端验证
  ↓
发送 POST /api/generate/t2i
  ↓
后端接收参数
  ↓
调用 ApiClient.generate_t2i()
  ↓
TokenManager 生成签名
  ↓
请求 Dreamina API
  ↓
轮询查询状态
  ↓
下载生成的图片
  ↓
返回图片 URLs
  ↓
前端显示结果
```

### 图生图流程

```
用户上传参考图
  ↓
前端转换为 Blob
  ↓
发送 POST /api/generate/i2i (FormData)
  ↓
后端保存临时文件
  ↓
调用 ApiClient.generate_i2i()
  ↓
上传参考图到 Dreamina
  ↓
发起图生图请求
  ↓
轮询查询状态
  ↓
下载生成的图片
  ↓
清理临时文件
  ↓
返回结果
  ↓
前端显示
```

---

## 💾 数据存储

### LocalStorage 结构

```javascript
{
  // 账号列表
  "dreamina_accounts": [
    {
      "id": "1234567890",
      "sessionId": "xxx",
      "description": "账号1",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  
  // 当前账号
  "dreamina_current_account": "1234567890",
  
  // 历史记录
  "dreamina_history": [
    {
      "id": "1234567890",
      "prompt": "一只可爱的小猫",
      "model": "3.0",
      "resolution": "2k",
      "ratio": "1:1",
      "mode": "t2i",
      "images": ["url1", "url2"],
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  
  // 用户设置
  "dreamina_settings": {
    "model": "3.0",
    "resolution": "2k",
    "ratio": "1:1"
  }
}
```

---

## 🔌 API 接口

### 1. 健康检查

```
GET /api/health
```

**响应**:
```json
{
  "status": "ok",
  "message": "Dreamina AI Web Server is running"
}
```

### 2. 获取账号列表

```
GET /api/accounts
```

**响应**:
```json
{
  "success": true,
  "accounts": [
    {
      "id": "0",
      "description": "账号1",
      "sessionId": "xxx..."
    }
  ]
}
```

### 3. 获取积分信息

```
GET /api/accounts/:id/credit
```

**响应**:
```json
{
  "success": true,
  "credit": {
    "total_credit": 100,
    "gift_credit": 50,
    "purchase_credit": 50,
    "vip_credit": 0
  }
}
```

### 4. 文生图

```
POST /api/generate/t2i
Content-Type: application/json

{
  "prompt": "一只可爱的小猫",
  "model": "3.0",
  "resolution": "2k",
  "ratio": "1:1",
  "seed": -1
}
```

**响应**:
```json
{
  "success": true,
  "taskId": "xxx",
  "message": "任务已提交"
}
```

### 5. 图生图

```
POST /api/generate/i2i
Content-Type: multipart/form-data

params: {"prompt": "...", "model": "3.0", ...}
image_0: [File]
image_1: [File]
```

**响应**:
```json
{
  "success": true,
  "completed": true,
  "images": ["url1", "url2"],
  "historyId": "xxx"
}
```

### 6. 查询状态

```
GET /api/generate/status/:taskId
```

**响应**:
```json
{
  "success": true,
  "completed": true,
  "images": ["url1", "url2"]
}
```

---

## 🎯 核心功能

### 1. 账号管理

- ✅ 添加多个账号
- ✅ 切换当前账号
- ✅ 删除账号
- ✅ 查看积分信息

### 2. 图片生成

- ✅ 文生图（T2I）
- ✅ 图生图（I2I，最多6张参考图）
- ✅ 多模型支持
- ✅ 多分辨率（1K/2K/4K）
- ✅ 多比例选择
- ✅ 自定义种子

### 3. 用户界面

- ✅ 响应式设计
- ✅ 暗色主题
- ✅ 侧边栏菜单
- ✅ 模态框
- ✅ Toast 提示
- ✅ 加载动画
- ✅ 进度条

### 4. 数据管理

- ✅ 本地存储
- ✅ 历史记录
- ✅ 设置保存
- ✅ 图片预览
- ✅ 图片下载

---

## 🚀 部署方式

### 1. 本地开发

```bash
python server.py
```

访问: http://localhost:5000

### 2. 局域网访问

```bash
python server.py
```

访问: http://[你的IP]:5000

### 3. 云服务器

使用 Gunicorn + Nginx:

```bash
gunicorn -w 4 -b 127.0.0.1:5000 server:app
```

### 4. Docker

```bash
docker-compose up -d
```

---

## 🔒 安全考虑

### 1. SessionID 保护

- ❌ 不在前端硬编码
- ✅ 存储在 LocalStorage
- ✅ 仅在后端使用
- ✅ 定期更新

### 2. HTTPS

- 生产环境必须使用 HTTPS
- 使用 Let's Encrypt 免费证书

### 3. CORS

- 配置允许的来源
- 限制请求方法

### 4. 输入验证

- 前端验证
- 后端二次验证
- 防止 XSS 和注入

---

## 📊 性能优化

### 1. 前端优化

- CSS/JS 压缩
- 图片懒加载
- 使用 CDN
- 浏览器缓存

### 2. 后端优化

- Gunicorn 多进程
- 连接池
- 缓存机制
- 异步处理

### 3. 网络优化

- Gzip 压缩
- HTTP/2
- 减少请求数
- 资源合并

---

## 🐛 已知问题

### 1. 跨域限制

独立版本（standalone.html）由于浏览器的 CORS 限制，无法直接调用 Dreamina API。

**解决方案**:
- 使用完整版（需要后端）
- 使用浏览器 CORS 扩展（仅开发）
- 配置代理服务器

### 2. 大文件上传

图生图上传多张高清图片可能较慢。

**解决方案**:
- 前端压缩图片
- 增加超时时间
- 显示上传进度

### 3. 移动端键盘

在移动端，虚拟键盘可能遮挡输入框。

**解决方案**:
- 使用 `scrollIntoView()`
- 调整 viewport
- 监听键盘事件

---

## 🔮 未来计划

### 短期计划

- [ ] 添加更多模型支持
- [ ] 批量下载功能
- [ ] 图片编辑功能
- [ ] 分享功能

### 中期计划

- [ ] PWA 支持（离线使用）
- [ ] 多语言支持
- [ ] 主题切换（亮色/暗色）
- [ ] 高级参数调整

### 长期计划

- [ ] 用户系统
- [ ] 云端同步
- [ ] 社区功能
- [ ] AI 助手

---

## 📚 参考资料

- [Flask 文档](https://flask.palletsprojects.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Dreamina 官网](https://dreamina.capcut.com)

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤:

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

## 📄 许可证

本项目基于原 ComfyUI 插件开发，遵循相同的许可证。

---

## 📮 联系方式

如有问题或建议，请提交 Issue。

---

**感谢使用 Dreamina AI Web 版！** 🎨✨

