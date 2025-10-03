// 配置文件
const CONFIG = {
    // API 基础配置
    api: {
        baseUrl: 'http://localhost:5000/api',  // 后端API地址
        timeout: 30000,
    },
    
    // 模型配置
    models: {
        'NanoBanana': {
            name: '谷歌 NanoBanana',
            model_req_key: 'external_model_gemini_flash_image_v25',
            description: '影视质感，文字更准，直出2k高清图',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '4.0': {
            name: '图片 4.0',
            model_req_key: 'high_aes_general_v40',
            description: '影视质感，文字更准，直出2k高清图',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '3.1': {
            name: '图片 3.1',
            model_req_key: 'high_aes_general_v30l_art:general_v3.0_18b',
            description: '影视质感，文字更准，直出2k高清图',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '3.0': {
            name: '图片 3.0',
            model_req_key: 'high_aes_general_v30l:general_v3.0_18b',
            description: '影视质感，文字更准，直出2k高清图',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '2.1': {
            name: '图片 2.1',
            model_req_key: 'high_aes_general_v21_L:general_v2.1_L',
            description: '稳定的结构和更强的影视质感，支持生成中、英文文字',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '2.0p': {
            name: '图片 2.0 Pro',
            model_req_key: 'high_aes_general_v20_L:general_v2.0_L',
            description: '大幅提升了多样性和真实的照片质感',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        },
        '1.4': {
            name: '图片 1.4',
            model_req_key: 'high_aes_general_v14:general_v1.4',
            description: '更精准的描述词响应和多样的风格组合',
            cost_per_t2i: 2,
            cost_per_i2i: 4
        }
    },
    
    // 分辨率配置
    resolutions: {
        '1k': {
            '1:1': { width: 1328, height: 1328 },
            '2:3': { width: 1056, height: 1584 },
            '3:4': { width: 1104, height: 1472 },
            '4:3': { width: 1472, height: 1104 },
            '3:2': { width: 1584, height: 1056 },
            '16:9': { width: 1664, height: 936 },
            '9:16': { width: 936, height: 1664 }
        },
        '2k': {
            '1:1': { width: 2048, height: 2048 },
            '2:3': { width: 1664, height: 2496 },
            '3:4': { width: 1728, height: 2304 },
            '4:3': { width: 2304, height: 1728 },
            '3:2': { width: 2496, height: 1664 },
            '16:9': { width: 2560, height: 1440 },
            '9:16': { width: 1440, height: 2560 }
        },
        '4k': {
            '1:1': { width: 4096, height: 4096 },
            '2:3': { width: 3328, height: 4992 },
            '3:4': { width: 3520, height: 4693 },
            '4:3': { width: 4693, height: 3520 },
            '3:2': { width: 4992, height: 3328 },
            '16:9': { width: 5404, height: 3040 },
            '9:16': { width: 3040, height: 5404 }
        }
    },
    
    // 本地存储键名
    storage: {
        accounts: 'dreamina_accounts',
        currentAccount: 'dreamina_current_account',
        history: 'dreamina_history',
        settings: 'dreamina_settings'
    },
    
    // 默认设置
    defaults: {
        model: '3.0',
        resolution: '2k',
        ratio: '1:1',
        seed: -1,
        numImages: 4
    },
    
    // 限制
    limits: {
        maxPromptLength: 1600,
        maxReferenceImages: 6,
        maxHistoryItems: 50
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

