"""
认证相关的工具函数
"""
from app.auth.models import User

def is_admin(user: User) -> bool:
    """
    判断用户是否是管理员
    
    Args:
        user: 用户对象
        
    Returns:
        是否具有管理员权限
    """
    return user.is_superuser if user else False

