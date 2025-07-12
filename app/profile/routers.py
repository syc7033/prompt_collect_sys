from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.auth.schemas import UserProfile, UserUpdate
from app.profile.schemas import ProfileStatistics, UserPromptListItem, UserFavoriteListItem
from app.profile.services import ProfileService

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的个人资料"""
    return await ProfileService.get_user_profile(db, current_user.id)

@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户的个人资料"""
    return await ProfileService.update_user_profile(db, current_user.id, profile_data.dict(exclude_unset=True))

@router.post("/avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    return await ProfileService.upload_avatar(db, current_user.id, file)

@router.get("/statistics", response_model=ProfileStatistics)
async def get_my_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的统计数据"""
    return await ProfileService.get_user_statistics(db, current_user.id)

@router.get("/prompts")
async def get_my_prompts(
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=100),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|title|average_rating)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户创建的提示词列表"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"开始获取用户 {current_user.id} 的提示词列表，参数: skip={skip}, limit={limit}, sort_by={sort_by}, sort_order={sort_order}")
        
        # 先获取总数，避免在获取列表出错时无法返回数据
        total = await ProfileService.count_user_prompts(db, current_user.id)
        logger.info(f"用户 {current_user.id} 的提示词总数: {total}")
        
        # 如果总数为0，直接返回空列表
        if total == 0:
            return {"items": [], "total": 0}
        
        # 获取提示词列表
        items = await ProfileService.get_user_prompts(
            db, current_user.id, skip, limit, sort_by, sort_order
        )
        logger.info(f"获取到用户 {current_user.id} 的提示词列表: {len(items)} 条记录")
        
        return {"items": items, "total": total}
    except Exception as e:
        logger.error(f"获取用户提示词列表出错: {str(e)}")
        # 返回空列表而不是抛出异常，避免500错误
        return {"items": [], "total": 0, "error": str(e)}

@router.get("/favorites", response_model=List[UserFavoriteListItem])
async def get_my_favorites(
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的收藏夹列表"""
    return await ProfileService.get_user_favorites(
        db, current_user.id, skip, limit
    )
