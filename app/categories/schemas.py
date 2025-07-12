from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None

class Category(CategoryBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class CategoryWithChildren(Category):
    children: List['CategoryWithChildren'] = []
    
    class Config:
        orm_mode = True

# 解决循环引用问题
CategoryWithChildren.update_forward_refs()

class CategoryWithPrompts(Category):
    prompt_count: int
    
    class Config:
        orm_mode = True
