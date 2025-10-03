"""
Dreamina AI Web 后端服务器
基于 Flask 框架，提供 RESTful API
"""

from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import os
import sys
import json
import logging
from pathlib import Path

# 添加父目录到路径，以便导入核心模块
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from core.token_manager import TokenManager
from core.api_client import ApiClient

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建 Flask 应用
app = Flask(__name__, static_folder='.')
CORS(app)  # 启用跨域支持

# 全局变量
config = None
token_manager = None
api_client = None

def load_config():
    """加载配置文件"""
    global config
    config_path = parent_dir / 'config.json'

    if not config_path.exists():
        # 如果不存在，从模板创建
        template_path = parent_dir / 'config.json.template'
        if template_path.exists():
            import shutil
            shutil.copy(template_path, config_path)
            logger.info("从模板创建了 config.json")

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        logger.info("配置文件加载成功")
        return config
    except Exception as e:
        logger.error(f"配置文件加载失败: {e}")
        return None

def save_config():
    """保存配置文件"""
    global config
    config_path = parent_dir / 'config.json'

    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=4)
        logger.info("配置文件保存成功")
        return True
    except Exception as e:
        logger.error(f"配置文件保存失败: {e}")
        return False

def init_components():
    """初始化核心组件"""
    global token_manager, api_client
    
    if not config:
        logger.error("配置未加载，无法初始化组件")
        return False
    
    try:
        token_manager = TokenManager(config)
        api_client = ApiClient(token_manager, config)
        logger.info("核心组件初始化成功")
        return True
    except Exception as e:
        logger.error(f"核心组件初始化失败: {e}")
        return False

# 静态文件服务
@app.route('/')
def index():
    """返回主页"""
    response = send_from_directory('.', 'index.html')
    # 禁用缓存，确保总是获取最新版本
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/<path:path>')
def static_files(path):
    """返回静态文件"""
    response = send_from_directory('.', path)
    # 对 JS 和 CSS 文件禁用缓存
    if path.endswith('.js') or path.endswith('.css'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

# API 路由

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'message': 'Dreamina AI Web Server is running'
    })

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    """获取账号列表"""
    try:
        accounts = config.get('accounts', [])
        # 隐藏完整的 sessionid
        safe_accounts = []
        for i, acc in enumerate(accounts):
            safe_accounts.append({
                'id': str(i),
                'description': acc.get('description', f'账号{i+1}'),
                'sessionId': acc.get('sessionid', '')[:20] + '...' if acc.get('sessionid') else ''
            })

        return jsonify({
            'success': True,
            'accounts': safe_accounts
        })
    except Exception as e:
        logger.error(f"获取账号列表失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/accounts', methods=['POST'])
def add_account():
    """添加账号"""
    global token_manager, api_client

    try:
        data = request.get_json()
        sessionid = data.get('sessionid', '').strip()
        description = data.get('description', '').strip()

        if not sessionid:
            return jsonify({
                'success': False,
                'message': 'SessionID 不能为空'
            }), 400

        if not description:
            description = f'账号 {len(config.get("accounts", [])) + 1}'

        # 检查是否已存在
        accounts = config.get('accounts', [])
        for account in accounts:
            if account.get('sessionid') == sessionid:
                return jsonify({
                    'success': False,
                    'message': '该 SessionID 已存在'
                }), 400

        # 添加新账号
        new_account = {
            'sessionid': sessionid,
            'description': description
        }
        accounts.append(new_account)
        config['accounts'] = accounts

        # 保存到文件
        if not save_config():
            return jsonify({
                'success': False,
                'message': '保存配置失败'
            }), 500

        # 重新初始化组件
        token_manager = TokenManager(config)
        api_client = ApiClient(token_manager, config)

        logger.info(f"✅ 添加账号成功: {description}")

        return jsonify({
            'success': True,
            'message': '账号添加成功',
            'accountId': str(len(accounts) - 1)
        })

    except Exception as e:
        logger.error(f"添加账号失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/accounts/<account_id>', methods=['PUT'])
def update_account(account_id):
    """更新账号"""
    global token_manager, api_client

    try:
        idx = int(account_id)
        accounts = config.get('accounts', [])

        if idx < 0 or idx >= len(accounts):
            return jsonify({
                'success': False,
                'message': '账号不存在'
            }), 404

        data = request.get_json()
        sessionid = data.get('sessionid', '').strip()
        description = data.get('description', '').strip()

        if sessionid:
            # 检查是否与其他账号重复
            for i, account in enumerate(accounts):
                if i != idx and account.get('sessionid') == sessionid:
                    return jsonify({
                        'success': False,
                        'message': '该 SessionID 已被其他账号使用'
                    }), 400
            accounts[idx]['sessionid'] = sessionid

        if description:
            accounts[idx]['description'] = description

        config['accounts'] = accounts

        # 保存到文件
        if not save_config():
            return jsonify({
                'success': False,
                'message': '保存配置失败'
            }), 500

        # 重新初始化组件
        token_manager = TokenManager(config)
        api_client = ApiClient(token_manager, config)

        logger.info(f"✅ 更新账号成功: {description}")

        return jsonify({
            'success': True,
            'message': '账号更新成功'
        })

    except ValueError:
        return jsonify({
            'success': False,
            'message': '无效的账号ID'
        }), 400
    except Exception as e:
        logger.error(f"更新账号失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/accounts/<account_id>', methods=['DELETE'])
def delete_account(account_id):
    """删除账号"""
    global token_manager, api_client

    try:
        idx = int(account_id)
        accounts = config.get('accounts', [])

        if idx < 0 or idx >= len(accounts):
            return jsonify({
                'success': False,
                'message': '账号不存在'
            }), 404

        if len(accounts) == 1:
            return jsonify({
                'success': False,
                'message': '至少需要保留一个账号'
            }), 400

        deleted_account = accounts.pop(idx)
        config['accounts'] = accounts

        # 保存到文件
        if not save_config():
            return jsonify({
                'success': False,
                'message': '保存配置失败'
            }), 500

        # 重新初始化组件
        token_manager = TokenManager(config)
        api_client = ApiClient(token_manager, config)

        logger.info(f"✅ 删除账号成功: {deleted_account.get('description')}")

        return jsonify({
            'success': True,
            'message': '账号删除成功'
        })

    except ValueError:
        return jsonify({
            'success': False,
            'message': '无效的账号ID'
        }), 400
    except Exception as e:
        logger.error(f"删除账号失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/accounts/<account_id>/credit', methods=['GET'])
def get_credit(account_id):
    """获取账号积分"""
    try:
        account_index = int(account_id)
        token_manager.switch_to_account(account_index)
        
        credit_info = token_manager.get_credit()
        
        if credit_info:
            return jsonify({
                'success': True,
                'credit': credit_info
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取积分信息失败'
            }), 500
            
    except Exception as e:
        logger.error(f"获取积分失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/accounts/<account_id>/credit/history', methods=['GET'])
def get_credit_history(account_id):
    """获取积分历史"""
    try:
        account_index = int(account_id)
        count = request.args.get('count', 20, type=int)
        
        token_manager.switch_to_account(account_index)
        history = token_manager.get_credit_history(count=count)
        
        if history:
            return jsonify({
                'success': True,
                'history': history
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取积分历史失败'
            }), 500
            
    except Exception as e:
        logger.error(f"获取积分历史失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/generate/t2i', methods=['POST'])
def generate_t2i():
    """文生图"""
    try:
        data = request.json

        prompt = data.get('prompt')
        model = data.get('model', '3.0')
        ratio = data.get('ratio', '1:1')
        seed = data.get('seed', -1)
        resolution = data.get('resolution', '2k')

        if not prompt:
            return jsonify({
                'success': False,
                'message': '提示词不能为空'
            }), 400

        if len(prompt) > 1600:
            return jsonify({
                'success': False,
                'message': '提示词长度不能超过1600个字符'
            }), 400

        logger.info(f"开始文生图: {prompt[:50]}...")
        logger.info(f"参数: model={model}, ratio={ratio}, resolution={resolution}, seed={seed}")

        # 临时修改配置以支持分辨率和比例
        original_resolution = config.get("params", {}).get("resolution_type")
        original_ratios = config.get("params", {}).get("ratios")

        # 设置分辨率类型
        config["params"]["resolution_type"] = resolution

        # 根据分辨率设置对应的比例配置
        resolution_ratios_key = f"{resolution}_ratios"
        if resolution_ratios_key in config.get("params", {}):
            config["params"]["ratios"] = config["params"][resolution_ratios_key]
            logger.info(f"✅ 设置比例配置: {resolution_ratios_key}")
            logger.info(f"✅ 当前比例 {ratio} 的尺寸: {config['params']['ratios'].get(ratio)}")
        else:
            # 默认使用 2k
            config["params"]["ratios"] = config["params"].get("2k_ratios", {})
            logger.warning(f"⚠️ 未找到 {resolution_ratios_key}，使用默认 2k_ratios")

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
        
        if not result:
            return jsonify({
                'success': False,
                'message': '生成失败'
            }), 500
        
        # 如果是排队状态
        if result.get('is_queued'):
            return jsonify({
                'success': True,
                'queued': True,
                'taskId': result.get('history_id'),
                'message': result.get('queue_message', '任务已进入队列')
            })
        
        # 获取图片URLs
        urls = result.get('urls', [])
        history_id = result.get('history_record_id', '')
        submit_id = result.get('submit_id', '')
        
        if not urls:
            # 返回任务ID，前端需要轮询
            return jsonify({
                'success': True,
                'taskId': submit_id or history_id,
                'message': '任务已提交，请等待生成'
            })
        
        # 直接返回结果
        return jsonify({
            'success': True,
            'completed': True,
            'images': urls,
            'historyId': history_id
        })
        
    except Exception as e:
        logger.error(f"文生图失败: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/generate/i2i', methods=['POST'])
def generate_i2i():
    """图生图"""
    try:
        # 获取参数
        params_str = request.form.get('params')
        if not params_str:
            return jsonify({
                'success': False,
                'message': '缺少参数'
            }), 400
        
        params = json.loads(params_str)
        prompt = params.get('prompt')
        model = params.get('model', '3.0')
        ratio = params.get('ratio', '1:1')
        seed = params.get('seed', -1)
        resolution = params.get('resolution', '2k')
        num_images = params.get('numImages', 4)

        if not prompt:
            return jsonify({
                'success': False,
                'message': '提示词不能为空'
            }), 400

        if len(prompt) > 1600:
            return jsonify({
                'success': False,
                'message': '提示词长度不能超过1600个字符'
            }), 400

        # 获取上传的图片
        images = []
        for key in request.files:
            if key.startswith('image_'):
                file = request.files[key]
                # 保存临时文件
                temp_path = f"/tmp/{key}_{os.urandom(8).hex()}.png"
                file.save(temp_path)
                images.append(temp_path)

        if not images:
            return jsonify({
                'success': False,
                'message': '请至少上传一张参考图'
            }), 400

        logger.info(f"开始图生图: {prompt[:50]}..., 参考图数量: {len(images)}")
        logger.info(f"参数: model={model}, ratio={ratio}, resolution={resolution}, seed={seed}")

        # 临时修改配置以支持分辨率和比例
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

        result = None
        try:
            # 调用 API 客户端
            result = api_client.generate_i2i(
                image=images,  # 传递图片列表
                prompt=prompt,
                model=model,
                ratio=ratio,
                seed=seed,
                num_images=num_images
            )

            if not result:
                return jsonify({
                    'success': False,
                    'message': '生成失败'
                }), 500

            # 解析结果
            if isinstance(result, tuple):
                image_batch, generation_info, image_urls, history_id = result
                urls = image_urls.split('\n') if isinstance(image_urls, str) else []

                return jsonify({
                    'success': True,
                    'completed': True,
                    'images': urls,
                    'historyId': history_id,
                    'info': generation_info
                })
            else:
                return jsonify({
                    'success': False,
                    'message': '返回格式错误'
                }), 500

        finally:
            # 恢复原始配置
            if original_resolution:
                config["params"]["resolution_type"] = original_resolution
            if original_ratios:
                config["params"]["ratios"] = original_ratios

            # 清理临时文件
            for img_path in images:
                try:
                    os.remove(img_path)
                except:
                    pass
        
    except Exception as e:
        logger.error(f"图生图失败: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/generate/status/<task_id>', methods=['GET'])
def check_status(task_id):
    """检查生成状态"""
    try:
        # 调用 API 客户端查询状态
        result = api_client._get_generated_images(task_id)

        if isinstance(result, list) and result:
            return jsonify({
                'success': True,
                'completed': True,
                'images': result
            })
        elif result is None:
            # 返回 None 表示任务不存在或已失败
            return jsonify({
                'success': True,
                'completed': False,
                'failed': True,
                'error': '任务不存在或生成失败'
            })
        else:
            return jsonify({
                'success': True,
                'completed': False,
                'failed': False,
                'message': '正在生成中...'
            })

    except Exception as e:
        logger.error(f"查询状态失败: {e}")
        # 检查是否是 API 错误
        error_msg = str(e)
        if 'invalid parameter' in error_msg.lower() or 'not found' in error_msg.lower():
            return jsonify({
                'success': True,
                'completed': False,
                'failed': True,
                'error': error_msg
            })
        return jsonify({
            'success': False,
            'message': error_msg
        }), 500

@app.route('/api/proxy/image', methods=['GET'])
def proxy_image():
    """图片代理接口 - 解决跨域和网络访问问题"""
    try:
        image_url = request.args.get('url')
        if not image_url:
            return jsonify({
                'success': False,
                'message': '缺少图片URL'
            }), 400

        logger.info(f"代理图片请求: {image_url[:100]}...")

        # 使用 API 客户端的 session 来请求图片（带有正确的 headers）
        import requests
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://dreamina.capcut.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }

        response = requests.get(image_url, headers=headers, timeout=30)

        if response.status_code == 200:
            # 返回图片数据
            return Response(
                response.content,
                mimetype=response.headers.get('Content-Type', 'image/jpeg'),
                headers={
                    'Cache-Control': 'public, max-age=86400',  # 缓存1天
                    'Access-Control-Allow-Origin': '*'
                }
            )
        else:
            logger.error(f"获取图片失败: HTTP {response.status_code}")
            return jsonify({
                'success': False,
                'message': f'获取图片失败: HTTP {response.status_code}'
            }), response.status_code

    except Exception as e:
        logger.error(f"代理图片失败: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': '接口不存在'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': '服务器内部错误'
    }), 500

# 启动服务器
if __name__ == '__main__':
    print("=" * 60)
    print("Dreamina AI Web Server")
    print("=" * 60)
    
    # 加载配置
    if not load_config():
        print("❌ 配置加载失败，请检查 config.json 文件")
        sys.exit(1)
    
    # 初始化组件
    if not init_components():
        print("❌ 组件初始化失败")
        sys.exit(1)
    
    print("✅ 服务器初始化成功")
    print(f"📡 服务器地址: http://localhost:5000")
    print(f"📱 手机访问: http://[你的IP]:5000")
    print("=" * 60)
    
    # 启动服务器
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=5000,
        debug=True
    )

