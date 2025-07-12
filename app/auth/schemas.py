from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    invite_code: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    
    # 个人资料字段
    avatar_url: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    profession: Optional[str] = None
    interests: Optional[str] = None

class UserInDB(UserBase):
    id: uuid.UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    # 个人资料字段
    avatar_url: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    profession: Optional[str] = None
    interests: Optional[str] = None

    class Config:
        orm_mode = True

class User(UserInDB):
    pass


class UserProfile(BaseModel):
    """用户个人资料，用于前端展示"""
    id: uuid.UUID
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    profession: Optional[str] = None
    interests: Optional[str] = None
    is_superuser: bool
    created_at: datetime
    prompt_count: int = 0
    favorite_count: int = 0
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    exp: int

class ChangePasswordRequest(BaseModel):
    """修改密码请求模型"""
    old_password: str
    new_password: str
