#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
测试评分和评论API的脚本
"""

import requests
import json
import time
import sys
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
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKBLUE}ℹ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

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
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
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
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        sys.exit(1)

def create_rating(token, prompt_id, score, comment):
    """创建或更新评分和评论"""
    print_header(f"创建评分和评论 (提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/ratings/prompts/{prompt_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "score": score,
        "comment": comment
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        if result.get("status") == "success":
            print_success("创建评分和评论成功")
            rating = result.get("rating", {})
            print_info(f"评分ID: {rating.get('id')}")
            print_info(f"评分: {rating.get('score')}")
            print_info(f"评论: {rating.get('comment')}")
            return rating
        else:
            print_error(f"创建评分和评论失败: {result.get('message', '未知错误')}")
            return None
    except requests.exceptions.RequestException as e:
        print_error(f"创建评分和评论请求失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return None

def get_ratings(token, prompt_id):
    """获取提示词的评分列表"""
    print_header(f"获取评分列表 (提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/ratings/prompts/{prompt_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        ratings = result.get("data", [])
        
        if ratings:
            print_success(f"获取到 {len(ratings)} 条评分")
            for i, rating in enumerate(ratings):
                print_info(f"评分 {i+1}:")
                print_info(f"  ID: {rating.get('id')}")
                print_info(f"  用户: {rating.get('user_username')}")
                print_info(f"  评分: {rating.get('score')}")
                print_info(f"  评论: {rating.get('comment')}")
                print_info(f"  有用标记数: {rating.get('helpful_count')}")
            return ratings
        else:
            print_warning("未获取到任何评分")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取评分列表失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return []

def mark_helpful(token, rating_id):
    """标记评论为有用"""
    print_header(f"标记评论为有用 (评分ID: {rating_id})")
    
    url = f"{BASE_URL}/ratings/{rating_id}/helpful"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if result.get("status") == "success":
            is_helpful = result.get("is_helpful", False)
            helpful_count = result.get("helpful_count", 0)
            action = "标记为有用" if is_helpful else "取消标记为有用"
            print_success(f"{action}成功")
            print_info(f"当前有用标记数: {helpful_count}")
            return True
        else:
            print_error(f"标记为有用失败: {result.get('message', '未知错误')}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"标记为有用请求失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return False

def main():
    """主函数"""
    print_header("评分和评论API测试")
    
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
    
    # 创建评分和评论
    rating = create_rating(token, prompt_id, 5, "这是一个非常有用的提示词，帮助我解决了很多问题！")
    if not rating:
        return
    
    # 获取评分列表
    ratings = get_ratings(token, prompt_id)
    if not ratings:
        return
    
    # 标记评论为有用
    rating_id = ratings[0].get("id")
    mark_helpful(token, rating_id)
    
    # 再次获取评分列表，检查有用标记是否生效
    print_info("等待1秒后再次获取评分列表...")
    time.sleep(1)
    get_ratings(token, prompt_id)
    
    print_header("测试完成")

if __name__ == "__main__":
    main()
