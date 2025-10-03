#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试图片生成功能
"""

import requests
import json
import time

API_BASE = "http://localhost:5000/api"

def test_health():
    """测试健康检查"""
    print("=" * 60)
    print("1. 测试健康检查")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE}/health")
        data = response.json()
        print(f"✅ 服务器状态: {data}")
        return True
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False

def test_accounts():
    """测试获取账号"""
    print("\n" + "=" * 60)
    print("2. 测试获取账号")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE}/accounts")
        data = response.json()
        
        if data.get('success'):
            accounts = data.get('accounts', [])
            print(f"✅ 找到 {len(accounts)} 个账号")
            for acc in accounts:
                session_id = acc.get('sessionId', '')
                if session_id:
                    print(f"   - {acc.get('description')}: {session_id}")
                else:
                    print(f"   - {acc.get('description')}: (未配置)")
            return True
        else:
            print(f"❌ 获取账号失败: {data.get('message')}")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_t2i():
    """测试文生图"""
    print("\n" + "=" * 60)
    print("3. 测试文生图")
    print("=" * 60)
    
    payload = {
        "prompt": "一只可爱的橘猫，坐在窗台上，阳光洒在身上，温暖的画面",
        "model": "3.0",
        "ratio": "1:1",
        "resolution": "2k",
        "seed": -1,
        "num_images": 4
    }
    
    print(f"📝 提示词: {payload['prompt']}")
    print(f"📝 参数: model={payload['model']}, ratio={payload['ratio']}, resolution={payload['resolution']}")
    print(f"⏳ 正在提交任务...")
    
    try:
        response = requests.post(
            f"{API_BASE}/generate/t2i",
            json=payload,
            timeout=60
        )
        
        print(f"📨 HTTP 状态码: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ 请求失败: HTTP {response.status_code}")
            print(f"响应内容: {response.text}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ 生成失败: {data.get('message')}")
            return False
        
        print(f"✅ 任务提交成功")
        
        # 检查是否直接返回了图片
        if data.get('completed') and data.get('images'):
            images = data.get('images', [])
            print(f"✅ 生成完成！共 {len(images)} 张图片")
            for i, url in enumerate(images, 1):
                print(f"   {i}. {url}")
            return True
        
        # 需要轮询
        task_id = data.get('taskId')
        if task_id:
            print(f"⏳ 任务ID: {task_id}")
            print(f"⏳ 开始轮询状态...")
            return poll_status(task_id)
        
        print(f"⚠️ 未知响应格式: {data}")
        return False
        
    except requests.exceptions.Timeout:
        print(f"❌ 请求超时")
        return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def poll_status(task_id, max_attempts=60):
    """轮询任务状态"""
    for attempt in range(max_attempts):
        time.sleep(5)
        
        try:
            response = requests.get(f"{API_BASE}/generate/status/{task_id}")
            data = response.json()
            
            print(f"⏳ 检查状态 ({attempt + 1}/{max_attempts})...")
            
            if data.get('completed') and data.get('images'):
                images = data.get('images', [])
                print(f"✅ 生成完成！共 {len(images)} 张图片")
                for i, url in enumerate(images, 1):
                    print(f"   {i}. {url}")
                return True
            
            if data.get('failed'):
                print(f"❌ 生成失败: {data.get('error')}")
                return False
                
        except Exception as e:
            print(f"⚠️ 状态检查失败: {e}")
    
    print(f"❌ 生成超时")
    return False

def main():
    """主函数"""
    print("\n" + "🎨" * 30)
    print("Dreamina AI 图片生成测试")
    print("🎨" * 30 + "\n")
    
    # 1. 健康检查
    if not test_health():
        print("\n❌ 服务器未运行，请先启动服务器")
        return
    
    # 2. 账号检查
    if not test_accounts():
        print("\n❌ 账号配置有问题，请检查 config.json")
        return
    
    # 3. 文生图测试
    print("\n⏳ 准备开始生成图片...")
    time.sleep(2)
    
    success = test_t2i()
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    if success:
        print("✅ 所有测试通过！图片生成功能正常工作")
        print("✅ 现在可以在浏览器中使用了")
        print(f"✅ 访问: http://localhost:5000")
    else:
        print("❌ 测试失败，请检查错误信息")
        print("💡 提示:")
        print("   1. 确认 SessionID 是否有效")
        print("   2. 确认网络连接是否正常")
        print("   3. 确认积分是否充足")
        print("   4. 查看服务器日志获取详细错误")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

