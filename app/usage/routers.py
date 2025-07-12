from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.auth.dependencies import get_current_user, get_current_user_optional
from app.auth.models import User
from app.usage.schemas import UsageResponse, PopularPromptsResponse
from app.usage.services import UsageService

router = APIRouter(prefix="/usage", tags=["使用统计"])

@router.post("/prompts/{prompt_id}/{usage_type}")
async def record_usage(
    prompt_id: UUID, 
    usage_type: str,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    记录提示词使用情况
    
    - **prompt_id**: 提示词ID
    - **usage_type**: 使用类型 (copy, apply, view, fork)
    """
    user_id = current_user.id if current_user else None
    result = await UsageService.record_usage(prompt_id, user_id, usage_type)
    
    if result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    
    return result

@router.get("/prompts/{prompt_id}/stats")
async def get_prompt_usage_stats(
    prompt_id: UUID,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取提示词的使用统计数据
    
    - **prompt_id**: 提示词ID
    """
    result = await UsageService.get_prompt_usage_stats(prompt_id)
    
    if result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    
    return result

@router.get("/prompts/{prompt_id}", response_model=UsageResponse)
async def get_usage_by_prompt(
    prompt_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取提示词的使用记录
    
    - **prompt_id**: 提示词ID
    - **skip**: 跳过的记录数
    - **limit**: 返回的记录数
    """
    return await UsageService.get_usage_by_prompt(prompt_id, skip, limit)

@router.get("/popular", response_model=PopularPromptsResponse)
async def get_popular_prompts(
    time_range: Optional[int] = Query(None, description="时间范围（天）"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取热门提示词
    
    - **time_range**: 时间范围（天），例如7表示最近7天
    - **skip**: 跳过的记录数
    - **limit**: 返回的记录数
    """
    return await UsageService.get_popular_prompts(time_range, skip, limit)
