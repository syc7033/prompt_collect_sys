#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
测试收藏夹API的脚本
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

def get_prompts(token):
    """获取提示词列表，用于测试"""
    print_header("获取提示词列表")
    
    url = f"{BASE_URL}/prompts"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        prompts_data = response.json()
        prompts = prompts_data.get("data", [])
        
        if prompts:
            print_success(f"获取到 {len(prompts)} 个提示词")
            return prompts
        else:
            print_warning("未获取到任何提示词，请确保数据库中有提示词")
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print_error(f"获取提示词失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        sys.exit(1)

def get_favorites(token):
    """获取收藏夹列表"""
    print_header("获取收藏夹列表")
    
    url = f"{BASE_URL}/favorites"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        favorites = response.json()
        
        if favorites:
            print_success(f"获取到 {len(favorites)} 个收藏夹")
            for i, favorite in enumerate(favorites):
                print_info(f"收藏夹 {i+1}:")
                print_info(f"  ID: {favorite.get('id')}")
                print_info(f"  名称: {favorite.get('name')}")
                print_info(f"  创建时间: {favorite.get('created_at')}")
            return favorites
        else:
            print_warning("未获取到任何收藏夹")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取收藏夹列表失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def create_favorite(token, name):
    """创建新收藏夹"""
    print_header(f"创建新收藏夹 (名称: {name})")
    
    url = f"{BASE_URL}/favorites"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": name
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        favorite = response.json()
        print_success(f"创建收藏夹成功")
        print_info(f"ID: {favorite.get('id')}")
        print_info(f"名称: {favorite.get('name')}")
        return favorite
    except requests.exceptions.RequestException as e:
        print_error(f"创建收藏夹失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def get_favorite(token, favorite_id):
    """获取特定收藏夹"""
    print_header(f"获取收藏夹详情 (ID: {favorite_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        favorite = response.json()
        print_success(f"获取收藏夹详情成功")
        print_info(f"ID: {favorite.get('id')}")
        print_info(f"名称: {favorite.get('name')}")
        print_info(f"提示词数量: {len(favorite.get('prompts', []))}")
        return favorite
    except requests.exceptions.RequestException as e:
        print_error(f"获取收藏夹详情失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def update_favorite(token, favorite_id, name):
    """更新收藏夹"""
    print_header(f"更新收藏夹 (ID: {favorite_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": name
    }
    
    try:
        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()
        
        favorite = response.json()
        print_success(f"更新收藏夹成功")
        print_info(f"ID: {favorite.get('id')}")
        print_info(f"名称: {favorite.get('name')}")
        return favorite
    except requests.exceptions.RequestException as e:
        print_error(f"更新收藏夹失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def add_prompt_to_favorite(token, favorite_id, prompt_id):
    """将提示词添加到收藏夹"""
    print_header(f"添加提示词到收藏夹 (收藏夹ID: {favorite_id}, 提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}/prompts/{prompt_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        print_success(f"添加提示词到收藏夹成功")
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"添加提示词到收藏夹失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def get_prompts_in_favorite(token, favorite_id):
    """获取收藏夹中的提示词"""
    print_header(f"获取收藏夹中的提示词 (收藏夹ID: {favorite_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}/prompts"
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
            print_warning("该收藏夹中没有提示词")
        return prompts
    except requests.exceptions.RequestException as e:
        print_error(f"获取收藏夹中的提示词失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def check_prompt_in_favorite(token, favorite_id, prompt_id):
    """检查提示词是否在收藏夹中"""
    print_header(f"检查提示词是否在收藏夹中 (收藏夹ID: {favorite_id}, 提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}/prompts/{prompt_id}/check"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        is_in_favorite = result.get("is_in_favorite", False)
        
        if is_in_favorite:
            print_success(f"提示词在收藏夹中")
        else:
            print_warning(f"提示词不在收藏夹中")
        
        return is_in_favorite
    except requests.exceptions.RequestException as e:
        print_error(f"检查提示词是否在收藏夹中失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def remove_prompt_from_favorite(token, favorite_id, prompt_id):
    """从收藏夹中移除提示词"""
    print_header(f"从收藏夹中移除提示词 (收藏夹ID: {favorite_id}, 提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}/prompts/{prompt_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        print_success(f"从收藏夹中移除提示词成功")
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"从收藏夹中移除提示词失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def delete_favorite(token, favorite_id):
    """删除收藏夹"""
    print_header(f"删除收藏夹 (ID: {favorite_id})")
    
    url = f"{BASE_URL}/favorites/{favorite_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        
        print_success(f"删除收藏夹成功")
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"删除收藏夹失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return False

def main():
    """主函数"""
    print_header("收藏夹API测试")
    
    # 登录获取令牌
    token = login()
    
    # 获取提示词列表
    prompts = get_prompts(token)
    if not prompts:
        return
    
    # 选择第一个提示词进行测试
    prompt = prompts[0]
    prompt_id = prompt.get("id")
    print_info(f"选择提示词: {prompt.get('title')} (ID: {prompt_id})")
    
    # 获取收藏夹列表
    favorites = get_favorites(token)
    
    # 创建新收藏夹
    test_favorite_name = f"测试收藏夹_{int(time.time())}"
    new_favorite = create_favorite(token, name=test_favorite_name)
    
    if new_favorite:
        favorite_id = new_favorite.get("id")
        
        # 获取特定收藏夹
        get_favorite(token, favorite_id)
        
        # 更新收藏夹
        update_favorite(token, favorite_id, name=f"{test_favorite_name}_已更新")
        
        # 添加提示词到收藏夹
        add_prompt_to_favorite(token, favorite_id, prompt_id)
        
        # 获取收藏夹中的提示词
        get_prompts_in_favorite(token, favorite_id)
        
        # 检查提示词是否在收藏夹中
        check_prompt_in_favorite(token, favorite_id, prompt_id)
        
        # 从收藏夹中移除提示词
        remove_prompt_from_favorite(token, favorite_id, prompt_id)
        
        # 再次检查提示词是否在收藏夹中
        check_prompt_in_favorite(token, favorite_id, prompt_id)
        
        # 删除收藏夹
        delete_favorite(token, favorite_id)
    
    print_header("测试完成")

if __name__ == "__main__":
    main()
