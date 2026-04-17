#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
测试统计API的脚本
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

def get_dashboard_stats(token):
    """获取仪表盘统计数据"""
    print_header("获取仪表盘统计数据")
    
    url = f"{BASE_URL}/stats/dashboard"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        stats = response.json()
        
        print_success(f"获取仪表盘统计数据成功")
        print_info(f"提示词总数: {stats.get('total_prompts', 0)}")
        print_info(f"用户总数: {stats.get('total_users', 0)}")
        print_info(f"使用总次数: {stats.get('total_usages', 0)}")
        print_info(f"今日新增提示词: {stats.get('prompts_today', 0)}")
        
        return stats
    except requests.exceptions.RequestException as e:
        print_error(f"获取仪表盘统计数据失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def get_active_users(token, limit=10):
    """获取活跃用户排名"""
    print_header(f"获取活跃用户排名 (limit={limit})")
    
    url = f"{BASE_URL}/stats/active-users?limit={limit}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        users = result.get("data", [])
        
        if users:
            print_success(f"获取到 {len(users)} 个活跃用户")
            for i, user in enumerate(users):
                print_info(f"用户 {i+1}:")
                print_info(f"  ID: {user.get('id')}")
                print_info(f"  用户名: {user.get('username')}")
                print_info(f"  提示词数量: {user.get('prompt_count')}")
        else:
            print_warning("未获取到任何活跃用户")
        
        return users
    except requests.exceptions.RequestException as e:
        print_error(f"获取活跃用户排名失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def get_top_prompts(token, time_range=None, limit=10):
    """获取热门提示词排行"""
    time_range_text = f"time_range={time_range}" if time_range else "所有时间"
    print_header(f"获取热门提示词排行 ({time_range_text}, limit={limit})")
    
    url = f"{BASE_URL}/stats/top-prompts?limit={limit}"
    if time_range:
        url += f"&time_range={time_range}"
    
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
                print_info(f"  ID: {prompt.get('id')}")
                print_info(f"  标题: {prompt.get('title')}")
                print_info(f"  创建者: {prompt.get('creator_name')}")
                print_info(f"  使用次数: {prompt.get('usage_count')}")
        else:
            print_warning("未获取到任何热门提示词")
        
        return prompts
    except requests.exceptions.RequestException as e:
        print_error(f"获取热门提示词排行失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return []

def main():
    """主函数"""
    print_header("统计API测试")
    
    # 登录获取令牌
    token = login()
    
    # 测试获取仪表盘统计数据
    dashboard_stats = get_dashboard_stats(token)
    
    # 测试获取活跃用户排名
    active_users = get_active_users(token, limit=5)
    
    # 测试获取热门提示词排行（所有时间）
    top_prompts_all_time = get_top_prompts(token, limit=5)
    
    # 测试获取热门提示词排行（最近7天）
    top_prompts_7days = get_top_prompts(token, time_range=7, limit=5)
    
    print_header("测试完成")

if __name__ == "__main__":
    main()
