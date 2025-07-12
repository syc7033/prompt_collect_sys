#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
测试分类管理API的脚本
"""

import requests
import json
import time
import sys
import uuid
from pprint import pprint

# 配置
BASE_URL = "http://localhost:8000/api"
EMAIL = "syc"  # 请替换为实际存在的用户邮箱
PASSWORD = "123456"  # 请替换为实际密码

# 颜色输出
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(50)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}+ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}- {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKBLUE}* {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}! {text}{Colors.ENDC}")

def login():
    """登录并获取访问令牌"""
    print_header("登录")
    
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if access_token:
            print_success(f"登录成功，获取到访问令牌")
            return access_token
        else:
            print_error("登录成功但未获取到访问令牌")
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print_error(f"登录失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        sys.exit(1)

def get_categories(token):
    """获取分类列表"""
    print_header("获取分类列表")
    
    url = f"{BASE_URL}/categories"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        categories = response.json()
        
        if categories:
            print_success(f"获取到 {len(categories)} 个分类")
            for i, category in enumerate(categories):
                print_info(f"分类 {i+1}:")
                print_info(f"  ID: {category.get('id')}")
                print_info(f"  名称: {category.get('name')}")
                print_info(f"  描述: {category.get('description')}")
                print_info(f"  提示词数量: {category.get('prompt_count')}")
            return categories
        else:
            print_warning("未获取到任何分类")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取分类列表失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def get_category_tree(token):
    """获取分类树结构"""
    print_header("获取分类树结构")
    
    url = f"{BASE_URL}/categories/tree"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        categories = response.json()
        
        if categories:
            print_success(f"获取到分类树结构，共 {len(categories)} 个根分类")
            return categories
        else:
            print_warning("未获取到任何分类树结构")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取分类树结构失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def create_category(token, name, description=None, parent_id=None):
    """创建新分类"""
    print_header(f"创建新分类 (名称: {name})")
    
    url = f"{BASE_URL}/categories"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": name,
        "description": description
    }
    
    if parent_id:
        data["parent_id"] = parent_id
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        category = response.json()
        print_success(f"创建分类成功")
        print_info(f"ID: {category.get('id')}")
        print_info(f"名称: {category.get('name')}")
        print_info(f"描述: {category.get('description')}")
        return category
    except requests.exceptions.RequestException as e:
        print_error(f"创建分类失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def get_category(token, category_id):
    """获取特定分类"""
    print_header(f"获取分类详情 (ID: {category_id})")
    
    url = f"{BASE_URL}/categories/{category_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        category = response.json()
        print_success(f"获取分类详情成功")
        print_info(f"ID: {category.get('id')}")
        print_info(f"名称: {category.get('name')}")
        print_info(f"描述: {category.get('description')}")
        return category
    except requests.exceptions.RequestException as e:
        print_error(f"获取分类详情失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def update_category(token, category_id, name=None, description=None, parent_id=None):
    """更新分类"""
    print_header(f"更新分类 (ID: {category_id})")
    
    url = f"{BASE_URL}/categories/{category_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {}
    if name:
        data["name"] = name
    if description:
        data["description"] = description
    if parent_id:
        data["parent_id"] = parent_id
    
    try:
        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()
        
        category = response.json()
        print_success(f"更新分类成功")
        print_info(f"ID: {category.get('id')}")
        print_info(f"名称: {category.get('name')}")
        print_info(f"描述: {category.get('description')}")
        return category
    except requests.exceptions.RequestException as e:
        print_error(f"更新分类失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def delete_category(token, category_id):
    """删除分类"""
    print_header(f"删除分类 (ID: {category_id})")
    
    url = f"{BASE_URL}/categories/{category_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        
        print_success(f"删除分类成功")
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"删除分类失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def get_prompts_by_category(token, category_id):
    """获取特定分类下的提示词"""
    print_header(f"获取分类下的提示词 (分类ID: {category_id})")
    
    url = f"{BASE_URL}/categories/{category_id}/prompts"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        prompts = response.json()
        
        if prompts:
            print_success(f"获取到 {len(prompts)} 个提示词")
            for i, prompt in enumerate(prompts):
                print_info(f"提示词 {i+1}:")
                print_info(f"  ID: {prompt.get('id')}")
                print_info(f"  标题: {prompt.get('title')}")
                print_info(f"  描述: {prompt.get('description')}")
        else:
            print_warning("该分类下没有提示词")
        return prompts
    except requests.exceptions.RequestException as e:
        print_error(f"获取分类下的提示词失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def check_is_admin(token):
    """检查当前用户是否为管理员"""
    url = f"{BASE_URL}/auth/me"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        user_data = response.json()
        is_admin = user_data.get("is_superuser", False)
        
        if is_admin:
            print_success(f"当前用户是管理员，可以进行所有操作")
        else:
            print_warning(f"当前用户不是管理员，部分操作可能无法执行")
            
        return is_admin
    except requests.exceptions.RequestException as e:
        print_error(f"检查用户权限失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def main():
    """主函数"""
    print_header("分类管理API测试")
    
    # 登录获取令牌
    token = login()
    
    # 检查用户是否为管理员
    is_admin = check_is_admin(token)
    
    # 获取分类列表
    categories = get_categories(token)
    
    # 获取分类树结构
    category_tree = get_category_tree(token)
    
    # 以下操作需要管理员权限
    if is_admin:
        # 创建新分类
        test_category_name = f"测试分类_{int(time.time())}"
        new_category = create_category(
            token, 
            name=test_category_name, 
            description="这是一个用于API测试的分类"
        )
        
        if new_category:
            category_id = new_category.get("id")
            
            # 获取特定分类
            get_category(token, category_id)
            
            # 更新分类
            update_category(
                token, 
                category_id, 
                name=f"{test_category_name}_已更新", 
                description="这是一个已更新的测试分类描述"
            )
            
            # 获取分类下的提示词
            get_prompts_by_category(token, category_id)
            
            # 删除分类
            delete_category(token, category_id)
    else:
        print_warning("跳过需要管理员权限的操作")
        
        # 如果已有分类，可以测试获取特定分类和获取分类下的提示词
        if categories and len(categories) > 0:
            category_id = categories[0].get("id")
            print_info(f"使用已有分类进行测试: {categories[0].get('name')} (ID: {category_id})")
            
            # 获取特定分类
            get_category(token, category_id)
            
            # 获取分类下的提示词
            get_prompts_by_category(token, category_id)
    
    print_header("测试完成")

if __name__ == "__main__":
    main()
