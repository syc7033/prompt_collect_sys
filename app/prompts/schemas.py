from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.auth.schemas import User

class PromptBase(BaseModel):
    title: str
    content: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []

class PromptCreate(PromptBase):
    parent_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None  # 添加分类字段

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    category_id: Optional[uuid.UUID] = None  # 添加分类字段

class PromptInDB(PromptBase):
    id: uuid.UUID
    version: int
    parent_id: Optional[uuid.UUID] = None
    creator_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Prompt(PromptInDB):
    creator: User

class PromptHistoryBase(BaseModel):
    prompt_id: uuid.UUID
    snapshot: Dict[str, Any]
    version: int

class PromptHistoryCreate(PromptHistoryBase):
    pass

class PromptHistoryInDB(PromptHistoryBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True

class PromptHistory(PromptHistoryInDB):
    pass

# 用于分页和过滤的模式
class PromptFilter(BaseModel):
    search: Optional[str] = None
    tags: Optional[List[str]] = None
    creator_id: Optional[uuid.UUID] = None

class PaginatedPromptResponse(BaseModel):
    data: List[Prompt]
    total: int
    page: int
    size: int
