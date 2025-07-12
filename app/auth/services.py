from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional
import uuid
import logging

# 配置日志
logger = logging.getLogger(__name__)

from app.auth.models import User
from app.auth.schemas import UserCreate, UserUpdate
from app.config import settings

# 密码上下文，用于密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        验证密码
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        获取密码哈希
        """
        return pwd_context.hash(password)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        通过邮箱获取用户
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """
        通过用户名获取用户
        """
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """
        通过ID获取用户
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """
        认证用户
        """
        user = AuthService.get_user_by_username(db, username)
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        """
        创建用户
        """
        # 检查邮箱是否已存在
        if AuthService.get_user_by_email(db, user_in.email):
            raise ValueError("邮箱已被注册")
        
        # 检查用户名是否已存在
        if AuthService.get_user_by_username(db, user_in.username):
            raise ValueError("用户名已被使用")
        
        # 不再通过邀请码设置管理员权限
        is_superuser = False
        
        # 邀请码功能已移除，记录任何尝试使用邀请码的情况
        if user_in.invite_code:
            logger.info(f"用户 {user_in.username} 尝试使用邀请码: {user_in.invite_code}，但邀请码功能已禁用")
            # 不再验证邀请码有效性，也不再设置管理员权限
        
        # 创建用户对象
        db_user = User(
            email=user_in.email,
            username=user_in.username,
            hashed_password=AuthService.get_password_hash(user_in.password),
            is_superuser=is_superuser
        )
        
        # 保存到数据库
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user

    @staticmethod
    def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
        """
        更新用户信息
        """
        # 更新用户属性
        update_data = user_in.dict(exclude_unset=True)
        
        # 如果更新包含密码，则哈希处理
        if "password" in update_data:
            update_data["hashed_password"] = AuthService.get_password_hash(update_data.pop("password"))
        
        # 更新用户对象的属性
        for field, value in update_data.items():
            setattr(user, field, value)
        
        # 保存到数据库
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
        
    @staticmethod
    def change_password(db: Session, user: User, old_password: str, new_password: str) -> User:
        """
        修改用户密码
        """
        # 验证旧密码
        if not AuthService.verify_password(old_password, user.hashed_password):
            raise ValueError("旧密码不正确")
        
        # 验证新密码不能与旧密码相同
        if old_password == new_password:
            raise ValueError("新密码不能与旧密码相同")
            
        # 验证新密码长度
        if len(new_password) < 6:
            raise ValueError("密码长度不能小于6个字符")
        
        # 更新密码
        user.hashed_password = AuthService.get_password_hash(new_password)
        
        # 保存到数据库
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
