import requests
import time
import json

task_id = "71696822231569"
url = f"http://localhost:5000/api/generate/status/{task_id}"

print(f"检查任务状态: {task_id}")
print("=" * 60)

for i in range(20):
    try:
        response = requests.get(url)
        data = response.json()
        
        print(f"\n[{i+1}/20] 状态检查:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get('completed'):
            print("\n✅ 生成完成！")
            if data.get('images'):
                print(f"\n共 {len(data['images'])} 张图片:")
                for idx, img_url in enumerate(data['images'], 1):
                    print(f"  {idx}. {img_url}")
            break
        
        if data.get('failed'):
            print(f"\n❌ 生成失败: {data.get('error')}")
            break
        
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        break
else:
    print("\n⏰ 超时")

