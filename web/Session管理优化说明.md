# 🔐 Session 管理优化说明

## 优化目标

**当前问题**: SessionID 存储在客户端（浏览器 LocalStorage），每个客户端需要单独配置

**优化方案**: SessionID 存储在服务器端（config.json），所有客户端共享配置

---

## 优化内容

### 1. 服务器端管理 ✅

**配置文件**: `config.json`

```json
{
  "accounts": [
    {
      "sessionid": "f3ee3071a720ae3d89f9c86d404e1820",
      "description": "主账号"
    }
  ]
}
```

**优势**:
- ✅ 集中管理，统一配置
- ✅ 所有客户端（PC、手机）自动同步
- ✅ 更安全，不暴露在客户端
- ✅ 易于维护和更新

---

### 2. 前端简化

**移除功能**:
- ❌ 添加账号功能
- ❌ 删除账号功能
- ❌ 编辑 SessionID 功能

**保留功能**:
- ✅ 查看账号列表（从服务器获取）
- ✅ 切换账号
- ✅ 查看积分信息

---

## 使用方式

### 管理员（服务器端）

**添加/修改账号**:

1. 编辑 `config.json` 文件
2. 在 `accounts` 数组中添加账号：
   ```json
   {
     "sessionid": "你的SessionID",
     "description": "账号描述"
   }
   ```
3. 保存文件
4. 重启服务器（或服务器会自动重新加载）

**获取 SessionID**:

1. 访问 https://dreamina.capcut.com/
2. 登录账号
3. 打开浏览器开发者工具（F12）
4. 切换到 Application/存储 标签
5. 找到 Cookies → dreamina.capcut.com
6. 复制 `sessionid` 的值

---

### 用户（客户端）

**使用步骤**:

1. 打开 Web 应用
2. 点击右上角菜单
3. 查看可用账号列表
4. 点击切换账号（如果有多个）
5. 开始使用

**无需配置** - 所有配置由服务器管理！

---

## 技术实现

### 服务器端 API

#### 1. 获取账号列表
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
      "description": "主账号",
      "sessionId": "f3ee3071a720ae3d89f9..."  // 部分隐藏
    }
  ]
}
```

#### 2. 切换账号
```
POST /api/accounts/switch
Body: { "accountId": "0" }
```

#### 3. 获取积分
```
GET /api/accounts/0/credit
```

---

### 前端修改

#### 移除的代码

**HTML** (`index.html`):
- 移除"添加账号"按钮
- 移除账号配置模态框

**JavaScript** (`ui.js`):
- 移除 `showAddAccountModal()`
- 移除 `handleAddAccount()`
- 移除 `storage.addAccount()`
- 移除 `storage.removeAccount()`

**JavaScript** (`storage.js`):
- 移除账号相关的 LocalStorage 操作
- 改为从服务器 API 获取

---

## 配置示例

### 单账号配置

```json
{
  "accounts": [
    {
      "sessionid": "f3ee3071a720ae3d89f9c86d404e1820",
      "description": "我的账号"
    }
  ]
}
```

### 多账号配置

```json
{
  "accounts": [
    {
      "sessionid": "f3ee3071a720ae3d89f9c86d404e1820",
      "description": "个人账号"
    },
    {
      "sessionid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "description": "工作账号"
    },
    {
      "sessionid": "9876543210abcdefghijklmnopqrstuv",
      "description": "测试账号"
    }
  ]
}
```

---

## 安全考虑

### 1. SessionID 保护

**服务器端**:
- ✅ SessionID 存储在服务器，不暴露给客户端
- ✅ API 返回时只显示部分 SessionID（前20个字符）
- ✅ 实际使用时从服务器端读取完整 SessionID

**客户端**:
- ✅ 不存储完整 SessionID
- ✅ 不在 URL 中传递 SessionID
- ✅ 不在日志中显示完整 SessionID

---

### 2. 访问控制

**建议**:
- 🔒 在生产环境中添加身份验证
- 🔒 限制 API 访问（IP 白名单）
- 🔒 使用 HTTPS 加密传输
- 🔒 定期更新 SessionID

**示例**（可选）:
```python
# 添加简单的 API Key 验证
API_KEY = "your-secret-api-key"

@app.before_request
def check_api_key():
    if request.path.startswith('/api/'):
        api_key = request.headers.get('X-API-Key')
        if api_key != API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401
```

---

## 迁移指南

### 从客户端存储迁移到服务器端

**步骤 1**: 导出现有账号

如果用户已经在客户端配置了账号：

1. 打开浏览器控制台（F12）
2. 运行以下代码：
   ```javascript
   console.log(JSON.stringify(
     JSON.parse(localStorage.getItem('dreamina_accounts')),
     null, 2
   ));
   ```
3. 复制输出的 JSON

**步骤 2**: 导入到服务器

1. 打开 `config.json`
2. 将账号信息添加到 `accounts` 数组
3. 保存文件

**步骤 3**: 清除客户端存储

```javascript
localStorage.removeItem('dreamina_accounts');
localStorage.removeItem('dreamina_current_account');
```

---

## 优势对比

### 客户端存储（旧方案）

| 特性 | 状态 |
|------|------|
| 配置方式 | 每个客户端单独配置 ❌ |
| 同步性 | 不同步 ❌ |
| 安全性 | SessionID 暴露在浏览器 ❌ |
| 维护性 | 需要在每个设备上更新 ❌ |
| 移动端 | 需要手动输入 ❌ |

### 服务器端存储（新方案）

| 特性 | 状态 |
|------|------|
| 配置方式 | 服务器统一配置 ✅ |
| 同步性 | 所有客户端自动同步 ✅ |
| 安全性 | SessionID 不暴露 ✅ |
| 维护性 | 只需更新服务器配置 ✅ |
| 移动端 | 无需配置，直接使用 ✅ |

---

## 常见问题

### Q1: 如何添加新账号？

**A**: 编辑服务器端的 `config.json` 文件，在 `accounts` 数组中添加新账号，然后重启服务器。

### Q2: 如何更新 SessionID？

**A**: 编辑 `config.json`，更新对应账号的 `sessionid` 字段，保存后重启服务器。

### Q3: 多个用户如何使用不同账号？

**A**: 
- 方案1: 在 `config.json` 中配置多个账号，用户在前端切换
- 方案2: 部署多个服务器实例，每个实例配置不同账号

### Q4: SessionID 会过期吗？

**A**: 是的，Dreamina 的 SessionID 会过期。过期后需要重新登录获取新的 SessionID，并更新 `config.json`。

### Q5: 如何保护 config.json 文件？

**A**: 
- 设置文件权限（Linux: `chmod 600 config.json`）
- 不要提交到 Git（添加到 `.gitignore`）
- 使用环境变量（可选）

---

## 后续优化建议

### 短期

- [ ] 添加 SessionID 有效性检查
- [ ] 自动检测 SessionID 过期
- [ ] 添加 SessionID 更新提醒

### 中期

- [ ] 支持从环境变量读取 SessionID
- [ ] 添加 Web 界面管理账号（需要管理员权限）
- [ ] 支持账号自动轮换

### 长期

- [ ] 集成 OAuth 登录
- [ ] 支持多租户
- [ ] 添加用户权限管理

---

## 总结

### ✅ 优化完成

- SessionID 统一存储在服务器端
- 所有客户端自动同步配置
- 移除前端账号管理功能
- 简化用户使用流程

### 🎯 使用体验

**管理员**:
- 在服务器端统一管理账号
- 一次配置，所有客户端生效

**用户**:
- 打开即用，无需配置
- 手机、PC 体验一致
- 自动使用服务器配置的账号

---

**🎉 现在所有客户端都可以直接使用，无需单独配置 SessionID！**

