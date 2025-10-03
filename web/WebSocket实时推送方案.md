# 🔌 WebSocket 实时推送优化方案

**方案时间**: 2025-10-03 22:00  
**优先级**: ⭐⭐⭐⭐⭐ (高)  
**预计工作量**: 2-3天  

---

## 📋 为什么需要WebSocket?

### 当前方案的问题

**轮询方式** (当前使用):
- ❌ 每10秒请求一次服务器
- ❌ 浪费带宽和服务器资源
- ❌ 延迟高(最多10秒)
- ❌ 无法实时响应

**WebSocket方式** (建议):
- ✅ 服务器主动推送
- ✅ 实时响应(延迟<100ms)
- ✅ 节省资源
- ✅ 双向通信

---

## 🎯 实现方案

### 技术选型

**后端**: Flask-SocketIO  
**前端**: Socket.IO Client  
**协议**: WebSocket (降级到长轮询)  

### 安装依赖

```bash
pip install flask-socketio python-socketio
```

---

## 🔧 服务器端实现

### 1. 初始化SocketIO

**文件**: `web/server.py`

```python
from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# 存储客户端连接
connected_clients = {}  # {sid: user_info}
```

### 2. 连接管理

```python
@socketio.on('connect')
def handle_connect():
    """客户端连接"""
    sid = request.sid
    connected_clients[sid] = {
        'connected_at': time.time(),
        'ip': request.remote_addr
    }
    logger.info(f"客户端连接: {sid}, 当前在线: {len(connected_clients)}")
    
    # 发送当前活跃任务
    emit('active_tasks', {
        'tasks': list(active_tasks.values())
    })

@socketio.on('disconnect')
def handle_disconnect():
    """客户端断开"""
    sid = request.sid
    if sid in connected_clients:
        del connected_clients[sid]
    logger.info(f"客户端断开: {sid}, 当前在线: {len(connected_clients)}")
```

### 3. 任务事件

```python
@socketio.on('task_created')
def handle_task_created(data):
    """任务创建事件"""
    task_id = data.get('id')
    
    # 保存到活跃任务
    active_tasks[task_id] = data
    
    # 广播给所有客户端
    emit('task_created', data, broadcast=True)
    logger.info(f"任务创建: {task_id}, 广播给 {len(connected_clients)} 个客户端")

@socketio.on('task_progress')
def handle_task_progress(data):
    """任务进度更新"""
    task_id = data.get('id')
    progress = data.get('progress')
    
    # 更新任务进度
    if task_id in active_tasks:
        active_tasks[task_id]['progress'] = progress
    
    # 广播进度更新
    emit('task_progress', data, broadcast=True)

@socketio.on('task_completed')
def handle_task_completed(data):
    """任务完成事件"""
    task_id = data.get('id')
    
    # 从活跃任务中移除
    if task_id in active_tasks:
        del active_tasks[task_id]
    
    # 广播完成事件
    emit('task_completed', data, broadcast=True)
    logger.info(f"任务完成: {task_id}")

@socketio.on('task_failed')
def handle_task_failed(data):
    """任务失败事件"""
    task_id = data.get('id')
    
    # 从活跃任务中移除
    if task_id in active_tasks:
        del active_tasks[task_id]
    
    # 广播失败事件
    emit('task_failed', data, broadcast=True)
    logger.info(f"任务失败: {task_id}")
```

### 4. 启动服务器

```python
if __name__ == '__main__':
    # 使用socketio.run代替app.run
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )
```

---

## 🌐 客户端实现

### 1. 引入Socket.IO

**文件**: `web/index.html`

```html
<!-- 在</body>前添加 -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

### 2. 创建WebSocket管理器

**文件**: `web/js/websocket.js`

```javascript
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
    }

    // 连接WebSocket
    connect() {
        console.log('[WebSocket] 正在连接...');
        
        this.socket = io(CONFIG.api.baseUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: this.reconnectDelay,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.setupEventListeners();
    }

    // 设置事件监听
    setupEventListeners() {
        // 连接成功
        this.socket.on('connect', () => {
            console.log('[WebSocket] 连接成功');
            this.reconnectAttempts = 0;
            ui.showToast('实时连接已建立', 'success');
        });

        // 连接断开
        this.socket.on('disconnect', (reason) => {
            console.log('[WebSocket] 连接断开:', reason);
            ui.showToast('实时连接已断开', 'warning');
        });

        // 重连中
        this.socket.on('reconnect_attempt', (attempt) => {
            console.log(`[WebSocket] 重连尝试 ${attempt}/${this.maxReconnectAttempts}`);
        });

        // 重连成功
        this.socket.on('reconnect', (attempt) => {
            console.log(`[WebSocket] 重连成功 (尝试 ${attempt} 次)`);
            ui.showToast('实时连接已恢复', 'success');
        });

        // 重连失败
        this.socket.on('reconnect_failed', () => {
            console.error('[WebSocket] 重连失败');
            ui.showToast('实时连接失败,请刷新页面', 'error');
        });

        // 接收活跃任务
        this.socket.on('active_tasks', (data) => {
            console.log('[WebSocket] 收到活跃任务:', data.tasks);
            this.trigger('active_tasks', data.tasks);
        });

        // 任务创建
        this.socket.on('task_created', (data) => {
            console.log('[WebSocket] 任务创建:', data);
            this.trigger('task_created', data);
        });

        // 任务进度
        this.socket.on('task_progress', (data) => {
            console.log('[WebSocket] 任务进度:', data);
            this.trigger('task_progress', data);
        });

        // 任务完成
        this.socket.on('task_completed', (data) => {
            console.log('[WebSocket] 任务完成:', data);
            this.trigger('task_completed', data);
        });

        // 任务失败
        this.socket.on('task_failed', (data) => {
            console.log('[WebSocket] 任务失败:', data);
            this.trigger('task_failed', data);
        });
    }

    // 发送事件
    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.error('[WebSocket] 未连接,无法发送事件:', event);
        }
    }

    // 注册事件处理器
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    // 触发事件处理器
    trigger(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }

    // 断开连接
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// 创建全局实例
const ws = new WebSocketManager();
```

### 3. 修改App类使用WebSocket

**文件**: `web/js/app.js`

```javascript
class App {
    init() {
        this.setupFormSubmit();
        this.loadInitialData();
        this.restoreTasks();
        this.setupWebSocket(); // 使用WebSocket代替轮询
        ui.updateCharCount();
    }

    // 设置WebSocket
    setupWebSocket() {
        // 连接WebSocket
        ws.connect();

        // 监听任务创建
        ws.on('task_created', (task) => {
            const taskId = parseInt(task.id);
            
            // 如果本地没有这个任务,创建它
            if (!this.activeTasks.has(taskId)) {
                const taskInfo = {
                    id: taskId,
                    formData: task.formData,
                    mode: task.mode,
                    startTime: task.startTime,
                    serverTaskId: task.serverTaskId,
                    cancelled: false
                };
                
                this.activeTasks.set(taskId, taskInfo);
                ui.createTaskCard(taskId, task.formData.prompt);
                
                // 如果有serverTaskId,继续执行
                if (task.serverTaskId) {
                    this.executeGeneration(taskId, taskInfo);
                }
            }
        });

        // 监听任务进度
        ws.on('task_progress', (data) => {
            const taskId = parseInt(data.id);
            ui.updateTaskProgress(taskId, data.progress, data.message);
        });

        // 监听任务完成
        ws.on('task_completed', (data) => {
            const taskId = parseInt(data.id);
            if (this.activeTasks.has(taskId)) {
                ui.showTaskResult(taskId, data.result);
                this.activeTasks.delete(taskId);
            }
        });

        // 监听任务失败
        ws.on('task_failed', (data) => {
            const taskId = parseInt(data.id);
            if (this.activeTasks.has(taskId)) {
                ui.showTaskError(taskId, data.error);
                this.activeTasks.delete(taskId);
            }
        });

        // 监听活跃任务
        ws.on('active_tasks', (tasks) => {
            tasks.forEach(task => {
                const taskId = parseInt(task.id);
                if (!this.activeTasks.has(taskId)) {
                    const taskInfo = {
                        id: taskId,
                        formData: task.formData,
                        mode: task.mode,
                        startTime: task.startTime,
                        serverTaskId: task.serverTaskId,
                        cancelled: false
                    };
                    
                    this.activeTasks.set(taskId, taskInfo);
                    ui.createTaskCard(taskId, task.formData.prompt);
                    
                    if (task.serverTaskId) {
                        this.executeGeneration(taskId, taskInfo);
                    }
                }
            });
        });
    }

    // 提交任务时发送WebSocket事件
    async submitTask(formData, mode) {
        const taskId = ++this.taskIdCounter;
        const taskInfo = {
            id: taskId,
            formData: formData,
            mode: mode,
            startTime: Date.now(),
            serverTaskId: '',
            cancelled: false
        };

        this.activeTasks.set(taskId, taskInfo);
        ui.createTaskCard(taskId, formData.prompt);

        // 发送WebSocket事件
        ws.emit('task_created', {
            id: taskId,
            formData: formData,
            mode: mode,
            startTime: taskInfo.startTime
        });

        // 执行生成
        this.executeGeneration(taskId, taskInfo);
    }
}
```

---

## 📊 性能对比

### 轮询方式 (当前)

| 指标 | 数值 |
|------|------|
| 延迟 | 0-10秒 |
| 请求频率 | 每10秒1次 |
| 带宽消耗 | 高 |
| 服务器负载 | 高 |
| 实时性 | 差 |

### WebSocket方式 (优化后)

| 指标 | 数值 |
|------|------|
| 延迟 | <100ms |
| 请求频率 | 按需推送 |
| 带宽消耗 | 低 |
| 服务器负载 | 低 |
| 实时性 | 优秀 |

---

## ✅ 优势总结

1. **实时性**: 延迟从10秒降低到<100ms
2. **性能**: 减少90%的无效请求
3. **用户体验**: 即时看到其他设备的操作
4. **可扩展性**: 支持更多实时功能(聊天、通知等)

---

## 🔄 实施步骤

### 第1步: 安装依赖
```bash
pip install flask-socketio python-socketio
```

### 第2步: 修改服务器
- 添加SocketIO初始化
- 实现事件处理器
- 修改启动方式

### 第3步: 修改客户端
- 引入Socket.IO库
- 创建WebSocket管理器
- 修改App类

### 第4步: 测试
- 测试连接/断开
- 测试多端同步
- 测试重连机制

### 第5步: 部署
- 配置生产环境
- 添加监控
- 优化性能

---

**预计完成时间**: 2-3天  
**优先级**: ⭐⭐⭐⭐⭐  
**难度**: 中等  

---

*这是一个重要的性能优化,建议尽快实施!*

