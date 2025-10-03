# 🔧 API 参数错误修复说明

## 问题描述

**错误信息**: `API错误: 1000 - invalid parameter`

**原因**: 服务器端没有正确处理分辨率参数，导致传递给 Dreamina API 的参数不完整或不正确。

---

## 问题分析

### 1. 配置文件结构

配置文件 `config.json` 中的比例配置是按分辨率分组的：

```json
{
  "params": {
    "1k_ratios": {
      "1:1": {"width": 1328, "height": 1328},
      ...
    },
    "2k_ratios": {
      "1:1": {"width": 2048, "height": 2048},
      ...
    },
    "4k_ratios": {
      "1:1": {"width": 4096, "height": 4096},
      ...
    }
  }
}
```

### 2. API 客户端期望

`core/api_client.py` 中的 `generate_t2i()` 方法期望：

1. `config["params"]["ratios"]` - 当前分辨率的比例配置
2. `config["params"]["resolution_type"]` - 分辨率类型 (1k/2k/4k)

### 3. 原始问题

原始的 `server.py` 代码：

```python
# ❌ 错误：没有设置 ratios 和 resolution_type
result = api_client.generate_t2i(
    prompt=prompt,
    model=model,
    ratio=ratio,
    seed=seed
)
```

这导致 API 客户端无法找到正确的尺寸配置，生成的请求参数不完整。

---

## 解决方案

### 修复内容

在调用 API 之前，临时修改配置以包含正确的分辨率和比例信息：

```python
# ✅ 正确：设置分辨率和对应的比例配置
original_resolution = config.get("params", {}).get("resolution_type")
original_ratios = config.get("params", {}).get("ratios")

# 设置分辨率类型
config["params"]["resolution_type"] = resolution

# 根据分辨率设置对应的比例配置
resolution_ratios_key = f"{resolution}_ratios"
if resolution_ratios_key in config.get("params", {}):
    config["params"]["ratios"] = config["params"][resolution_ratios_key]
else:
    # 默认使用 2k
    config["params"]["ratios"] = config["params"].get("2k_ratios", {})

try:
    # 调用 API 客户端
    result = api_client.generate_t2i(
        prompt=prompt,
        model=model,
        ratio=ratio,
        seed=seed
    )
finally:
    # 恢复原始配置
    if original_resolution:
        config["params"]["resolution_type"] = original_resolution
    if original_ratios:
        config["params"]["ratios"] = original_ratios
```

### 修改的文件

- `web/server.py`
  - `generate_t2i()` 函数 (第 177-269 行)
  - `generate_i2i()` 函数 (第 271-384 行)

---

## 工作流程

### 完整的参数处理流程

```
前端发送请求
  ↓
{
  "prompt": "一只可爱的猫",
  "model": "3.0",
  "ratio": "1:1",
  "resolution": "2k",  ← 关键参数
  "seed": -1
}
  ↓
server.py 接收
  ↓
临时修改配置:
  config["params"]["resolution_type"] = "2k"
  config["params"]["ratios"] = config["params"]["2k_ratios"]
  ↓
调用 api_client.generate_t2i()
  ↓
API 客户端读取配置:
  - resolution_type: "2k"
  - ratios["1:1"]: {"width": 2048, "height": 2048}
  ↓
构建正确的 API 请求
  ↓
发送到 Dreamina API ✅
  ↓
恢复原始配置
```

---

## 测试验证

### 1. 刷新浏览器

```
按 Ctrl+F5 强制刷新
```

### 2. 测试文生图

1. 输入提示词: "一只可爱的橘猫"
2. 选择模型: 3.0 或 4.0
3. 选择比例: 1:1
4. 选择分辨率: 2k
5. 点击生成

### 3. 查看日志

服务器日志应该显示：

```
2025-10-03 18:04:xx - __main__ - INFO - 开始文生图: 一只可爱的橘猫...
2025-10-03 18:04:xx - __main__ - INFO - 参数: model=3.0, ratio=1:1, resolution=2k, seed=-1
2025-10-03 18:04:xx - core.api_client - INFO - [Dreamina] 🔍 跳过SessionID验证，直接使用配置的SessionID
2025-10-03 18:04:xx - core.api_client - INFO - [Dreamina] 📋 使用模型: 3.0 -> high_aes_general_v30
2025-10-03 18:04:xx - core.api_client - INFO - [Dreamina] 🎨 开始文生图请求...
2025-10-03 18:04:xx - core.api_client - INFO - [Dreamina] ✅ 文生图请求成功
```

**不应该再看到**: `❌ API错误: 1000 - invalid parameter`

---

## 支持的分辨率

### 1k 分辨率
- 1:1 → 1328×1328
- 2:3 → 1056×1584
- 3:4 → 1104×1472
- 4:3 → 1472×1104
- 3:2 → 1584×1056
- 16:9 → 1664×936
- 9:16 → 936×1664

### 2k 分辨率 (默认)
- 1:1 → 2048×2048
- 2:3 → 1664×2496
- 3:4 → 1728×2304
- 4:3 → 2304×1728
- 3:2 → 2496×1664
- 16:9 → 2560×1440
- 9:16 → 1440×2560

### 4k 分辨率
- 1:1 → 4096×4096
- 2:3 → 3328×4992
- 3:4 → 3520×4693
- 4:3 → 4693×3520
- 3:2 → 4992×3328
- 16:9 → 5404×3040
- 9:16 → 3040×5404

---

## 常见问题

### Q1: 还是显示 invalid parameter 错误？

**A**: 检查以下几点：
1. 服务器是否已重启
2. 浏览器是否已刷新 (Ctrl+F5)
3. SessionID 是否有效
4. 模型名称是否正确

### Q2: 如何验证配置是否正确？

**A**: 查看服务器日志中的参数信息：
```
INFO - 参数: model=3.0, ratio=1:1, resolution=2k, seed=-1
```

### Q3: 为什么要临时修改配置？

**A**: 因为：
1. API 客户端从全局配置读取参数
2. 每个请求可能使用不同的分辨率
3. 需要动态切换分辨率配置
4. 使用 try-finally 确保配置恢复

### Q4: 会不会影响并发请求？

**A**: 
- **短期**: 可能有轻微影响（配置是全局的）
- **长期**: 建议重构为每个请求独立配置
- **当前**: 对于单用户使用没有问题

---

## 技术细节

### 配置修改的线程安全性

当前实现使用全局配置对象，在高并发场景下可能存在竞态条件。

**当前方案** (适用于单用户):
```python
config["params"]["resolution_type"] = resolution
try:
    result = api_client.generate_t2i(...)
finally:
    config["params"]["resolution_type"] = original_resolution
```

**改进方案** (适用于多用户):
```python
# 方案 1: 使用线程锁
with config_lock:
    config["params"]["resolution_type"] = resolution
    result = api_client.generate_t2i(...)

# 方案 2: 传递参数而不修改全局配置
result = api_client.generate_t2i(
    ...,
    resolution_type=resolution,
    ratios=config[f"{resolution}_ratios"]
)

# 方案 3: 创建临时配置副本
temp_config = config.copy()
temp_config["params"]["resolution_type"] = resolution
result = api_client.generate_t2i(..., config=temp_config)
```

### API 客户端的参数读取

在 `core/api_client.py` 的 `generate_t2i()` 方法中：

```python
# 第 220 行
"resolution_type": self.config.get("params", {}).get("resolution_type", "2k")

# 第 505-512 行
def _get_ratio_dimensions(self, ratio):
    ratios = self.config.get("params", {}).get("ratios", {})
    ratio_config = ratios.get(ratio)
    if not ratio_config:
        return (1024, 1024)
    return (ratio_config.get("width", 1024), ratio_config.get("height", 1024))
```

---

## 后续改进建议

### 短期
- [x] 修复参数传递问题
- [ ] 添加参数验证
- [ ] 改进错误提示

### 中期
- [ ] 重构为请求级配置
- [ ] 添加线程锁保护
- [ ] 支持配置缓存

### 长期
- [ ] 完全重构 API 客户端
- [ ] 使用依赖注入模式
- [ ] 支持配置热更新

---

## 总结

✅ **问题已解决**: 通过临时修改配置，确保 API 客户端能够获取正确的分辨率和比例参数

✅ **修复内容**:
- 在调用 API 前设置 `resolution_type` 和 `ratios`
- 使用 try-finally 确保配置恢复
- 同时修复了文生图和图生图

✅ **如何使用**:
1. 服务器已自动重启
2. 刷新浏览器 (Ctrl+F5)
3. 输入提示词
4. 选择参数
5. 点击生成
6. 等待结果

---

**现在应该可以正常生成图片了！** 🎉

如果还有问题，请查看浏览器控制台和服务器日志的详细错误信息。

