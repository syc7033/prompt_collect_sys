from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.favorites.schemas import Favorite, FavoriteCreate, FavoriteUpdate, FavoriteWithPrompts
from app.favorites.services import FavoriteService
from app.prompts.schemas import Prompt

router = APIRouter(
    prefix="/favorites",
    tags=["favorites"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Favorite])
async def get_favorites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的所有收藏夹"""
    return FavoriteService.get_favorites(db, current_user.id, skip, limit)

@router.post("/", response_model=Favorite, status_code=status.HTTP_201_CREATED)
async def create_favorite(
    favorite: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新收藏夹"""
    return FavoriteService.create_favorite(db, favorite, current_user.id)

@router.get("/{favorite_id}", response_model=FavoriteWithPrompts)
async def get_favorite(
    favorite_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取特定收藏夹及其包含的提示词"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this favorite")
    
    return favorite

@router.put("/{favorite_id}", response_model=Favorite)
async def update_favorite(
    favorite_id: uuid.UUID,
    favorite: FavoriteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新收藏夹信息"""
    db_favorite = FavoriteService.get_favorite(db, favorite_id)
    if db_favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if db_favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this favorite")
    
    return FavoriteService.update_favorite(db, favorite_id, favorite)

@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite(
    favorite_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除收藏夹"""
    db_favorite = FavoriteService.get_favorite(db, favorite_id)
    if db_favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if db_favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this favorite")
    
    FavoriteService.delete_favorite(db, favorite_id)
    return {"status": "success"}

@router.post("/{favorite_id}/prompts/{prompt_id}", status_code=status.HTTP_200_OK)
async def add_prompt_to_favorite(
    favorite_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """将提示词添加到收藏夹"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this favorite")
    
    success = FavoriteService.add_prompt_to_favorite(db, favorite_id, prompt_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add prompt to favorite")
    
    return {"status": "success"}

@router.delete("/{favorite_id}/prompts/{prompt_id}", status_code=status.HTTP_200_OK)
async def remove_prompt_from_favorite(
    favorite_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """从收藏夹中移除提示词"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this favorite")
    
    success = FavoriteService.remove_prompt_from_favorite(db, favorite_id, prompt_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove prompt from favorite")
    
    return {"status": "success"}

@router.get("/{favorite_id}/prompts", response_model=List[Prompt])
async def get_prompts_in_favorite(
    favorite_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取收藏夹中的所有提示词"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this favorite")
    
    return FavoriteService.get_prompts_in_favorite(db, favorite_id, skip, limit)

@router.get("/{favorite_id}/prompts/{prompt_id}/check", response_model=dict)
async def check_prompt_in_favorite(
    favorite_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """检查提示词是否在收藏夹中"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this favorite")
    
    is_in_favorite = FavoriteService.is_prompt_in_favorite(db, favorite_id, prompt_id)
    return {"is_in_favorite": is_in_favorite}

@router.get("/{favorite_id}/prompts/{prompt_id}", response_model=Prompt)
async def get_prompt_in_favorite(
    favorite_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取收藏夹中特定提示词的详细信息"""
    favorite = FavoriteService.get_favorite(db, favorite_id)
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # 检查收藏夹是否属于当前用户
    if favorite.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this favorite")
    
    # 检查提示词是否在收藏夹中
    is_in_favorite = FavoriteService.is_prompt_in_favorite(db, favorite_id, prompt_id)
    if not is_in_favorite:
        raise HTTPException(status_code=404, detail="Prompt not found in favorite")
    
    # 获取提示词详细信息
    prompt = FavoriteService.get_prompt_in_favorite(db, favorite_id, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return prompt
