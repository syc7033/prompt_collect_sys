from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user_optional
from app.auth.models import User
from app.prompts.schemas import Prompt, PaginatedPromptResponse
from app.search.services import SearchService

router = APIRouter()

@router.get("/prompts", response_model=PaginatedPromptResponse)
async def search_prompts(
    q: str = "",  # 将q参数设置为可选，默认为空字符串
    tags: Optional[List[str]] = Query(None),
    creator_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    搜索提示词
    """
    result = SearchService.search_prompts(db, q, tags, creator_id, skip, limit)
    return result

@router.get("/tags/popular", response_model=List[dict])
async def get_popular_tags(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取热门标签
    """
    return SearchService.get_popular_tags(db, limit)

@router.get("/prompts/{prompt_id}/similar", response_model=List[Prompt])
async def get_similar_prompts(
    prompt_id: uuid.UUID,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取相似的提示词
    """
    return SearchService.get_similar_prompts(db, prompt_id, limit)
