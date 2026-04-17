#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
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

def get_category_tree():
    """获取分类树结构"""
    print("\n[测试] 获取分类树结构")
    
    url = f"{BASE_URL}/api/categories/tree"
    response = requests.get(url, headers=get_auth_header())
    
    print_response(response, "分类树结构")
    
    if response.status_code == 200:
        data = response.json()
        # 分析分类树结构
        analyze_category_tree(data)
        return data
    return None

def analyze_category_tree(categories, level=0):
    """分析分类树结构"""
    if not categories:
        print("  " * level + "没有分类")
        return
    
    for category in categories:
        indent = "  " * level
        has_children = "children" in category and category["children"]
        children_count = len(category["children"]) if has_children else 0
        
        print(f"{indent}分类: {category['name']} (ID: {category['id']})")
        print(f"{indent}  描述: {category.get('description', '无')}")
        print(f"{indent}  父ID: {category.get('parent_id', '无')}")
        print(f"{indent}  是否有子分类: {has_children}")
        print(f"{indent}  子分类数量: {children_count}")
        
        if has_children and children_count > 0:
            analyze_category_tree(category["children"], level + 1)

def main():
    """主测试函数"""
    # 1. 登录
    username = "admin"  # 替换为你的用户名
    password = "123456"  # 替换为你的密码
    
    if not login(username, password):
        print("登录失败，无法继续测试")
        return
    
    # 2. 获取分类树结构
    category_tree = get_category_tree()
    
    if not category_tree:
        print("获取分类树失败")
        return
    
    print("\n[测试完成]")

if __name__ == "__main__":
    main()
