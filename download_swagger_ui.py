import requests
import os

# 获取项目根目录的绝对路径
project_root = os.path.dirname(os.path.abspath(__file__))

# 创建静态文件目录
static_dir = os.path.join(project_root, "static")
os.makedirs(static_dir, exist_ok=True)

# 下载Swagger UI CSS
css_url = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css"
css_file_path = os.path.join(static_dir, "swagger-ui.css")

# 下载Swagger UI Bundle JS
js_url = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"
js_file_path = os.path.join(static_dir, "swagger-ui-bundle.js")

try:
    # 下载CSS文件
    print(f"正在下载 {css_url}...")
    css_response = requests.get(css_url)
    css_response.raise_for_status()  # 如果请求失败，抛出异常
    
    with open(css_file_path, "wb") as f:
        f.write(css_response.content)
    print(f"CSS文件已保存到 {css_file_path}")
    
    # 下载JS文件
    print(f"正在下载 {js_url}...")
    js_response = requests.get(js_url)
    js_response.raise_for_status()  # 如果请求失败，抛出异常
    
    with open(js_file_path, "wb") as f:
        f.write(js_response.content)
    print(f"JS文件已保存到 {js_file_path}")
    
    print("下载完成！")
    
except Exception as e:
    print(f"下载文件时出错: {e}")
