from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user, get_current_user_optional
from app.auth.models import User
from app.ratings.schemas import RatingCreate, Rating, RatingResponse
from app.ratings.services import RatingService
from app.auth.utils import is_admin

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("/prompts/{prompt_id}")
async def create_rating(
    prompt_id: UUID, 
    rating: RatingCreate, 
    current_user: User = Depends(get_current_user)
):
    """创建或更新提示词评分"""
    result = await RatingService.create_rating(prompt_id, current_user.id, rating)
    if result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/prompts/{prompt_id}", response_model=RatingResponse)
async def get_prompt_ratings(
    prompt_id: UUID, 
    skip: int = 0, 
    limit: int = 10,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取提示词的评分列表"""
    user_id = current_user.id if current_user else None
    return await RatingService.get_ratings_by_prompt(prompt_id, user_id, skip, limit)

@router.post("/{rating_id}/helpful")
async def mark_helpful(
    rating_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """标记评论为有用"""
    result = await RatingService.mark_helpful(rating_id, current_user.id)
    if result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rating(
    rating_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """删除评论

    普通用户只能删除自己的评论，管理员可以删除任何评论
    """
    # 检查是否是管理员
    user_is_admin = is_admin(current_user)

    result = await RatingService.delete_rating(rating_id, current_user.id, user_is_admin)
    if result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])

    # 成功删除返回204状态码
    return None

