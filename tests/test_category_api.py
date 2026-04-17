#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
import uuid
from typing import Dict, Any, Optional

# API基础URL
BASE_URL = "http://localhost:8000"

# 存储登录后的token
token = None

def print_response(response, message="响应"):
    """打印响应内容"""
    print(f"\n===== {message} =====")
    print(f"状态码: {response.status_code}")
    try:
        print(f"内容: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
    except:
        print(f"内容: {response.text}")
    print("=" * (len(message) + 12))

def login(username: str, password: str) -> Optional[str]:
    """登录并获取token"""
    global token
    
    print(f"\n[测试] 登录用户: {username}")
    
    login_url = f"{BASE_URL}/api/auth/login"
    login_data = {
        "username": username,
        "password": password
    }
    
    response = requests.post(
        login_url, 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"[成功] 登录成功，获取到token")
        return token
    else:
        print_response(response, "登录失败")
        return None

def get_auth_header() -> Dict[str, str]:
    """获取带有认证信息的请求头"""
    if not token:
        raise ValueError("未登录，请先调用login()函数")
    return {"Authorization": f"Bearer {token}"}

def get_categories():
    """获取分类列表"""
    print("\n[测试] 获取分类列表")
    
    url = f"{BASE_URL}/api/categories"
    response = requests.get(url, headers=get_auth_header())
    
    print_response(response, "分类列表")
    return response.json() if response.status_code == 200 else None

def create_prompt(title: str, content: str, description: str = None, tags: list = None) -> Optional[Dict[str, Any]]:
    """创建一个新的提示词"""
    print(f"\n[测试] 创建提示词: {title}")
    
    url = f"{BASE_URL}/api/prompts"
    data = {
        "title": title,
        "content": content,
        "description": description or "",
        "tags": tags or []
    }
    
    response = requests.post(url, json=data, headers=get_auth_header())
    
    print_response(response, "创建提示词")
    return response.json() if response.status_code == 201 else None

def add_prompt_to_category(category_id: str, prompt_id: str) -> bool:
    """将提示词添加到分类"""
    print(f"\n[测试] 将提示词 {prompt_id} 添加到分类 {category_id}")
    
    url = f"{BASE_URL}/api/categories/{category_id}/prompts/{prompt_id}"
    response = requests.post(url, headers=get_auth_header())
    
    print_response(response, "添加提示词到分类")
    return response.status_code == 200

def remove_prompt_from_category(category_id: str, prompt_id: str) -> bool:
    """从分类中移除提示词"""
    print(f"\n[测试] 从分类 {category_id} 中移除提示词 {prompt_id}")
    
    url = f"{BASE_URL}/api/categories/{category_id}/prompts/{prompt_id}"
    response = requests.delete(url, headers=get_auth_header())
    
    print_response(response, "从分类中移除提示词")
    return response.status_code == 200

def get_category_prompts(category_id: str) -> Optional[list]:
    """获取分类下的提示词"""
    print(f"\n[测试] 获取分类 {category_id} 下的提示词")
    
    url = f"{BASE_URL}/api/categories/{category_id}/prompts"
    response = requests.get(url, headers=get_auth_header())
    
    print_response(response, "分类下的提示词")
    return response.json() if response.status_code == 200 else None

def main():
    """主测试函数"""
    # 1. 登录
    # 请替换为你的实际用户名和密码
    username = "admin"  # 替换为你的用户名
    password = "123456"  # 替换为你的密码
    
    if not login(username, password):
        print("登录失败，无法继续测试")
        return
    
    # 2. 获取分类列表
    categories = get_categories()
    if not categories or len(categories) == 0:
        print("未找到任何分类，无法继续测试")
        return
    
    # 选择第一个分类进行测试
    test_category = categories[0]
    category_id = test_category["id"]
    print(f"将使用分类 '{test_category['name']}' (ID: {category_id}) 进行测试")
    
    # 3. 创建一个新的提示词
    test_prompt = create_prompt(
        title=f"测试提示词 {uuid.uuid4().hex[:8]}",
        content="这是一个用于测试分类API的提示词",
        description="测试描述",
        tags=["测试", "API"]
    )
    
    if not test_prompt:
        print("创建提示词失败，无法继续测试")
        return
    
    prompt_id = test_prompt["id"]
    print(f"成功创建提示词 '{test_prompt['title']}' (ID: {prompt_id})")
    
    # 4. 获取分类下的提示词（添加前）
    print("\n--- 添加提示词到分类前 ---")
    before_prompts = get_category_prompts(category_id)
    before_count = len(before_prompts) if before_prompts else 0
    
    # 5. 将提示词添加到分类
    if add_prompt_to_category(category_id, prompt_id):
        print(f"成功将提示词添加到分类")
    else:
        print(f"添加提示词到分类失败")
    
    # 6. 获取分类下的提示词（添加后）
    print("\n--- 添加提示词到分类后 ---")
    after_prompts = get_category_prompts(category_id)
    after_count = len(after_prompts) if after_prompts else 0
    
    print(f"添加前提示词数量: {before_count}, 添加后提示词数量: {after_count}")
    
    # 7. 从分类中移除提示词
    if remove_prompt_from_category(category_id, prompt_id):
        print(f"成功从分类中移除提示词")
    else:
        print(f"从分类中移除提示词失败")
    
    # 8. 获取分类下的提示词（移除后）
    print("\n--- 从分类中移除提示词后 ---")
    final_prompts = get_category_prompts(category_id)
    final_count = len(final_prompts) if final_prompts else 0
    
    print(f"移除后提示词数量: {final_count}")
    
    # 9. 再次获取分类列表，检查提示词数量是否更新
    print("\n--- 检查分类列表中的提示词数量 ---")
    updated_categories = get_categories()
    for cat in updated_categories:
        if cat["id"] == category_id:
            print(f"分类 '{cat['name']}' 的提示词数量: {cat['prompt_count']}")
            break

if __name__ == "__main__":
    main()
