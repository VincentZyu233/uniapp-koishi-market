import base64
import os

# 定义文件路径
font_file = r'G:\GGames\Minecraft\shuyeyun\qq-bot\uniapp-webui\uniapp-koishi-market\static\fonts\LXGWWenKaiMono-Regular.ttf'
app_vue_path = r'G:\GGames\Minecraft\shuyeyun\qq-bot\uniapp-webui\uniapp-koishi-market\App.vue'

# 转换字体文件为base64
print("正在转换 Regular 字体...")
with open(font_file, 'rb') as f:
    font_data = f.read()
    base64_str = base64.b64encode(font_data).decode('utf-8')

print(f"Regular 转换完成，大小: {len(base64_str)} 字符")

# 读取App.vue文件
print("\n正在读取 App.vue...")
with open(app_vue_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 准备替换的新内容（只使用Regular字体，但定义三个font-weight）
old_font_face = """	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('/static/fonts/LXGWWenKaiMono-Light.ttf') format('truetype');
		font-weight: 300;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('/static/fonts/LXGWWenKaiMono-Regular.ttf') format('truetype');
		font-weight: 400;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('/static/fonts/LXGWWenKaiMono-Medium.ttf') format('truetype');
		font-weight: 500;
		font-style: normal;
	}"""

# 所有字重都使用相同的Regular字体
new_font_face = f"""	@font-face {{
		font-family: 'LXGWWenKaiMono';
		src: url('data:font/truetype;charset=utf-8;base64,{base64_str}') format('truetype');
		font-weight: 300;
		font-style: normal;
	}}
	
	@font-face {{
		font-family: 'LXGWWenKaiMono';
		src: url('data:font/truetype;charset=utf-8;base64,{base64_str}') format('truetype');
		font-weight: 400;
		font-style: normal;
	}}
	
	@font-face {{
		font-family: 'LXGWWenKaiMono';
		src: url('data:font/truetype;charset=utf-8;base64,{base64_str}') format('truetype');
		font-weight: 500;
		font-style: normal;
	}}"""

# 替换内容
if old_font_face in content:
    print("\n找到要替换的字体定义，正在替换...")
    new_content = content.replace(old_font_face, new_font_face)
    
    # 写入文件
    with open(app_vue_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ App.vue 已成功更新为base64字体！")
    print("✅ 只使用了 Regular 字体应用于所有字重（300/400/500）")
else:
    print("❌ 未找到要替换的字体定义，请检查App.vue内容")
