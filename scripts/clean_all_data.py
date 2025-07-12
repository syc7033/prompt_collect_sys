#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
清理系统数据的脚本：删除所有提示词、分类和相关数据
"""

import requests
import json
import sys
import time
from typing import Dict, Optional, List, Any, Tuple

# 配置
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # 请替换为实际用户名
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

def print_header(text: str) -> None:
    """打印带格式的标题"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(50)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}\n")

def print_success(text: str) -> None:
    """打印成功信息"""
    print(f"{Colors.OKGREEN}[成功] {text}{Colors.ENDC}")

def print_error(text: str) -> None:
    """打印错误信息"""
    print(f"{Colors.FAIL}[错误] {text}{Colors.ENDC}")

def print_warning(text: str) -> None:
    """打印警告信息"""
    print(f"{Colors.WARNING}[警告] {text}{Colors.ENDC}")

def print_info(text: str) -> None:
    """打印普通信息"""
    print(f"{Colors.OKBLUE}[信息] {text}{Colors.ENDC}")

def login() -> Optional[str]:
    """登录并获取访问令牌"""
    print_header("登录系统")
    
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if access_token:
            print_success("登录成功")
            return access_token
        else:
            print_error("登录成功但未获取到访问令牌")
            return None
    except requests.exceptions.RequestException as e:
        print_error(f"登录失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return None

def get_headers(token: str) -> Dict[str, str]:
    """获取请求头"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def confirm_action(message: str) -> bool:
    """请求用户确认操作"""
    print_warning(message)
    confirmation = input("\n请输入 'YES' 确认操作 (输入其他内容将取消操作): ").strip()
    return confirmation == "YES"

def delete_all_prompts(token: str) -> Tuple[int, int]:
    """删除所有提示词，返回成功和失败的数量"""
    print_header("删除所有提示词")
    
    success_count = 0
    fail_count = 0
    
    try:
        # 获取所有提示词
        response = requests.get(f"{BASE_URL}/prompts", headers=get_headers(token))
        response.raise_for_status()
        
        response_data = response.json()
        # 检查响应格式，处理可能的分页结构
        prompts = response_data.get('data', []) if isinstance(response_data, dict) else response_data
        
        if not prompts:
            print_info("没有找到任何提示词")
            return success_count, fail_count
            
        print_info(f"找到 {len(prompts)} 个提示词")
        
        # 删除每个提示词
        for prompt in prompts:
            try:
                # 确保prompt是字典类型
                if isinstance(prompt, str):
                    prompt_id = prompt
                    title = "未知标题"
                else:
                    prompt_id = prompt.get('id')
                    title = prompt.get('title', '未知标题')
                
                if not prompt_id:
                    print_warning(f"跳过提示词: {title} (没有ID)")
                    continue
                    
                response = requests.delete(
                    f"{BASE_URL}/prompts/{prompt_id}",
                    headers=get_headers(token)
                )
                response.raise_for_status()
                
                print_success(f"已删除提示词: {title}")
                success_count += 1
                time.sleep(0.2)  # 添加延迟避免请求过快
                
            except requests.exceptions.RequestException as e:
                fail_count += 1
                print_error(f"删除提示词失败: {title}")
                
                # 检查是否是权限问题
                if hasattr(e, 'response') and e.response and e.response.status_code == 403:
                    print_warning(f"权限不足，无法删除提示词: {title}")
                else:
                    print_error(f"错误信息: {str(e)}")
                    if hasattr(e, 'response') and e.response:
                        print_error(f"响应内容: {e.response.text}")
                
                # 继续处理下一个提示词，而不是中止
                continue
                
        return success_count, fail_count
        
    except requests.exceptions.RequestException as e:
        print_error(f"获取提示词列表失败: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print_error(f"响应内容: {e.response.text}")
        return success_count, fail_count

def main():
    """主函数"""
    print_header("AI提示词知识库系统 - 数据清理工具")
    
    print_warning("此操作将删除系统中的所有数据，包括：")
    print_warning("1. 所有提示词")
    print_warning("2. 所有分类")
    print_warning("3. 所有相关的使用记录和统计数据")
    print_warning("\n此操作不可逆，请谨慎操作！")
    
    # 第一次确认
    if not confirm_action("您确定要删除所有数据吗？"):
        print_info("操作已取消")
        return
    
    # 第二次确认
    if not confirm_action("最后确认：此操作将永久删除所有数据，确定要继续吗？"):
        print_info("操作已取消")
        return
    
    # 登录获取令牌
    token = login()
    if not token:
        print_error("登录失败，无法继续操作")
        return
    
    print_info("\n开始清理数据...")
    
    # 删除提示词
    prompt_success, prompt_fail = delete_all_prompts(token)
    print_info(f"提示词删除结果: 成功 {prompt_success} 个, 失败 {prompt_fail} 个")
    
    # 总结
    print_header("清理结果")
    print_info(f"提示词: 成功删除 {prompt_success} 个, 失败 {prompt_fail} 个")
    if prompt_fail == 0 and category_fail == 0:
        print_success("所有数据已成功清理！")
    else:
        print_warning(f"部分数据清理失败，可能是由于权限不足或其他原因")
        print_warning(f"您可能需要使用管理员账户来完成剩余的清理工作")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_warning("\n操作被用户中断")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n发生未知错误: {str(e)}")
        sys.exit(1)
