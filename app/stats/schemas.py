from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class DashboardStats(BaseModel):
    """仪表盘统计数据"""
    total_prompts: int
    total_users: int
    total_usages: int
    prompts_today: int

class ActiveUser(BaseModel):
    """活跃用户信息"""
    id: uuid.UUID
    username: str
    prompt_count: int
    avatar: Optional[str] = None
    
class ActiveUsersResponse(BaseModel):
    """活跃用户响应"""
    data: List[ActiveUser]
    total: int
    
class PopularPrompt(BaseModel):
    """热门提示词信息"""
    id: uuid.UUID
    title: str
    description: str
    usage_count: int
    creator_name: str
    creator_id: uuid.UUID
    
class PopularPromptsResponse(BaseModel):
    """热门提示词响应"""
    data: List[PopularPrompt]
    total: int
