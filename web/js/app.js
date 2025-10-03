// 主应用逻辑
class DreaminaApp {
    constructor() {
        this.currentMode = 't2i';
        this.activeTasks = new Map(); // 存储活跃的生成任务
        this.taskIdCounter = 0; // 任务ID计数器
        this.init();
    }

    // 初始化应用
    init() {
        this.preventHorizontalScroll(); // 防止横向滚动
        this.setupFormSubmit();
        this.loadInitialData();
        this.restoreTasks(); // 恢复未完成的任务
        this.startTaskSync(); // 启动任务同步
        ui.updateCharCount();
    }

    // 防止横向滚动
    preventHorizontalScroll() {
        // 防止body横向滚动
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            document.body.style.overflowX = 'hidden';
            document.documentElement.style.overflowX = 'hidden';
        });

        // 监听滚动事件,强制重置横向滚动
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (window.scrollX !== 0) {
                window.scrollTo(0, window.scrollY);
            }

            // 防抖处理
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.scrollX !== 0) {
                    window.scrollTo(0, window.scrollY);
                }
            }, 100);
        }, { passive: true });

        // 触摸事件处理(iOS)
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const touchCurrentX = e.touches[0].clientX;
            const diff = touchCurrentX - touchStartX;

            // 如果是横向滑动且会导致页面滚动,阻止
            if (Math.abs(diff) > 10 && window.scrollX === 0) {
                const scrollableParent = this.findScrollableParent(e.target);
                if (!scrollableParent || scrollableParent === document.body) {
                    // 不在可滚动容器内,阻止默认行为
                    if (Math.abs(diff) > Math.abs(e.touches[0].clientY - e.touches[0].clientY)) {
                        e.preventDefault();
                    }
                }
            }
        }, { passive: false });
    }

    // 查找可滚动的父元素
    findScrollableParent(element) {
        if (!element || element === document.body) {
            return null;
        }

        const style = window.getComputedStyle(element);
        const overflowX = style.overflowX;

        if (overflowX === 'auto' || overflowX === 'scroll') {
            return element;
        }

        return this.findScrollableParent(element.parentElement);
    }

    // 加载初始数据
    async loadInitialData() {
        console.log('[App] 开始加载初始数据...');

        try {
            console.log('[App] 渲染账号列表...');
            await ui.renderAccountList();
            console.log('[App] 账号列表渲染完成');

            console.log('[App] 渲染历史记录...');
            await ui.renderHistory(true); // 初始加载,重置显示
            console.log('[App] 历史记录渲染完成');

            const currentAccount = storage.getCurrentAccount();
            console.log('[App] 当前账号:', currentAccount);

            if (currentAccount) {
                console.log('[App] 刷新积分...');
                ui.refreshCredit();
            } else {
                console.warn('[App] 没有当前账号');
            }

            // 加载保存的设置
            const settings = storage.getSettings();
            console.log('[App] 加载设置:', settings);
            ui.modelSelect.value = settings.model || CONFIG.defaults.model;
            ui.resolutionSelect.value = settings.resolution || CONFIG.defaults.resolution;
            ui.ratioSelect.value = settings.ratio || CONFIG.defaults.ratio;

            console.log('[App] 初始数据加载完成');
        } catch (error) {
            console.error('[App] 加载初始数据失败:', error);
        }
    }

    // 保存任务到localStorage和服务器
    async saveTasks() {
        const tasks = [];
        this.activeTasks.forEach((taskInfo, taskId) => {
            tasks.push({
                id: taskId,
                formData: taskInfo.formData,
                mode: taskInfo.mode,
                startTime: taskInfo.startTime,
                serverTaskId: taskInfo.serverTaskId
            });
        });
        localStorage.setItem('dreamina_active_tasks', JSON.stringify(tasks));
        this.taskIdCounter = Math.max(this.taskIdCounter, ...Array.from(this.activeTasks.keys()), 0);
        localStorage.setItem('dreamina_task_counter', this.taskIdCounter.toString());

        // 同步到服务器
        try {
            for (const task of tasks) {
                await fetch(`${CONFIG.api.baseUrl}/tasks/active`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
            }
        } catch (error) {
            console.error('同步任务到服务器失败:', error);
        }
    }

    // 启动任务同步(每10秒同步一次)
    startTaskSync() {
        setInterval(async () => {
            try {
                const response = await fetch(`${CONFIG.api.baseUrl}/tasks/active`);
                const data = await response.json();

                if (data.success && data.tasks) {
                    // 合并服务器端的任务
                    for (const serverTask of data.tasks) {
                        const taskId = parseInt(serverTask.id);

                        // 如果本地没有这个任务,创建它
                        if (!this.activeTasks.has(taskId)) {
                            const taskInfo = {
                                id: taskId,
                                formData: serverTask.formData,
                                mode: serverTask.mode,
                                startTime: serverTask.startTime,
                                serverTaskId: serverTask.serverTaskId,
                                cancelled: false
                            };

                            this.activeTasks.set(taskId, taskInfo);

                            // 创建任务卡片
                            ui.createTaskCard(taskId, serverTask.formData.prompt);

                            // 如果有serverTaskId,继续执行
                            if (serverTask.serverTaskId) {
                                this.executeGeneration(taskId, taskInfo);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('同步任务失败:', error);
            }
        }, 10000); // 每10秒同步一次
    }

    // 从localStorage恢复任务
    restoreTasks() {
        try {
            const savedTasks = localStorage.getItem('dreamina_active_tasks');
            const savedCounter = localStorage.getItem('dreamina_task_counter');

            if (savedCounter) {
                this.taskIdCounter = parseInt(savedCounter);
            }

            if (savedTasks) {
                const tasks = JSON.parse(savedTasks);
                console.log('[App] 恢复任务:', tasks.length, '个');

                tasks.forEach(task => {
                    // 检查任务是否超过10分钟
                    const elapsed = Date.now() - task.startTime;
                    if (elapsed > 10 * 60 * 1000) {
                        console.log('[App] 任务', task.id, '已超时,跳过恢复');
                        return;
                    }

                    // 恢复任务
                    const taskInfo = {
                        id: task.id,
                        formData: task.formData,
                        mode: task.mode,
                        startTime: task.startTime,
                        serverTaskId: task.serverTaskId,
                        cancelled: false
                    };

                    this.activeTasks.set(task.id, taskInfo);

                    // 重新创建任务卡片
                    ui.createTaskCard(task.id, task.formData.prompt);

                    // 继续执行任务
                    this.executeGeneration(task.id, taskInfo);
                });

                // 清空已恢复的任务
                localStorage.removeItem('dreamina_active_tasks');
            }
        } catch (error) {
            console.error('[App] 恢复任务失败:', error);
            localStorage.removeItem('dreamina_active_tasks');
        }
    }

    // 设置表单提交
    setupFormSubmit() {
        ui.generateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGenerate();
        });
    }

    // 处理生成请求
    async handleGenerate() {
        // 验证账号
        const currentAccount = storage.getCurrentAccount();
        if (!currentAccount) {
            ui.showToast('请先添加并选择账号', 'warning');
            ui.toggleSidebar();
            return;
        }

        // 获取表单数据
        const formData = this.getFormData();

        // 验证提示词
        if (!formData.prompt || formData.prompt.trim().length === 0) {
            ui.showToast('请输入提示词', 'error');
            return;
        }

        if (formData.prompt.length > CONFIG.limits.maxPromptLength) {
            ui.showToast(`提示词不能超过${CONFIG.limits.maxPromptLength}个字符`, 'error');
            return;
        }

        // 如果是图生图模式，验证参考图
        if (this.currentMode === 'i2i') {
            const images = this.getReferenceImages();
            if (images.length === 0) {
                ui.showToast('请至少上传一张参考图', 'error');
                return;
            }
            formData.images = images;
        }

        // 保存设置
        storage.saveSettings({
            model: formData.model,
            resolution: formData.resolution,
            ratio: formData.ratio,
        });

        // 创建新任务
        const taskId = ++this.taskIdCounter;
        const taskInfo = {
            id: taskId,
            formData: formData,
            mode: this.currentMode,
            startTime: Date.now(),
            cancelled: false
        };

        this.activeTasks.set(taskId, taskInfo);

        // 保存任务到localStorage
        this.saveTasks();

        // 创建任务卡片
        ui.createTaskCard(taskId, formData.prompt);

        // 提示可以继续生成
        ui.showToast(`任务 #${taskId} 已开始，可以继续提交新任务`, 'info');

        // 异步执行生成
        this.executeGeneration(taskId, taskInfo);
    }

    // 执行生成任务
    async executeGeneration(taskId, taskInfo) {
        try {
            // 如果已经有serverTaskId,说明是恢复的任务,直接轮询状态
            if (taskInfo.serverTaskId) {
                console.log(`[App] 恢复任务 #${taskId}, serverTaskId: ${taskInfo.serverTaskId}`);
                ui.updateTaskProgress(taskId, 30, '正在恢复任务...');

                // 直接开始轮询
                const result = await this.pollTaskStatus(taskId, taskInfo.serverTaskId);

                // 检查任务是否被取消
                if (taskInfo.cancelled) {
                    ui.removeTaskCard(taskId);
                    return;
                }

                const duration = ((Date.now() - taskInfo.startTime) / 1000).toFixed(1);
                result.duration = duration;

                // 显示结果
                ui.showTaskResult(taskId, result);

                // 保存到历史记录
                try {
                    await storage.addHistory({
                        prompt: taskInfo.formData.prompt,
                        model: taskInfo.formData.model,
                        resolution: taskInfo.formData.resolution,
                        ratio: taskInfo.formData.ratio,
                        mode: taskInfo.mode,
                        images: result.images,
                        historyId: result.historyId || '',
                        duration: duration  // 添加耗时
                    });
                    await ui.renderHistory(true); // 重新加载历史记录
                } catch (error) {
                    console.error('保存历史记录失败:', error);
                }

                ui.showToast(`任务 #${taskId} 生成成功！`, 'success');
                return;
            }

            // 新任务,正常提交
            ui.updateTaskProgress(taskId, 0, '正在提交任务...');

            let result;
            if (taskInfo.mode === 't2i') {
                result = await this.generateT2I(taskInfo.formData, taskId);
            } else {
                result = await this.generateI2I(taskInfo.formData, taskId);
            }

            // 检查任务是否被取消
            if (taskInfo.cancelled) {
                ui.removeTaskCard(taskId);
                return;
            }

            const duration = ((Date.now() - taskInfo.startTime) / 1000).toFixed(1);
            result.duration = duration;

            // 显示结果
            ui.showTaskResult(taskId, result);

            // 保存到历史记录(异步)
            try {
                await storage.addHistory({
                    prompt: taskInfo.formData.prompt,
                    model: taskInfo.formData.model,
                    resolution: taskInfo.formData.resolution,
                    ratio: taskInfo.formData.ratio,
                    mode: taskInfo.mode,
                    images: result.images,
                    historyId: result.historyId || '',
                    duration: duration  // 添加耗时
                });
                await ui.renderHistory(true); // 重新加载历史记录
            } catch (error) {
                console.error('保存历史记录失败:', error);
                // 不影响主流程,只记录错误
            }

            ui.showToast(`任务 #${taskId} 生成成功！`, 'success');

            // 3秒后自动删除任务卡片
            setTimeout(() => {
                ui.removeTaskCard(taskId);
            }, 3000);

        } catch (error) {
            console.error(`任务 #${taskId} 生成失败:`, error);

            // 检查任务是否被取消
            if (!taskInfo.cancelled) {
                ui.showTaskError(taskId, error.message || '生成失败，请重试');
                ui.showToast(`任务 #${taskId} 失败: ${error.message}`, 'error');
            }
        } finally {
            this.activeTasks.delete(taskId);
            // 从服务器删除任务
            try {
                await fetch(`${CONFIG.api.baseUrl}/tasks/active/${taskId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('删除服务器任务失败:', error);
            }
            // 更新保存的任务列表
            await this.saveTasks();
        }
    }

    // 取消任务
    async cancelTask(taskId) {
        const taskInfo = this.activeTasks.get(taskId);
        if (taskInfo) {
            taskInfo.cancelled = true;
            this.activeTasks.delete(taskId);
            ui.removeTaskCard(taskId);
            ui.showToast(`任务 #${taskId} 已取消`, 'info');
            // 从服务器删除任务
            try {
                await fetch(`${CONFIG.api.baseUrl}/tasks/active/${taskId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('删除服务器任务失败:', error);
            }
            // 更新保存的任务列表
            await this.saveTasks();
        }
    }

    // 获取表单数据
    getFormData() {
        return {
            prompt: ui.promptInput.value.trim(),
            model: ui.modelSelect.value,
            resolution: ui.resolutionSelect.value,
            ratio: ui.ratioSelect.value,
            seed: parseInt(ui.seedInput.value),
            numImages: parseInt(ui.numImagesInput.value),
        };
    }

    // 获取参考图
    getReferenceImages() {
        const images = [];
        const boxes = ui.imageUploadGrid.querySelectorAll('.image-upload-box.has-image');
        
        boxes.forEach(box => {
            const img = box.querySelector('img');
            if (img) {
                images.push(img.src);
            }
        });
        
        return images;
    }

    // 文生图
    async generateT2I(formData, localTaskId) {
        ui.updateTaskProgress(localTaskId, 10, '正在连接服务器...');

        try {
            const response = await api.generateT2I({
                prompt: formData.prompt,
                model: formData.model,
                resolution: formData.resolution,
                ratio: formData.ratio,
                seed: formData.seed,
                num_images: formData.numImages,
            });

            if (!response.success) {
                throw new Error(response.message || '生成失败');
            }

            ui.updateTaskProgress(localTaskId, 30, '任务已提交...');

            // 如果直接返回了图片
            if (response.completed && response.images) {
                ui.updateTaskProgress(localTaskId, 100, '生成完成！');
                return {
                    images: response.images,
                    historyId: response.historyId,
                };
            }

            // 需要轮询检查状态
            const serverTaskId = response.taskId;

            // 保存serverTaskId到任务信息
            const taskInfo = this.activeTasks.get(localTaskId);
            if (taskInfo) {
                taskInfo.serverTaskId = serverTaskId;
                this.saveTasks();
            }

            // 使用统一的轮询方法
            return await this.pollTaskStatus(localTaskId, serverTaskId);

        } catch (error) {
            throw error;
        }
    }

    // 图生图
    async generateI2I(formData, localTaskId) {
        ui.updateTaskProgress(localTaskId, 10, '正在上传参考图...');

        // 将base64图片转换为Blob
        const imageBlobs = await Promise.all(
            formData.images.map(async (dataUrl) => {
                const response = await fetch(dataUrl);
                return response.blob();
            })
        );

        ui.updateTaskProgress(localTaskId, 20, '正在提交任务...');

        try {
            const response = await api.generateI2I({
                prompt: formData.prompt,
                model: formData.model,
                resolution: formData.resolution,
                ratio: formData.ratio,
                seed: formData.seed,
                num_images: formData.numImages,
            }, imageBlobs);

            if (!response.success) {
                throw new Error(response.message || '生成失败');
            }

            ui.updateTaskProgress(localTaskId, 30, '任务已提交...');

            // 如果直接返回了图片
            if (response.completed && response.images) {
                ui.updateTaskProgress(localTaskId, 100, '生成完成！');
                return {
                    images: response.images,
                    historyId: response.historyId,
                };
            }

            // 需要轮询检查状态
            const serverTaskId = response.taskId;

            // 保存serverTaskId到任务信息
            const taskInfo = this.activeTasks.get(localTaskId);
            if (taskInfo) {
                taskInfo.serverTaskId = serverTaskId;
                this.saveTasks();
            }

            // 使用统一的轮询方法
            return await this.pollTaskStatus(localTaskId, serverTaskId);

        } catch (error) {
            throw error;
        }
    }

    // 轮询任务状态(用于恢复任务)
    async pollTaskStatus(localTaskId, serverTaskId) {
        let attempts = 0;
        const maxAttempts = 120; // 最多等待10分钟(考虑违禁词检测可能较慢)
        let consecutiveErrors = 0;

        while (attempts < maxAttempts) {
            // 检查任务是否被取消
            const taskInfo = this.activeTasks.get(localTaskId);
            if (!taskInfo || taskInfo.cancelled) {
                throw new Error('任务已取消');
            }

            await new Promise(resolve => setTimeout(resolve, 5000)); // 每5秒检查一次

            try {
                const status = await api.checkStatus(serverTaskId);
                consecutiveErrors = 0;

                // 先检查失败状态
                if (status.failed) {
                    throw new Error(status.error || '生成失败');
                }

                const progress = Math.min(90, 30 + (attempts / maxAttempts) * 60);
                ui.updateTaskProgress(localTaskId, progress, status.message || '正在生成图片...');

                if (status.completed && status.images) {
                    ui.updateTaskProgress(localTaskId, 100, '生成完成！');
                    return {
                        images: status.images,
                        historyId: status.historyId || serverTaskId,
                    };
                }
            } catch (error) {
                // 如果是失败状态导致的错误,直接向上抛出
                if (error.message && (error.message.includes('敏感内容') ||
                    error.message.includes('不符合规范') ||
                    error.message.includes('生成失败') ||
                    error.message.includes('参数错误'))) {
                    throw error;
                }

                consecutiveErrors++;
                console.error(`检查状态失败 (${consecutiveErrors}/3):`, error);

                if (consecutiveErrors >= 3) {
                    throw new Error('连接服务器失败，请检查网络');
                }
            }

            attempts++;
        }

        throw new Error('生成超时，请重试');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DreaminaApp();
    console.log('Dreamina AI 应用已启动');
});

