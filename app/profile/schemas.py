from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class ProfileStatistics(BaseModel):
    """用户个人统计数据"""
    prompt_count: int = 0  # 创建的提示词数量
    favorite_count: int = 0  # 收藏夹数量
    total_prompt_usage: int = 0  # 提示词被使用总次数
    total_prompt_rating: float = 0  # 提示词平均评分
    
class AvatarUploadResponse(BaseModel):
    """头像上传响应"""
    avatar_url: str
    
class UserPromptListItem(BaseModel):
    """用户创建的提示词列表项"""
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    version: int
    created_at: datetime
    updated_at: datetime
    usage_count: int = 0
    average_rating: float = 0
    
    class Config:
        orm_mode = True
        
class UserFavoriteListItem(BaseModel):
    """用户收藏夹列表项"""
    id: uuid.UUID
    name: str
    created_at: datetime
    prompt_count: int = 0
    
    class Config:
        orm_mode = True
