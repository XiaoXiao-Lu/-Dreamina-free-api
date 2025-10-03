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
        this.setupFormSubmit();
        this.loadInitialData();
        ui.updateCharCount();
    }

    // 加载初始数据
    async loadInitialData() {
        console.log('[App] 开始加载初始数据...');

        try {
            console.log('[App] 渲染账号列表...');
            await ui.renderAccountList();
            console.log('[App] 账号列表渲染完成');

            console.log('[App] 渲染历史记录...');
            ui.renderHistory();
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

    // 设置表单提交
    setupFormSubmit() {
        ui.generateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGenerate();
        });
    }

    // 处理生成请求
    async handleGenerate() {
        if (this.isGenerating) {
            ui.showToast('正在生成中，请稍候...', 'warning');
            return;
        }

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

        // 开始生成
        this.isGenerating = true;
        ui.generateBtn.disabled = true;
        ui.showProgressCard();
        ui.updateProgress(0, '正在提交任务...');

        try {
            const startTime = Date.now();
            let result;

            if (this.currentMode === 't2i') {
                result = await this.generateT2I(formData);
            } else {
                result = await this.generateI2I(formData);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            result.duration = duration;

            // 显示结果
            ui.showResult(result);

            // 保存到历史记录
            storage.addHistory({
                prompt: formData.prompt,
                model: formData.model,
                resolution: formData.resolution,
                ratio: formData.ratio,
                mode: this.currentMode,
                images: result.images,
            });

            ui.renderHistory();
            ui.showToast('生成成功！', 'success');

        } catch (error) {
            console.error('生成失败:', error);
            ui.showToast(error.message || '生成失败，请重试', 'error');
            ui.hideProgressCard();
        } finally {
            this.isGenerating = false;
            ui.generateBtn.disabled = false;
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
    async generateT2I(formData) {
        ui.updateProgress(10, '正在连接服务器...');

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

            ui.updateProgress(30, '任务已提交...');

            // 如果直接返回了图片
            if (response.completed && response.images) {
                ui.updateProgress(100, '生成完成！');
                return {
                    images: response.images,
                    historyId: response.historyId,
                };
            }

            // 需要轮询检查状态
            const taskId = response.taskId;
            let attempts = 0;
            const maxAttempts = 60; // 最多等待5分钟

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // 每5秒检查一次

                const status = await api.checkStatus(taskId);
                const progress = Math.min(90, 30 + (attempts / maxAttempts) * 60);
                ui.updateProgress(progress, status.message || '正在生成图片...');

                if (status.completed && status.images) {
                    ui.updateProgress(100, '生成完成！');
                    return {
                        images: status.images,
                        historyId: status.historyId || taskId,
                    };
                }

                if (status.failed) {
                    throw new Error(status.error || '生成失败');
                }

                attempts++;
            }

            throw new Error('生成超时，请稍后重试');

        } catch (error) {
            throw error;
        }
    }

    // 图生图
    async generateI2I(formData) {
        ui.updateProgress(10, '正在上传参考图...');

        // 将base64图片转换为Blob
        const imageBlobs = await Promise.all(
            formData.images.map(async (dataUrl) => {
                const response = await fetch(dataUrl);
                return response.blob();
            })
        );

        ui.updateProgress(20, '正在提交任务...');

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

            ui.updateProgress(30, '任务已提交...');

            // 如果直接返回了图片
            if (response.completed && response.images) {
                ui.updateProgress(100, '生成完成！');
                return {
                    images: response.images,
                    historyId: response.historyId,
                };
            }

            // 需要轮询检查状态
            const taskId = response.taskId;
            let attempts = 0;
            const maxAttempts = 60;

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                const status = await api.checkStatus(taskId);
                const progress = Math.min(90, 30 + (attempts / maxAttempts) * 60);
                ui.updateProgress(progress, status.message || '正在生成图片...');

                if (status.completed && status.images) {
                    ui.updateProgress(100, '生成完成！');
                    return {
                        images: status.images,
                        historyId: status.historyId || taskId,
                    };
                }

                if (status.failed) {
                    throw new Error(status.error || '生成失败');
                }

                attempts++;
            }

            throw new Error('生成超时，请稍后重试');

        } catch (error) {
            throw error;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DreaminaApp();
    console.log('Dreamina AI 应用已启动');
});

