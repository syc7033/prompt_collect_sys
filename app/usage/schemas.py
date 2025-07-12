from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class UsageBase(BaseModel):
    usage_type: str
    
class UsageCreate(UsageBase):
    pass

class Usage(UsageBase):
    id: UUID
    prompt_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class UsageCount(BaseModel):
    prompt_id: UUID
    count: int
    
class UsageResponse(BaseModel):
    data: List[Usage]
    total: int
    page: int
    size: int
    
class PromptUsageStats(BaseModel):
    prompt_id: UUID
    total_usages: int
    copy_count: int
    apply_count: int
    view_count: int
    fork_count: int
    
class PopularPrompt(BaseModel):
    prompt_id: UUID
    title: str
    description: Optional[str]
    usage_count: int
    creator_username: str
    average_rating: Optional[float]
    rating_count: Optional[int]
    
class PopularPromptsResponse(BaseModel):
    data: List[PopularPrompt]
    total: int
    page: int
    size: int
