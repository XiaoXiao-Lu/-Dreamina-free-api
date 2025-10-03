// UI 交互模块
class UIManager {
    constructor() {
        this.initElements();
        this.initEventListeners();
    }

    // 初始化DOM元素引用
    initElements() {
        // 侧边栏
        this.sidebar = document.getElementById('sidebar');
        this.menuBtn = document.getElementById('menuBtn');
        this.closeSidebar = document.getElementById('closeSidebar');
        
        // 表单元素
        this.generateForm = document.getElementById('generateForm');
        this.promptInput = document.getElementById('prompt');
        this.charCount = document.getElementById('charCount');
        this.modelSelect = document.getElementById('model');
        this.resolutionSelect = document.getElementById('resolution');
        this.ratioSelect = document.getElementById('ratio');
        this.seedInput = document.getElementById('seed');
        this.numImagesInput = document.getElementById('numImages');
        
        // 模式切换
        this.modeTabs = document.querySelectorAll('.mode-tab');
        this.referenceImageSection = document.getElementById('referenceImageSection');
        this.imageUploadGrid = document.getElementById('imageUploadGrid');
        
        // 高级选项
        this.toggleAdvanced = document.getElementById('toggleAdvanced');
        this.advancedOptions = document.getElementById('advancedOptions');
        
        // 进度和结果
        this.progressCard = document.getElementById('progressCard');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultCard = document.getElementById('resultCard');
        this.resultInfo = document.getElementById('resultInfo');
        this.imageGrid = document.getElementById('imageGrid');
        
        // 历史记录
        this.historyList = document.getElementById('historyList');
        
        // 账号管理
        this.accountList = document.getElementById('accountList');
        this.addAccountBtn = document.getElementById('addAccountBtn');
        this.addAccountModal = document.getElementById('addAccountModal');
        this.closeAddAccountModal = document.getElementById('closeAddAccountModal');
        this.cancelAddAccount = document.getElementById('cancelAddAccount');
        this.confirmAddAccount = document.getElementById('confirmAddAccount');
        this.accountSessionId = document.getElementById('accountSessionId');
        this.accountDescription = document.getElementById('accountDescription');
        
        // 积分信息
        this.creditInfo = document.getElementById('creditInfo');
        this.totalCredit = document.getElementById('totalCredit');
        this.giftCredit = document.getElementById('giftCredit');
        this.purchaseCredit = document.getElementById('purchaseCredit');
        this.refreshCreditBtn = document.getElementById('refreshCreditBtn');

        // 服务器设置
        this.serverUrl = document.getElementById('serverUrl');
        this.saveServerUrl = document.getElementById('saveServerUrl');
        this.resetServerUrl = document.getElementById('resetServerUrl');

        // Toast和加载
        this.toast = document.getElementById('toast');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // 图片预览
        this.imagePreviewModal = document.getElementById('imagePreviewModal');
        this.closeImagePreview = document.getElementById('closeImagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.downloadImage = document.getElementById('downloadImage');
        
        // 生成按钮
        this.generateBtn = document.getElementById('generateBtn');
    }

    // 初始化事件监听
    initEventListeners() {
        // 侧边栏
        this.menuBtn.addEventListener('click', () => this.toggleSidebar());
        this.closeSidebar.addEventListener('click', () => this.toggleSidebar());
        
        // 点击侧边栏外部关闭
        this.sidebar.addEventListener('click', (e) => {
            if (e.target === this.sidebar) {
                this.toggleSidebar();
            }
        });
        
        // 提示词字符计数
        this.promptInput.addEventListener('input', () => this.updateCharCount());
        
        // 模式切换
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });
        
        // 高级选项切换
        this.toggleAdvanced.addEventListener('click', () => this.toggleAdvancedOptions());
        
        // 账号管理
        this.addAccountBtn.addEventListener('click', () => this.showAddAccountModal());
        this.closeAddAccountModal.addEventListener('click', () => this.hideAddAccountModal());
        this.cancelAddAccount.addEventListener('click', () => this.hideAddAccountModal());
        this.confirmAddAccount.addEventListener('click', () => this.handleAddAccount());
        
        // 积分刷新
        this.refreshCreditBtn.addEventListener('click', () => this.refreshCredit());

        // 服务器设置
        this.saveServerUrl.addEventListener('click', () => this.handleSaveServerUrl());
        this.resetServerUrl.addEventListener('click', () => this.handleResetServerUrl());

        // 图片预览
        this.closeImagePreview.addEventListener('click', () => this.hideImagePreview());

        // 初始化图片上传框
        this.initImageUploadBoxes();

        // 加载服务器设置
        this.loadServerUrl();
    }

    // 切换侧边栏
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }

    // 更新字符计数
    updateCharCount() {
        const length = this.promptInput.value.length;
        this.charCount.textContent = length;
        
        if (length > CONFIG.limits.maxPromptLength) {
            this.charCount.style.color = 'var(--danger-color)';
        } else {
            this.charCount.style.color = 'var(--text-muted)';
        }
    }

    // 切换生成模式
    switchMode(mode) {
        this.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        if (mode === 'i2i') {
            this.referenceImageSection.style.display = 'block';
        } else {
            this.referenceImageSection.style.display = 'none';
        }
    }

    // 初始化图片上传框
    initImageUploadBoxes() {
        this.imageUploadGrid.innerHTML = '';
        for (let i = 0; i < CONFIG.limits.maxReferenceImages; i++) {
            const box = this.createImageUploadBox(i);
            this.imageUploadGrid.appendChild(box);
        }
    }

    // 创建图片上传框
    createImageUploadBox(index) {
        const box = document.createElement('div');
        box.className = 'image-upload-box';
        box.innerHTML = `
            <input type="file" accept="image/*" id="refImage${index}" data-index="${index}">
            <i class="fas fa-plus"></i>
            <span>添加图片</span>
        `;
        
        const input = box.querySelector('input');
        input.addEventListener('change', (e) => this.handleImageUpload(e, box));
        
        box.addEventListener('click', () => {
            if (!box.classList.contains('has-image')) {
                input.click();
            }
        });
        
        return box;
    }

    // 处理图片上传
    handleImageUpload(event, box) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            box.innerHTML = `
                <img src="${e.target.result}" alt="参考图">
                <button type="button" class="remove-image">
                    <i class="fas fa-times"></i>
                </button>
            `;
            box.classList.add('has-image');
            
            const removeBtn = box.querySelector('.remove-image');
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.removeImage(box, event.target.dataset.index);
            });
        };
        reader.readAsDataURL(file);
    }

    // 移除图片
    removeImage(box, index) {
        const newBox = this.createImageUploadBox(index);
        box.replaceWith(newBox);
    }

    // 切换高级选项
    toggleAdvancedOptions() {
        const isVisible = this.advancedOptions.style.display !== 'none';
        this.advancedOptions.style.display = isVisible ? 'none' : 'block';
        
        const icon = this.toggleAdvanced.querySelector('.fa-chevron-down');
        icon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    // 显示添加账号模态框
    showAddAccountModal() {
        this.addAccountModal.classList.add('active');
        this.accountSessionId.value = '';
        this.accountDescription.value = '';
    }

    // 隐藏添加账号模态框
    hideAddAccountModal() {
        this.addAccountModal.classList.remove('active');
    }

    // 处理添加账号
    async handleAddAccount() {
        const sessionId = this.accountSessionId.value.trim();
        const description = this.accountDescription.value.trim();

        if (!sessionId) {
            this.showToast('请输入SessionID', 'error');
            return;
        }

        if (!description) {
            this.showToast('请输入账号描述', 'error');
            return;
        }

        try {
            await storage.addAccount(sessionId, description);
            this.showToast('账号添加成功，所有客户端已同步', 'success');
            this.hideAddAccountModal();
            await this.renderAccountList();
        } catch (error) {
            this.showToast(error.message || '添加账号失败', 'error');
        }
    }

    // 渲染账号列表
    async renderAccountList() {
        console.log('[UI] 开始渲染账号列表...');

        try {
            console.log('[UI] 调用 storage.getAccounts()...');
            const accounts = await storage.getAccounts();
            console.log('[UI] 获取到账号:', accounts);

            const currentAccount = storage.getCurrentAccount();
            console.log('[UI] 当前账号:', currentAccount);

            if (accounts.length === 0) {
                console.warn('[UI] 账号列表为空');
                this.accountList.innerHTML = '<p class="empty-text">暂无账号</p>';
                return;
            }

            console.log('[UI] 渲染', accounts.length, '个账号');
            this.accountList.innerHTML = accounts.map(account => `
                <div class="account-item ${currentAccount && currentAccount.id === account.id ? 'active' : ''}" data-id="${account.id}">
                    <div class="account-info">
                        <div class="account-name">${account.description}</div>
                        <div class="account-status">SessionID: ${account.sessionId.substring(0, 20)}...</div>
                    </div>
                    <div class="account-actions">
                        <button onclick="ui.switchAccount('${account.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="ui.deleteAccount('${account.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            console.log('[UI] 账号列表渲染完成');
        } catch (error) {
            console.error('[UI] 渲染账号列表失败:', error);
        }
    }

    // 切换账号
    async switchAccount(accountId) {
        storage.setCurrentAccount(accountId);
        await this.renderAccountList();
        this.showToast('账号切换成功', 'success');
        await this.refreshCredit();
    }

    // 删除账号
    async deleteAccount(accountId) {
        if (confirm('确定要删除这个账号吗？此操作会影响所有客户端！')) {
            try {
                await storage.deleteAccount(accountId);
                await this.renderAccountList();
                this.showToast('账号已删除，所有客户端已同步', 'success');
            } catch (error) {
                this.showToast(error.message || '删除账号失败', 'error');
            }
        }
    }

    // 刷新积分
    async refreshCredit() {
        const currentAccount = storage.getCurrentAccount();
        if (!currentAccount) {
            this.showToast('请先添加并选择账号', 'warning');
            return;
        }
        
        this.showLoading();
        try {
            // 这里应该调用实际的API
            // const credit = await api.getCredit(currentAccount.id);
            
            // 模拟数据
            const credit = {
                total_credit: 100,
                gift_credit: 50,
                purchase_credit: 50,
                vip_credit: 0
            };
            
            this.updateCreditDisplay(credit);
            this.showToast('积分刷新成功', 'success');
        } catch (error) {
            this.showToast('积分刷新失败', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // 更新积分显示
    updateCreditDisplay(credit) {
        this.totalCredit.textContent = credit.total_credit || 0;
        this.giftCredit.textContent = credit.gift_credit || 0;
        this.purchaseCredit.textContent = credit.purchase_credit || 0;
    }

    // 显示Toast提示
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // 显示加载
    showLoading() {
        this.loadingOverlay.classList.add('active');
    }

    // 隐藏加载
    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }

    // 显示图片预览
    showImagePreview(imageUrl) {
        // 使用代理接口
        const apiBase = CONFIG.api.baseUrl.replace('/api', '');  // 移除 /api 后缀
        const proxyUrl = `${apiBase}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
        this.previewImage.src = proxyUrl;
        this.previewImage.onerror = () => {
            this.previewImage.src = imageUrl; // 降级到原始URL
        };
        this.imagePreviewModal.classList.add('active');

        this.downloadImage.onclick = () => {
            api.downloadImage(imageUrl, `dreamina_${Date.now()}.png`);
        };
    }

    // 隐藏图片预览
    hideImagePreview() {
        this.imagePreviewModal.classList.remove('active');
    }

    // 更新进度
    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    // 显示进度卡片
    showProgressCard() {
        this.progressCard.style.display = 'block';
        this.resultCard.style.display = 'none';
    }

    // 隐藏进度卡片
    hideProgressCard() {
        this.progressCard.style.display = 'none';
    }

    // 显示结果
    showResult(result) {
        this.hideProgressCard();
        this.resultCard.style.display = 'block';
        
        // 显示结果信息
        this.resultInfo.innerHTML = `
            <p><i class="fas fa-check-circle"></i> 生成成功</p>
            <p><i class="fas fa-images"></i> 共生成 ${result.images.length} 张图片</p>
            <p><i class="fas fa-clock"></i> 用时 ${result.duration || '--'} 秒</p>
        `;
        
        // 显示图片 - 使用代理接口
        const apiBase = CONFIG.api.baseUrl.replace('/api', '');  // 移除 /api 后缀
        this.imageGrid.innerHTML = result.images.map((url, index) => {
            const proxyUrl = `${apiBase}/api/proxy/image?url=${encodeURIComponent(url)}`;
            console.log(`[图片 ${index + 1}] 原始URL:`, url);
            console.log(`[图片 ${index + 1}] 代理URL:`, proxyUrl);
            return `
                <div class="image-item" onclick="ui.showImagePreview('${url}')">
                    <img src="${proxyUrl}" alt="生成的图片"
                         onerror="console.error('图片加载失败:', this.src); this.src='${url}';"
                         onload="console.log('图片加载成功:', this.src);">
                </div>
            `;
        }).join('');
        
        // 滚动到结果
        this.resultCard.scrollIntoView({ behavior: 'smooth' });
    }

    // 渲染历史记录
    renderHistory() {
        const history = storage.getHistory();
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<p class="empty-text">暂无历史记录</p>';
            return;
        }
        
        this.historyList.innerHTML = history.map(item => `
            <div class="history-item" onclick="ui.loadHistoryItem('${item.id}')">
                <div><strong>${item.prompt.substring(0, 50)}...</strong></div>
                <div class="text-muted">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    // 加载历史记录项
    loadHistoryItem(itemId) {
        const history = storage.getHistory();
        const item = history.find(h => h.id === itemId);

        if (item) {
            this.promptInput.value = item.prompt;
            this.modelSelect.value = item.model;
            this.resolutionSelect.value = item.resolution;
            this.ratioSelect.value = item.ratio;
            this.showToast('已加载历史记录', 'success');
        }
    }

    // 加载服务器地址设置
    loadServerUrl() {
        const savedUrl = localStorage.getItem('dreamina_server_url');
        if (savedUrl) {
            this.serverUrl.value = savedUrl;
        }
    }

    // 保存服务器地址
    handleSaveServerUrl() {
        const url = this.serverUrl.value.trim();

        // 验证 URL 格式
        if (url && !url.match(/^https?:\/\/.+/)) {
            this.showToast('请输入有效的服务器地址（例如: http://192.168.3.68:5000）', 'error');
            return;
        }

        // 移除末尾的斜杠
        const cleanUrl = url.replace(/\/$/, '');

        localStorage.setItem('dreamina_server_url', cleanUrl);
        this.showToast('服务器地址已保存，请刷新页面生效', 'success');

        // 3秒后自动刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    // 重置服务器地址
    handleResetServerUrl() {
        if (confirm('确定要恢复默认服务器设置吗？')) {
            localStorage.removeItem('dreamina_server_url');
            this.serverUrl.value = '';
            this.showToast('已恢复默认设置，请刷新页面生效', 'success');

            // 3秒后自动刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    }
}

// 创建全局UI实例
const ui = new UIManager();

