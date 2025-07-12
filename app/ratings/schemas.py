from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, UUID4

class RatingBase(BaseModel):
    score: int
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    pass

class RatingUpdate(BaseModel):
    score: Optional[int] = None
    comment: Optional[str] = None

class HelpfulMarkBase(BaseModel):
    rating_id: UUID4

class HelpfulMarkCreate(HelpfulMarkBase):
    pass

class HelpfulMarkInDB(HelpfulMarkBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    
    class Config:
        orm_mode = True

class RatingInDB(RatingBase):
    id: UUID4
    prompt_id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Rating(RatingInDB):
    user_username: str
    helpful_count: int = 0
    is_helpful: bool = False  # 当前用户是否标记为有用
    
    class Config:
        orm_mode = True

class RatingResponse(BaseModel):
    data: List[Rating]
    total: int
    page: int
    size: int
