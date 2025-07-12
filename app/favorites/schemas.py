from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

from app.prompts.schemas import Prompt

class FavoriteBase(BaseModel):
    name: str

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteUpdate(BaseModel):
    name: Optional[str] = None

class Favorite(FavoriteBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class FavoriteWithPrompts(Favorite):
    prompts: List[Prompt] = []
    
    class Config:
        orm_mode = True
