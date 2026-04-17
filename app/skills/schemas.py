from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from app.auth.schemas import User


class SkillPromptBase(BaseModel):
    prompt_id: uuid.UUID
    order_index: int = 0
    role: str = "instruction"


class SkillPromptCreate(SkillPromptBase):
    pass


class SkillPromptInDB(SkillPromptBase):
    id: uuid.UUID
    skill_id: uuid.UUID

    class Config:
        orm_mode = True


class SkillPromptDetail(SkillPromptInDB):
    prompt: Optional[dict] = None


class SkillBase(BaseModel):
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    target_tools: Optional[List[str]] = []
    is_public: bool = True
    category_id: Optional[uuid.UUID] = None


class SkillCreate(SkillBase):
    skill_prompts: List[SkillPromptCreate] = []


class SkillUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    target_tools: Optional[List[str]] = None
    is_public: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None
    skill_prompts: Optional[List[SkillPromptCreate]] = None


class SkillInDB(SkillBase):
    id: uuid.UUID
    author_id: uuid.UUID
    fork_from: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Skill(SkillInDB):
    author: User
    skill_prompts: List[SkillPromptInDB] = []


class SkillFilter(BaseModel):
    search: Optional[str] = None
    tags: Optional[List[str]] = None
    target_tools: Optional[List[str]] = None
    author_id: Optional[uuid.UUID] = None


class PaginatedSkillResponse(BaseModel):
    data: List[Skill]
    total: int
    page: int
    size: int
