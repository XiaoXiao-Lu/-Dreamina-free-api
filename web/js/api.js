// API 调用模块
class DreaminaAPI {
    constructor() {
        this.baseUrl = CONFIG.api.baseUrl;
        this.timeout = CONFIG.api.timeout;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // 获取账号列表
    async getAccounts() {
        return this.request('/accounts');
    }

    // 添加账号
    async addAccount(sessionId, description) {
        return this.request('/accounts', {
            method: 'POST',
            body: JSON.stringify({ sessionId, description }),
        });
    }

    // 删除账号
    async deleteAccount(accountId) {
        return this.request(`/accounts/${accountId}`, {
            method: 'DELETE',
        });
    }

    // 切换账号
    async switchAccount(accountId) {
        return this.request(`/accounts/${accountId}/switch`, {
            method: 'POST',
        });
    }

    // 获取积分信息
    async getCredit(accountId) {
        return this.request(`/accounts/${accountId}/credit`);
    }

    // 获取积分历史
    async getCreditHistory(accountId, count = 20) {
        return this.request(`/accounts/${accountId}/credit/history?count=${count}`);
    }

    // 文生图
    async generateT2I(params) {
        return this.request('/generate/t2i', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    // 图生图
    async generateI2I(params, images) {
        const formData = new FormData();
        
        // 添加参数
        formData.append('params', JSON.stringify(params));
        
        // 添加图片
        images.forEach((image, index) => {
            formData.append(`image_${index}`, image);
        });

        return this.request('/generate/i2i', {
            method: 'POST',
            headers: {}, // 让浏览器自动设置 Content-Type
            body: formData,
        });
    }

    // 查询生成状态
    async checkStatus(taskId) {
        return this.request(`/generate/status/${taskId}`);
    }

    // 获取生成结果
    async getResult(taskId) {
        return this.request(`/generate/result/${taskId}`);
    }

    // 下载图片
    async downloadImage(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'dreamina_image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('下载图片失败:', error);
            throw error;
        }
    }
}

// 本地存储管理
class StorageManager {
    constructor() {
        this.accountsCache = null;
        this.currentAccountId = localStorage.getItem(CONFIG.storage.currentAccount) || '0';
    }

    // 获取账号列表（从服务器）
    async getAccounts() {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/accounts`);
            const data = await response.json();

            if (data.success) {
                this.accountsCache = data.accounts;
                return data.accounts;
            } else {
                console.error('获取账号列表失败:', data.message);
                return [];
            }
        } catch (error) {
            console.error('获取账号列表失败:', error);
            return [];
        }
    }

    // 添加账号（到服务器）
    async addAccount(sessionId, description) {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionid: sessionId,
                    description: description
                })
            });

            const data = await response.json();

            if (data.success) {
                // 刷新缓存
                await this.getAccounts();
                return { id: data.accountId, sessionId, description };
            } else {
                throw new Error(data.message || '添加账号失败');
            }
        } catch (error) {
            console.error('添加账号失败:', error);
            throw error;
        }
    }

    // 更新账号（到服务器）
    async updateAccount(accountId, sessionId, description) {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/accounts/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionid: sessionId,
                    description: description
                })
            });

            const data = await response.json();

            if (data.success) {
                // 刷新缓存
                await this.getAccounts();
                return true;
            } else {
                throw new Error(data.message || '更新账号失败');
            }
        } catch (error) {
            console.error('更新账号失败:', error);
            throw error;
        }
    }

    // 删除账号（从服务器）
    async deleteAccount(accountId) {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/accounts/${accountId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                // 如果删除的是当前账号，切换到第一个账号
                if (this.currentAccountId === accountId) {
                    this.currentAccountId = '0';
                    localStorage.setItem(CONFIG.storage.currentAccount, '0');
                }
                // 刷新缓存
                await this.getAccounts();
                return true;
            } else {
                throw new Error(data.message || '删除账号失败');
            }
        } catch (error) {
            console.error('删除账号失败:', error);
            throw error;
        }
    }

    // 获取当前账号
    getCurrentAccount() {
        if (this.accountsCache && this.accountsCache.length > 0) {
            const account = this.accountsCache.find(acc => acc.id === this.currentAccountId);
            return account || this.accountsCache[0];
        }
        return null;
    }

    // 设置当前账号
    setCurrentAccount(accountId) {
        this.currentAccountId = accountId;
        localStorage.setItem(CONFIG.storage.currentAccount, accountId);
    }

    // 获取历史记录
    getHistory() {
        const history = localStorage.getItem(CONFIG.storage.history);
        return history ? JSON.parse(history) : [];
    }

    // 保存历史记录
    saveHistory(history) {
        // 限制历史记录数量
        const limited = history.slice(0, CONFIG.limits.maxHistoryItems);
        localStorage.setItem(CONFIG.storage.history, JSON.stringify(limited));
    }

    // 添加历史记录
    addHistory(item) {
        const history = this.getHistory();
        history.unshift({
            ...item,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
        });
        this.saveHistory(history);
    }

    // 删除历史记录
    deleteHistory(itemId) {
        const history = this.getHistory();
        const filtered = history.filter(item => item.id !== itemId);
        this.saveHistory(filtered);
    }

    // 清空历史记录
    clearHistory() {
        localStorage.removeItem(CONFIG.storage.history);
    }

    // 获取设置
    getSettings() {
        const settings = localStorage.getItem(CONFIG.storage.settings);
        return settings ? JSON.parse(settings) : CONFIG.defaults;
    }

    // 保存设置
    saveSettings(settings) {
        localStorage.setItem(CONFIG.storage.settings, JSON.stringify(settings));
    }
}

// 创建全局实例
const api = new DreaminaAPI();
const storage = new StorageManager();

