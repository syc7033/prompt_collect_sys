#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
测试使用频率统计API的脚本
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

def record_usage(token, prompt_id, usage_type):
    """记录提示词使用"""
    print_header(f"记录提示词使用 (提示词ID: {prompt_id}, 类型: {usage_type})")
    
    url = f"{BASE_URL}/usage/prompts/{prompt_id}/{usage_type}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if result.get("status") == "success":
            print_success(f"记录使用成功")
            print_info(f"使用ID: {result.get('usage_id')}")
            print_info(f"消息: {result.get('message')}")
            return True
        else:
            print_error(f"记录使用失败: {result.get('message', '未知错误')}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"记录使用请求失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return False

def get_usage_stats(token, prompt_id):
    """获取提示词使用统计"""
    print_header(f"获取使用统计 (提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/usage/prompts/{prompt_id}/stats"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if result.get("status") == "success":
            stats = result.get("data", {})
            print_success(f"获取使用统计成功")
            print_info(f"总使用次数: {stats.get('total_usages', 0)}")
            print_info(f"复制次数: {stats.get('copy_count', 0)}")
            print_info(f"应用次数: {stats.get('apply_count', 0)}")
            print_info(f"查看次数: {stats.get('view_count', 0)}")
            print_info(f"Fork次数: {stats.get('fork_count', 0)}")
            return stats
        else:
            print_error(f"获取使用统计失败: {result.get('message', '未知错误')}")
            return None
    except requests.exceptions.RequestException as e:
        print_error(f"获取使用统计请求失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return None

def get_usage_records(token, prompt_id):
    """获取提示词使用记录"""
    print_header(f"获取使用记录 (提示词ID: {prompt_id})")
    
    url = f"{BASE_URL}/usage/prompts/{prompt_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        usages = result.get("data", [])
        
        if usages:
            print_success(f"获取到 {len(usages)} 条使用记录")
            for i, usage in enumerate(usages):
                print_info(f"记录 {i+1}:")
                print_info(f"  ID: {usage.get('id')}")
                print_info(f"  类型: {usage.get('usage_type')}")
                print_info(f"  时间: {usage.get('created_at')}")
            return usages
        else:
            print_warning("未获取到任何使用记录")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取使用记录失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return []

def get_popular_prompts(token, time_range=None):
    """获取热门提示词"""
    print_header(f"获取热门提示词 (时间范围: {time_range if time_range else '全部'})")
    
    url = f"{BASE_URL}/usage/popular"
    if time_range:
        url += f"?time_range={time_range}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        prompts = result.get("data", [])
        
        if prompts:
            print_success(f"获取到 {len(prompts)} 个热门提示词")
            for i, prompt in enumerate(prompts):
                print_info(f"提示词 {i+1}:")
                print_info(f"  ID: {prompt.get('prompt_id')}")
                print_info(f"  标题: {prompt.get('title')}")
                print_info(f"  使用次数: {prompt.get('usage_count')}")
                print_info(f"  创建者: {prompt.get('creator_username')}")
                if prompt.get('average_rating') is not None:
                    print_info(f"  平均评分: {prompt.get('average_rating')}")
            return prompts
        else:
            print_warning("未获取到任何热门提示词")
            return []
    except requests.exceptions.RequestException as e:
        print_error(f"获取热门提示词失败: {str(e)}")
        if hasattr(response, 'text'):
            print_error(f"响应内容: {response.text}")
        return []

def main():
    """主函数"""
    print_header("使用频率统计API测试")
    
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
    
    # 记录不同类型的使用
    usage_types = ["view", "copy", "apply", "fork"]
    for usage_type in usage_types:
        record_usage(token, prompt_id, usage_type)
        time.sleep(0.5)  # 稍作延迟，避免请求过快
    
    # 再次记录一些使用，以便测试统计
    record_usage(token, prompt_id, "view")
    record_usage(token, prompt_id, "copy")
    
    # 获取使用统计
    get_usage_stats(token, prompt_id)
    
    # 获取使用记录
    get_usage_records(token, prompt_id)
    
    # 获取热门提示词
    get_popular_prompts(token)
    
    # 获取最近7天的热门提示词
    get_popular_prompts(token, 7)
    
    print_header("测试完成")

if __name__ == "__main__":
    main()
