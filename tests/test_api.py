import requests
import json
import uuid
from pprint import pprint
import time

# API基础URL
BASE_URL = "http://10.12.36.184:8000"

# 测试用户信息
TEST_USER = {
    "email": f"test_{int(time.time())}@example.com",  # 使用时间戳确保邮箱唯一
    "username": f"testuser_{int(time.time())}",       # 使用时间戳确保用户名唯一
    "password": "password123"
}

# 测试提示词信息
TEST_PROMPT = {
    "title": "测试提示词",
    "content": "这是一个用于测试API的提示词",
    "description": "这是提示词的描述",
    "tags": ["测试", "API"]
}

# 存储测试过程中创建的资源ID
created_resources = {
    "user_id": None,
    "prompt_id": None,
    "access_token": None
}

def print_section(title):
    """打印分节标题"""
    print("\n" + "=" * 50)
    print(f" {title} ".center(50, "="))
    print("=" * 50 + "\n")

def print_response(response, description=""):
    """打印响应信息"""
    print(f"{description} - 状态码: {response.status_code}")
    try:
        pprint(response.json())
    except:
        print(response.text)
    print()

def test_health_check():
    """测试健康检查API"""
    print_section("测试健康检查API")
    
    response = requests.get(f"{BASE_URL}/api/health")
    print_response(response, "健康检查响应")
    
    return response.status_code == 200

def test_user_registration():
    """测试用户注册API"""
    print_section("测试用户注册API")
    
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=TEST_USER
    )
    print_response(response, "用户注册响应")
    
    if response.status_code == 201:
        created_resources["user_id"] = response.json().get("id")
        return True
    return False

def test_user_login():
    """测试用户登录API"""
    print_section("测试用户登录API")
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }
    )
    print_response(response, "用户登录响应")
    
    if response.status_code == 200:
        created_resources["access_token"] = response.json().get("access_token")
        return True
    return False

def get_auth_headers():
    """获取认证头信息"""
    return {
        "Authorization": f"Bearer {created_resources['access_token']}"
    }

def test_get_current_user():
    """测试获取当前用户信息API"""
    print_section("测试获取当前用户信息API")
    
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers=get_auth_headers()
    )
    print_response(response, "获取当前用户信息响应")
    
    return response.status_code == 200

def test_create_prompt():
    """测试创建提示词API"""
    print_section("测试创建提示词API")
    
    response = requests.post(
        f"{BASE_URL}/api/prompts",
        json=TEST_PROMPT,
        headers=get_auth_headers()
    )
    print_response(response, "创建提示词响应")
    
    if response.status_code == 201:
        created_resources["prompt_id"] = response.json().get("id")
        return True
    return False

def test_get_prompts():
    """测试获取提示词列表API"""
    print_section("测试获取提示词列表API")
    
    response = requests.get(
        f"{BASE_URL}/api/prompts",
        headers=get_auth_headers()
    )
    print_response(response, "获取提示词列表响应")
    
    return response.status_code == 200

def test_get_prompt_by_id():
    """测试通过ID获取提示词API"""
    print_section("测试通过ID获取提示词API")
    
    response = requests.get(
        f"{BASE_URL}/api/prompts/{created_resources['prompt_id']}",
        headers=get_auth_headers()
    )
    print_response(response, "通过ID获取提示词响应")
    
    return response.status_code == 200

def test_update_prompt():
    """测试更新提示词API"""
    print_section("测试更新提示词API")
    
    updated_prompt = {
        "title": "更新后的测试提示词",
        "description": "这是更新后的提示词描述"
    }
    
    response = requests.put(
        f"{BASE_URL}/api/prompts/{created_resources['prompt_id']}",
        json=updated_prompt,
        headers=get_auth_headers()
    )
    print_response(response, "更新提示词响应")
    
    return response.status_code == 200

def test_prompt_histories():
    """测试获取提示词历史记录API"""
    print_section("测试获取提示词历史记录API")
    
    response = requests.get(
        f"{BASE_URL}/api/prompts/{created_resources['prompt_id']}/histories",
        headers=get_auth_headers()
    )
    print_response(response, "获取提示词历史记录响应")
    
    return response.status_code == 200

def test_fork_prompt():
    """测试Fork提示词API"""
    print_section("测试Fork提示词API")
    
    response = requests.post(
        f"{BASE_URL}/api/prompts/{created_resources['prompt_id']}/fork",
        headers=get_auth_headers()
    )
    print_response(response, "Fork提示词响应")
    
    return response.status_code == 201

def test_search_prompts():
    """测试搜索提示词API"""
    print_section("测试搜索提示词API")
    
    response = requests.get(
        f"{BASE_URL}/api/search/prompts?q=测试",
        headers=get_auth_headers()
    )
    print_response(response, "搜索提示词响应")
    
    return response.status_code == 200

def test_get_popular_tags():
    """测试获取热门标签API"""
    print_section("测试获取热门标签API")
    
    response = requests.get(
        f"{BASE_URL}/api/search/tags/popular",
        headers=get_auth_headers()
    )
    print_response(response, "获取热门标签响应")
    
    return response.status_code == 200

def test_get_similar_prompts():
    """测试获取相似提示词API"""
    print_section("测试获取相似提示词API")
    
    response = requests.get(
        f"{BASE_URL}/api/search/prompts/{created_resources['prompt_id']}/similar",
        headers=get_auth_headers()
    )
    print_response(response, "获取相似提示词响应")
    
    return response.status_code == 200

def test_delete_prompt():
    """测试删除提示词API"""
    print_section("测试删除提示词API")
    
    response = requests.delete(
        f"{BASE_URL}/api/prompts/{created_resources['prompt_id']}",
        headers=get_auth_headers()
    )
    print_response(response, "删除提示词响应")
    
    return response.status_code == 204

def run_all_tests():
    """运行所有测试"""
    tests = [
        ("健康检查", test_health_check),
        ("用户注册", test_user_registration),
        ("用户登录", test_user_login),
        ("获取当前用户信息", test_get_current_user),
        ("创建提示词", test_create_prompt),
        ("获取提示词列表", test_get_prompts),
        ("通过ID获取提示词", test_get_prompt_by_id),
        ("更新提示词", test_update_prompt),
        ("获取提示词历史记录", test_prompt_histories),
        ("Fork提示词", test_fork_prompt),
        ("搜索提示词", test_search_prompts),
        ("获取热门标签", test_get_popular_tags),
        ("获取相似提示词", test_get_similar_prompts),
        ("删除提示词", test_delete_prompt)
    ]
    
    results = {}
    
    for name, test_func in tests:
        try:
            success = test_func()
            results[name] = "成功" if success else "失败"
        except Exception as e:
            print(f"测试过程中出错: {e}")
            results[name] = f"错误: {str(e)}"
    
    print_section("测试结果汇总")
    for name, result in results.items():
        print(f"{name}: {result}")

if __name__ == "__main__":
    run_all_tests()
