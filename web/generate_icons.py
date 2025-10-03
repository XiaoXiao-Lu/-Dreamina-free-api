#!/usr/bin/env python3
"""
生成PWA所需的各种尺寸图标
"""
import os
from PIL import Image, ImageDraw, ImageFont

# 图标尺寸
ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# 创建icons目录
ICONS_DIR = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(ICONS_DIR, exist_ok=True)

def create_icon(size):
    """创建指定尺寸的图标"""
    # 创建渐变背景
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变效果
    for i in range(size):
        # 从深蓝到浅蓝的渐变
        r = int(99 + (139 - 99) * i / size)
        g = int(102 + (146 - 102) * i / size)
        b = int(241 + (255 - 241) * i / size)
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # 绘制圆形背景
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    draw.ellipse(
        [circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size],
        fill='white',
        outline='#6366f1',
        width=max(2, size // 64)
    )
    
    # 绘制魔法棒图标 (简化版)
    center_x, center_y = size // 2, size // 2
    wand_length = int(size * 0.35)
    
    # 魔法棒主体
    draw.line(
        [(center_x - wand_length//2, center_y + wand_length//2),
         (center_x + wand_length//2, center_y - wand_length//2)],
        fill='#6366f1',
        width=max(3, size // 32)
    )
    
    # 星星装饰
    star_size = int(size * 0.15)
    star_x = center_x + wand_length//2
    star_y = center_y - wand_length//2
    
    # 绘制简单的星星
    points = []
    for i in range(5):
        angle = i * 144 - 90  # 五角星
        import math
        x = star_x + star_size * math.cos(math.radians(angle))
        y = star_y + star_size * math.sin(math.radians(angle))
        points.append((x, y))
    
    draw.polygon(points, fill='#fbbf24', outline='#f59e0b', width=max(1, size // 128))
    
    # 保存图标
    filename = f'icon-{size}x{size}.png'
    filepath = os.path.join(ICONS_DIR, filename)
    img.save(filepath, 'PNG', quality=95)
    print(f'✅ 生成图标: {filename}')

def create_apple_touch_icon():
    """创建Apple Touch Icon (180x180)"""
    size = 180
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变效果
    for i in range(size):
        r = int(99 + (139 - 99) * i / size)
        g = int(102 + (146 - 102) * i / size)
        b = int(241 + (255 - 241) * i / size)
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # 绘制圆形背景
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    draw.ellipse(
        [circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size],
        fill='white',
        outline='#6366f1',
        width=3
    )
    
    # 绘制魔法棒
    center_x, center_y = size // 2, size // 2
    wand_length = int(size * 0.35)
    
    draw.line(
        [(center_x - wand_length//2, center_y + wand_length//2),
         (center_x + wand_length//2, center_y - wand_length//2)],
        fill='#6366f1',
        width=5
    )
    
    # 星星
    star_size = int(size * 0.15)
    star_x = center_x + wand_length//2
    star_y = center_y - wand_length//2
    
    points = []
    for i in range(5):
        angle = i * 144 - 90
        import math
        x = star_x + star_size * math.cos(math.radians(angle))
        y = star_y + star_size * math.sin(math.radians(angle))
        points.append((x, y))
    
    draw.polygon(points, fill='#fbbf24', outline='#f59e0b', width=2)
    
    # 保存
    filepath = os.path.join(ICONS_DIR, 'apple-touch-icon.png')
    img.save(filepath, 'PNG', quality=95)
    print(f'✅ 生成Apple Touch Icon: apple-touch-icon.png')

def main():
    print('🎨 开始生成PWA图标...')
    print(f'📁 图标目录: {ICONS_DIR}')
    print('-' * 50)
    
    # 生成各种尺寸的图标
    for size in ICON_SIZES:
        create_icon(size)
    
    # 生成Apple Touch Icon
    create_apple_touch_icon()
    
    print('-' * 50)
    print('✨ 所有图标生成完成!')
    print(f'📂 图标位置: {ICONS_DIR}')

if __name__ == '__main__':
    main()

