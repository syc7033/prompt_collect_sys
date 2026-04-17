import requests
import json
import sys
from pprint import pprint

# 配置
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # 替换为您的测试用户名
PASSWORD = "123456"  # 替换为您的测试密码

# 颜色输出
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(50)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}! {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKBLUE}ℹ {text}{Colors.ENDC}")

def print_json(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))

def login():
    """登录并获取访问令牌"""
    print_header("测试登录")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": USERNAME, "password": PASSWORD}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print_success(f"登录成功，获取到访问令牌")
                return token
            else:
                print_error(f"登录响应中没有访问令牌")
                return None
        else:
            print_error(f"登录失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"登录过程中发生异常: {str(e)}")
        return None

def test_get_profile(token):
    """测试获取个人资料"""
    print_header("测试获取个人资料")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/profile/me", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print_success("获取个人资料成功")
            print_info("个人资料内容:")
            print_json(data)
            
            # 检查是否包含新增的个人资料字段
            new_fields = ["avatar_url", "display_name", "bio", "website", 
                          "location", "profession", "interests"]
            missing_fields = [field for field in new_fields if field not in data]
            
            if missing_fields:
                print_warning(f"缺少以下个人资料字段: {', '.join(missing_fields)}")
            else:
                print_success("所有新增个人资料字段都存在")
                
            return data
        else:
            print_error(f"获取个人资料失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"获取个人资料过程中发生异常: {str(e)}")
        return None

def test_update_profile(token):
    """测试更新个人资料"""
    print_header("测试更新个人资料")
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 更新数据
        update_data = {
            "display_name": "测试用户",
            "bio": "这是一个测试用户的个人简介",
            "location": "北京",
            "profession": "软件开发工程师",
            "interests": "AI,编程,设计"
        }
        
        response = requests.put(
            f"{BASE_URL}/profile/me", 
            headers=headers,
            json=update_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("更新个人资料成功")
            print_info("更新后的个人资料:")
            print_json(data)
            
            # 验证字段是否正确更新
            for key, value in update_data.items():
                if data.get(key) == value:
                    print_success(f"字段 {key} 更新成功")
                else:
                    print_error(f"字段 {key} 更新失败，期望值: {value}，实际值: {data.get(key)}")
            
            return data
        else:
            print_error(f"更新个人资料失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"更新个人资料过程中发生异常: {str(e)}")
        return None

def test_get_statistics(token):
    """测试获取统计数据"""
    print_header("测试获取统计数据")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/profile/statistics", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print_success("获取统计数据成功")
            print_info("统计数据内容:")
            print_json(data)
            
            # 检查是否包含所有统计字段
            stat_fields = ["prompt_count", "favorite_count", 
                           "total_prompt_usage", "total_prompt_rating"]
            missing_fields = [field for field in stat_fields if field not in data]
            
            if missing_fields:
                print_warning(f"缺少以下统计字段: {', '.join(missing_fields)}")
            else:
                print_success("所有统计字段都存在")
                
            return data
        else:
            print_error(f"获取统计数据失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"获取统计数据过程中发生异常: {str(e)}")
        return None

def test_get_prompts(token):
    """测试获取我的提示词"""
    print_header("测试获取我的提示词")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/profile/prompts", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"获取我的提示词成功，共 {len(data)} 条")
            
            if data:
                print_info("第一条提示词内容:")
                print_json(data[0])
                
                # 检查是否包含所有必要字段
                prompt_fields = ["id", "title", "description", "tags", 
                                "version", "created_at", "updated_at"]
                missing_fields = [field for field in prompt_fields if field not in data[0]]
                
                if missing_fields:
                    print_warning(f"提示词缺少以下字段: {', '.join(missing_fields)}")
                else:
                    print_success("提示词包含所有必要字段")
            
            return data
        else:
            print_error(f"获取我的提示词失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"获取我的提示词过程中发生异常: {str(e)}")
        return None

def test_get_favorites(token):
    """测试获取我的收藏夹"""
    print_header("测试获取我的收藏夹")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/profile/favorites", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"获取我的收藏夹成功，共 {len(data)} 个")
            
            if data:
                print_info("第一个收藏夹内容:")
                print_json(data[0])
                
                # 检查是否包含所有必要字段
                favorite_fields = ["id", "name", "created_at", "prompt_count"]
                missing_fields = [field for field in favorite_fields if field not in data[0]]
                
                if missing_fields:
                    print_warning(f"收藏夹缺少以下字段: {', '.join(missing_fields)}")
                else:
                    print_success("收藏夹包含所有必要字段")
            
            return data
        else:
            print_error(f"获取我的收藏夹失败，状态码: {response.status_code}")
            print_json(response.json())
            return None
    except Exception as e:
        print_error(f"获取我的收藏夹过程中发生异常: {str(e)}")
        return None

def main():
    print_header("个人中心API测试")
    
    # 1. 登录
    token = login()
    if not token:
        print_error("登录失败，无法继续测试")
        sys.exit(1)
    
    # 2. 获取个人资料
    profile = test_get_profile(token)
    
    # 3. 更新个人资料
    updated_profile = test_update_profile(token)
    
    # 4. 获取统计数据
    stats = test_get_statistics(token)
    
    # 5. 获取我的提示词
    prompts = test_get_prompts(token)
    
    # 6. 获取我的收藏夹
    favorites = test_get_favorites(token)
    
    # 总结测试结果
    print_header("测试结果总结")
    
    tests = [
        ("登录", token is not None),
        ("获取个人资料", profile is not None),
        ("更新个人资料", updated_profile is not None),
        ("获取统计数据", stats is not None),
        ("获取我的提示词", prompts is not None),
        ("获取我的收藏夹", favorites is not None)
    ]
    
    success_count = sum(1 for _, success in tests if success)
    
    for name, success in tests:
        if success:
            print_success(f"{name}: 成功")
        else:
            print_error(f"{name}: 失败")
    
    print(f"\n总计: {success_count}/{len(tests)} 测试通过")

if __name__ == "__main__":
    main()
