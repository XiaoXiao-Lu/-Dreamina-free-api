// UI 交互模块
class UIManager {
    constructor() {
        // 历史记录懒加载相关
        this.allHistory = [];
        this.historyDisplayCount = 10;

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

        // 任务列表
        this.taskList = document.getElementById('taskList');

        // Toast和加载
        this.toast = document.getElementById('toast');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // 图片预览
        this.imagePreviewModal = document.getElementById('imagePreviewModal');
        this.closeImagePreview = document.getElementById('closeImagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.downloadImage = document.getElementById('downloadImage');

        // 全屏图片查看器
        this.fullscreenViewer = document.getElementById('fullscreenViewer');
        this.fullscreenImage = document.getElementById('fullscreenImage');
        this.fullscreenClose = document.getElementById('fullscreenClose');
        this.fullscreenDownload = document.getElementById('fullscreenDownload');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.zoomResetBtn = document.getElementById('zoomReset');

        // 图片缩放相关
        this.imageScale = 1;
        this.imageTranslateX = 0;
        this.imageTranslateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        
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

        // 全屏查看器
        this.fullscreenClose.addEventListener('click', () => this.hideFullscreenViewer());
        this.fullscreenViewer.addEventListener('click', (e) => {
            if (e.target === this.fullscreenViewer) {
                this.hideFullscreenViewer();
            }
        });

        // 缩放按钮
        this.zoomInBtn.addEventListener('click', () => this.zoomImage(0.2));
        this.zoomOutBtn.addEventListener('click', () => this.zoomImage(-0.2));
        this.zoomResetBtn.addEventListener('click', () => this.resetZoom());

        // 图片缩放和拖动事件
        this.initImageZoomAndDrag();

        // 加载服务器设置
        this.loadServerUrl();

        // 历史记录滚动监听
        this.initHistoryScroll();

        // 返回顶部按钮
        this.initBackToTop();

        // 提示词快捷操作
        this.initPromptActions();
    }

    // 初始化历史记录滚动监听
    initHistoryScroll() {
        const historyLoading = document.getElementById('historyLoading');
        if (historyLoading) {
            // 使用Intersection Observer监听"加载更多"元素
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // 当"加载更多"元素进入视口时,加载更多
                        this.loadMoreHistory();
                    }
                });
            }, {
                root: null,
                rootMargin: '100px', // 提前100px开始加载
                threshold: 0.1
            });

            observer.observe(historyLoading);
        }
    }

    // 初始化返回顶部按钮
    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // 点击返回顶部
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 初始化提示词快捷操作
    initPromptActions() {
        const pasteBtn = document.getElementById('pastePrompt');
        const clearBtn = document.getElementById('clearPrompt');

        // 粘贴按钮 - 聚焦输入框并触发粘贴
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => {
                // 聚焦到输入框
                this.promptInput.focus();

                // 尝试使用Clipboard API
                if (navigator.clipboard && navigator.clipboard.readText) {
                    navigator.clipboard.readText()
                        .then(text => {
                            this.promptInput.value = text;
                            this.updateCharCount();
                            this.showToast('已粘贴剪贴板内容', 'success');
                        })
                        .catch(error => {
                            console.log('Clipboard API不可用,请使用Ctrl+V粘贴');
                            // 提示用户手动粘贴
                            this.showToast('请按 Ctrl+V 粘贴', 'info');
                        });
                } else {
                    // 不支持Clipboard API,提示用户手动粘贴
                    this.showToast('请按 Ctrl+V 粘贴', 'info');
                }
            });
        }

        // 清空按钮
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.promptInput.value = '';
                this.updateCharCount();
                this.promptInput.focus();
                this.showToast('已清空提示词', 'success');
            });
        }
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

    // 显示图片预览 - 直接打开全屏查看器
    showImagePreview(imageUrl, thumbnailUrl = null) {
        // 直接打开全屏查看器,如果有缩略图则先显示缩略图
        this.showFullscreenViewer(imageUrl, thumbnailUrl);
    }

    // 显示全屏图片查看器
    showFullscreenViewer(imageUrl, thumbnailUrl = null) {
        // 重置缩放和位置
        this.imageScale = 1;
        this.imageTranslateX = 0;
        this.imageTranslateY = 0;
        this.updateImageTransform();

        this.fullscreenViewer.classList.add('active');

        // 如果有缩略图,先显示缩略图(即时显示)
        if (thumbnailUrl) {
            this.fullscreenImage.src = thumbnailUrl;
            this.fullscreenImage.style.opacity = '1';
            this.fullscreenImage.style.filter = 'blur(0px)';
        } else {
            this.fullscreenImage.style.opacity = '0';
        }

        // 显示加载提示
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'fullscreen-loading';
        loadingDiv.innerHTML = `
            <div class="loading-badge">
                <i class="fas fa-arrow-up"></i>
                <span>加载高清原图中...</span>
            </div>
        `;
        this.fullscreenViewer.appendChild(loadingDiv);

        // 后台加载原图
        const img = new Image();

        img.onload = () => {
            // 原图加载完成,平滑切换
            this.fullscreenImage.style.transition = 'opacity 0.3s ease';
            this.fullscreenImage.style.opacity = '0';

            setTimeout(() => {
                this.fullscreenImage.src = imageUrl;
                this.fullscreenImage.style.opacity = '1';
                loadingDiv.remove();
                this.showZoomHint();

                // 移除transition
                setTimeout(() => {
                    this.fullscreenImage.style.transition = '';
                }, 300);
            }, 150);
        };

        img.onerror = () => {
            loadingDiv.innerHTML = `
                <div class="loading-badge error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>原图加载失败</span>
                </div>
            `;
            setTimeout(() => loadingDiv.remove(), 2000);
        };

        // 开始加载原图
        img.src = imageUrl;

        // 下载按钮
        this.fullscreenDownload.onclick = () => {
            api.downloadImage(imageUrl, `dreamina_${Date.now()}.png`);
        };

        // 阻止body滚动
        document.body.style.overflow = 'hidden';
    }

    // 显示缩放提示
    showZoomHint() {
        const hint = document.getElementById('zoomHint');
        if (hint) {
            hint.classList.add('show');
            setTimeout(() => {
                hint.classList.remove('show');
            }, 3000);
        }
    }

    // 隐藏全屏图片查看器
    hideFullscreenViewer() {
        this.fullscreenViewer.classList.remove('active');
        document.body.style.overflow = '';

        // 重置缩放
        this.imageScale = 1;
        this.imageTranslateX = 0;
        this.imageTranslateY = 0;
        this.updateImageTransform();
    }

    // 初始化图片缩放和拖动
    initImageZoomAndDrag() {
        // 鼠标滚轮缩放
        this.fullscreenImage.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            const newScale = Math.max(0.5, Math.min(5, this.imageScale + delta));

            this.imageScale = newScale;
            this.updateImageTransform();
        }, { passive: false });

        // 鼠标拖动
        this.fullscreenImage.addEventListener('mousedown', (e) => {
            if (this.imageScale > 1) {
                this.isDragging = true;
                this.startX = e.clientX - this.imageTranslateX;
                this.startY = e.clientY - this.imageTranslateY;
                this.fullscreenImage.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.imageTranslateX = e.clientX - this.startX;
                this.imageTranslateY = e.clientY - this.startY;
                this.updateImageTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.fullscreenImage.style.cursor = this.imageScale > 1 ? 'grab' : 'default';
        });

        // 触摸缩放(双指) - 改进版本
        this.touchState = {
            initialDistance: 0,
            initialScale: 1,
            isPinching: false,
            lastTap: 0,
            touchStartTime: 0
        };

        // iOS手势事件支持
        this.fullscreenImage.addEventListener('gesturestart', (e) => {
            e.preventDefault();
            this.touchState.initialScale = this.imageScale;
            console.log('gesturestart - 初始缩放:', this.touchState.initialScale);
        });

        this.fullscreenImage.addEventListener('gesturechange', (e) => {
            e.preventDefault();
            const newScale = this.touchState.initialScale * e.scale;
            this.imageScale = Math.max(0.5, Math.min(5, newScale));
            this.updateImageTransform();
        });

        this.fullscreenImage.addEventListener('gestureend', (e) => {
            e.preventDefault();
            console.log('gestureend - 最终缩放:', this.imageScale);
        });

        // 标准触摸事件(Android和备用)
        this.fullscreenImage.addEventListener('touchstart', (e) => {
            this.touchState.touchStartTime = Date.now();

            if (e.touches.length === 2) {
                // 双指缩放开始
                e.preventDefault();
                this.touchState.isPinching = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // 计算两指距离
                this.touchState.initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                // 保存当前缩放比例作为初始值
                this.touchState.initialScale = this.imageScale;

                console.log('双指开始 - 初始缩放:', this.touchState.initialScale, '初始距离:', this.touchState.initialDistance);
            } else if (e.touches.length === 1) {
                // 单指操作
                if (this.imageScale > 1) {
                    // 如果已经缩放,则可以拖动
                    this.isDragging = true;
                    this.startX = e.touches[0].clientX - this.imageTranslateX;
                    this.startY = e.touches[0].clientY - this.imageTranslateY;
                }
            }
        }, { passive: false });

        this.fullscreenImage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.touchState.isPinching) {
                // 双指缩放中
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // 计算当前距离
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );

                // 计算新的缩放比例 = (当前距离 / 初始距离) * 初始缩放比例
                const newScale = (currentDistance / this.touchState.initialDistance) * this.touchState.initialScale;
                this.imageScale = Math.max(0.5, Math.min(5, newScale));

                this.updateImageTransform();
            } else if (e.touches.length === 1 && this.isDragging && !this.touchState.isPinching) {
                // 单指拖动
                e.preventDefault();
                this.imageTranslateX = e.touches[0].clientX - this.startX;
                this.imageTranslateY = e.touches[0].clientY - this.startY;
                this.updateImageTransform();
            }
        }, { passive: false });

        this.fullscreenImage.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - this.touchState.touchStartTime;
            console.log('touchend - 剩余手指:', e.touches.length, '当前缩放:', this.imageScale, '持续时间:', touchDuration);

            // 检测双击(只在快速点击时)
            if (touchDuration < 300) {
                const currentTime = Date.now();
                const tapLength = currentTime - this.touchState.lastTap;

                if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
                    // 双击重置
                    if (this.imageScale === 1) {
                        this.imageScale = 2;
                    } else {
                        this.imageScale = 1;
                        this.imageTranslateX = 0;
                        this.imageTranslateY = 0;
                    }
                    this.updateImageTransform();
                    console.log('双击 - 新缩放:', this.imageScale);
                }
                this.touchState.lastTap = currentTime;
            }

            // 重置状态
            if (e.touches.length === 0) {
                // 所有手指都离开屏幕 - 保持缩放状态
                this.isDragging = false;
                this.touchState.isPinching = false;
                console.log('所有手指离开 - 保持缩放:', this.imageScale);
            } else if (e.touches.length === 1) {
                // 还有一个手指在屏幕上
                this.touchState.isPinching = false;
                // 如果图片已缩放,准备拖动
                if (this.imageScale > 1) {
                    this.isDragging = true;
                    this.startX = e.touches[0].clientX - this.imageTranslateX;
                    this.startY = e.touches[0].clientY - this.imageTranslateY;
                }
                console.log('一指离开 - 切换到拖动模式');
            }
        });

        // 双击重置(PC)
        this.fullscreenImage.addEventListener('dblclick', () => {
            if (this.imageScale === 1) {
                this.imageScale = 2;
            } else {
                this.imageScale = 1;
                this.imageTranslateX = 0;
                this.imageTranslateY = 0;
            }
            this.updateImageTransform();
        });
    }

    // 更新图片变换
    updateImageTransform() {
        // 使用transform实现平滑的缩放和移动
        const transform = `translate(${this.imageTranslateX}px, ${this.imageTranslateY}px) scale(${this.imageScale})`;
        this.fullscreenImage.style.transform = transform;

        console.log('更新变换 - 缩放:', this.imageScale, 'Transform:', transform);

        // 更新光标
        if (this.imageScale > 1) {
            this.fullscreenImage.style.cursor = this.isDragging ? 'grabbing' : 'grab';
        } else {
            this.fullscreenImage.style.cursor = 'zoom-in';
        }
    }

    // 缩放图片
    zoomImage(delta) {
        const newScale = Math.max(0.5, Math.min(5, this.imageScale + delta));
        this.imageScale = newScale;
        this.updateImageTransform();
    }

    // 重置缩放
    resetZoom() {
        this.imageScale = 1;
        this.imageTranslateX = 0;
        this.imageTranslateY = 0;
        this.updateImageTransform();
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

    // 渲染历史记录(懒加载)
    async renderHistory(reset = false) {
        try {
            // 如果是重置,清空当前显示
            if (reset) {
                this.historyDisplayCount = 10;
                this.allHistory = await storage.getHistory();
            }

            // 如果没有历史记录
            if (!this.allHistory || this.allHistory.length === 0) {
                this.historyList.innerHTML = '<p class="empty-text">暂无历史记录</p>';
                document.getElementById('historyLoading').style.display = 'none';
                return;
            }

            // 获取要显示的记录
            const displayHistory = this.allHistory.slice(0, this.historyDisplayCount);

            // 渲染历史记录
            this.historyList.innerHTML = displayHistory.map(item => `
                <div class="history-item">
                    <div class="history-item-content" onclick="ui.loadHistoryItem('${item.id}')">
                        <div><strong>${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}</strong></div>
                        <div class="text-muted">${new Date(item.timestamp).toLocaleString()}</div>
                        <div class="text-muted">模型: ${item.model} | ${item.resolution} | ${item.ratio}</div>
                    </div>
                    <div class="history-item-images">
                        ${(item.images || []).slice(0, 4).map((img, idx) => {
                            const thumbnailUrl = this.getProxyImageUrl(img, true);  // 使用缩略图
                            const originalUrl = this.getOriginalImageUrl(img);
                            return `
                                <div class="image-wrapper">
                                    <div class="image-skeleton"></div>
                                    <img
                                        src="${thumbnailUrl}"
                                        alt="历史图片"
                                        onclick="ui.showImagePreview('${this.escapeHtml(originalUrl)}', '${this.escapeHtml(thumbnailUrl)}')"
                                        onload="this.previousElementSibling.style.display='none'"
                                        onerror="this.previousElementSibling.style.display='none'; this.src='${this.escapeHtml(originalUrl)}'">
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="btn-delete-history" onclick="ui.deleteHistoryItem('${item.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // 显示/隐藏"加载更多"按钮
            const loadingDiv = document.getElementById('historyLoading');
            if (this.historyDisplayCount < this.allHistory.length) {
                loadingDiv.style.display = 'block';
            } else {
                loadingDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('渲染历史记录失败:', error);
            this.historyList.innerHTML = '<p class="empty-text error">加载历史记录失败</p>';
        }
    }

    // 加载更多历史记录
    loadMoreHistory() {
        this.historyDisplayCount += 10;
        this.renderHistory(false);
    }

    // 加载历史记录项
    async loadHistoryItem(itemId) {
        try {
            const history = await storage.getHistory();
            const item = history.find(h => h.id === itemId);

            if (item) {
                this.promptInput.value = item.prompt;
                this.modelSelect.value = item.model;
                this.resolutionSelect.value = item.resolution;
                this.ratioSelect.value = item.ratio;
                this.showToast('已加载历史记录', 'success');
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
            this.showToast('加载历史记录失败', 'error');
        }
    }

    // 删除历史记录项
    async deleteHistoryItem(itemId) {
        if (confirm('确定要删除这条历史记录吗？')) {
            try {
                await storage.deleteHistory(itemId);
                await this.renderHistory(true); // 重置并重新加载
                this.showToast('历史记录已删除', 'success');
            } catch (error) {
                console.error('删除历史记录失败:', error);
                this.showToast('删除历史记录失败', 'error');
            }
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

    // ===== 多任务管理 =====

    // 创建任务卡片
    createTaskCard(taskId, prompt) {
        const card = document.createElement('div');
        card.className = 'card task-card';
        card.id = `task-${taskId}`;
        card.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">
                    <i class="fas fa-spinner fa-spin"></i>
                    任务 #${taskId}
                </h3>
                <button class="btn-icon" onclick="app.cancelTask(${taskId})" title="取消任务">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="task-prompt">${this.escapeHtml(prompt.substring(0, 100))}${prompt.length > 100 ? '...' : ''}</p>
            <div class="progress-bar">
                <div class="progress-fill" id="task-progress-${taskId}"></div>
            </div>
            <p class="progress-text" id="task-text-${taskId}">正在提交任务...</p>
            <div class="task-result" id="task-result-${taskId}" style="display: none;"></div>
        `;

        // 插入到列表顶部（最新的任务在最上面）
        if (this.taskList.firstChild) {
            this.taskList.insertBefore(card, this.taskList.firstChild);
        } else {
            this.taskList.appendChild(card);
        }

        // 滚动到任务卡片
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 更新任务进度
    updateTaskProgress(taskId, progress, message) {
        const progressFill = document.getElementById(`task-progress-${taskId}`);
        const progressText = document.getElementById(`task-text-${taskId}`);

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = message;
        }
    }

    // 显示任务结果
    showTaskResult(taskId, result) {
        const card = document.getElementById(`task-${taskId}`);
        if (!card) return;

        // 更新标题
        const title = card.querySelector('.task-title');
        if (title) {
            title.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> 任务 #${taskId} - 完成`;
        }

        // 隐藏进度条
        const progressBar = card.querySelector('.progress-bar');
        const progressText = card.querySelector('.progress-text');
        if (progressBar) progressBar.style.display = 'none';
        if (progressText) progressText.style.display = 'none';

        // 显示结果
        const resultDiv = document.getElementById(`task-result-${taskId}`);
        if (resultDiv && result.images) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="result-info">
                    <span><i class="fas fa-images"></i> ${result.images.length} 张图片</span>
                    <span><i class="fas fa-clock"></i> ${result.duration}秒</span>
                    <button class="btn btn-sm btn-primary" onclick="ui.batchDownloadImages(${JSON.stringify(result.images)})" title="批量下载">
                        <i class="fas fa-download"></i> 全部下载
                    </button>
                </div>
                <div class="image-grid">
                    ${result.images.map(img => `
                        <div class="image-item">
                            <img src="${this.getProxyImageUrl(img)}" alt="生成的图片" onclick="ui.showImagePreview('${this.escapeHtml(img)}')">
                            <div class="image-actions">
                                <button onclick="ui.downloadImage('${this.escapeHtml(img)}')" title="下载">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 移除取消按钮
        const cancelBtn = card.querySelector('.btn-icon');
        if (cancelBtn) cancelBtn.remove();
    }

    // 显示任务错误
    showTaskError(taskId, errorMessage) {
        const card = document.getElementById(`task-${taskId}`);
        if (!card) return;

        // 更新标题
        const title = card.querySelector('.task-title');
        if (title) {
            title.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> 任务 #${taskId} - 失败`;
        }

        // 隐藏进度条
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) progressBar.style.display = 'none';

        // 显示错误信息
        const progressText = card.querySelector('.progress-text');
        if (progressText) {
            progressText.style.color = '#ef4444';
            progressText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${this.escapeHtml(errorMessage)}`;
        }

        // 移除取消按钮，添加关闭按钮
        const cancelBtn = card.querySelector('.btn-icon');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.removeTaskCard(taskId);
            cancelBtn.title = '关闭';
        }
    }

    // 移除任务卡片
    removeTaskCard(taskId) {
        const card = document.getElementById(`task-${taskId}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(100%)';
            setTimeout(() => card.remove(), 300);
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 获取图片URL(优先使用本地缓存)
    getProxyImageUrl(imageInfo, useThumbnail = false) {
        const serverUrl = localStorage.getItem('dreamina_server_url') || '';
        const baseUrl = serverUrl || window.location.origin;

        // 如果是对象格式
        if (typeof imageInfo === 'object') {
            // 如果需要缩略图且有缩略图
            if (useThumbnail && imageInfo.thumbnail) {
                return `${baseUrl}/api/thumbnails/${imageInfo.thumbnail}`;
            }

            // 优先使用本地原图
            if (imageInfo.local) {
                return `${baseUrl}/api/images/${imageInfo.local}`;
            }

            // 使用原始URL
            const originalUrl = imageInfo.original;
            return `${baseUrl}/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
        }

        // 如果是字符串,使用代理
        return `${baseUrl}/api/proxy/image?url=${encodeURIComponent(imageInfo)}`;
    }

    // 获取原图URL(优先使用本地)
    getOriginalImageUrl(imageInfo) {
        const serverUrl = localStorage.getItem('dreamina_server_url') || '';
        const baseUrl = serverUrl || window.location.origin;

        if (typeof imageInfo === 'object') {
            // 优先使用本地原图(局域网速度快)
            if (imageInfo.local) {
                return `${baseUrl}/api/images/${imageInfo.local}`;
            }
            // 降级到远程URL
            return imageInfo.original;
        }
        return imageInfo;
    }

    // 批量下载图片
    async batchDownloadImages(images) {
        try {
            if (!images || images.length === 0) {
                this.showToast('没有可下载的图片', 'error');
                return;
            }

            this.showLoading();
            this.showToast(`正在打包 ${images.length} 张图片...`, 'info');

            // 获取原图URL列表
            const imageUrls = images.map(img => this.getOriginalImageUrl(img));

            // 调用批量下载API
            const response = await fetch(`${CONFIG.api.baseUrl}/images/batch-download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    images: imageUrls
                })
            });

            if (!response.ok) {
                throw new Error('批量下载失败');
            }

            // 获取ZIP文件
            const blob = await response.blob();

            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dreamina_images_${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.hideLoading();
            this.showToast(`成功下载 ${images.length} 张图片`, 'success');
        } catch (error) {
            console.error('批量下载失败:', error);
            this.hideLoading();
            this.showToast('批量下载失败', 'error');
        }
    }
}

// 创建全局UI实例
const ui = new UIManager();

