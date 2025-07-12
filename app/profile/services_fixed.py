from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
import uuid
import logging
import os
from datetime import datetime
from fastapi import UploadFile, HTTPException

from app.auth.models import User
from app.prompts.models import Prompt
from app.favorites.models import Favorite, favorite_prompt
from app.auth.services import AuthService
from app.profile.schemas import ProfileStatistics, UserPromptListItem, UserFavoriteListItem
from app.config import settings

# 配置日志
logger = logging.getLogger(__name__)

class ProfileService:
    @staticmethod
    async def get_user_profile(db: Session, user_id: uuid.UUID):
        """获取用户个人资料"""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 获取用户创建的提示词数量
        prompt_count = db.query(func.count(Prompt.id)).filter(Prompt.creator_id == user_id).scalar()
        
        # 获取用户收藏夹数量
        favorite_count = db.query(func.count(Favorite.id)).filter(Favorite.user_id == user_id).scalar() or 0
        
        # 构建用户资料
        profile = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "website": user.website,
            "location": user.location,
            "profession": user.profession,
            "interests": user.interests,
            "is_superuser": user.is_superuser,
            "created_at": user.created_at,
            "prompt_count": prompt_count,
            "favorite_count": favorite_count
        }
        
        return profile
    
    @staticmethod
    async def update_user_profile(db: Session, user_id: uuid.UUID, profile_data: dict):
        """更新用户个人资料"""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 更新用户属性
        for field, value in profile_data.items():
            if hasattr(user, field) and field not in ["id", "email", "username", "is_superuser", "created_at", "updated_at"]:
                setattr(user, field, value)
        
        # 保存到数据库
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return await ProfileService.get_user_profile(db, user_id)
    
    @staticmethod
    async def upload_avatar(db: Session, user_id: uuid.UUID, file: UploadFile):
        """上传用户头像"""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 检查文件类型
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="只能上传图片文件")
        
        # 创建上传目录
        upload_dir = os.path.join("static", "avatars")
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{user_id}_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # 保存文件
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 更新用户头像URL
        avatar_url = f"/static/avatars/{filename}"
        user.avatar_url = avatar_url
        db.add(user)
        db.commit()
        
        return {"avatar_url": avatar_url}
    
    @staticmethod
    async def get_user_statistics(db: Session, user_id: uuid.UUID) -> ProfileStatistics:
        """获取用户统计数据"""
        # 获取用户创建的提示词数量
        prompt_count = db.query(func.count(Prompt.id)).filter(Prompt.creator_id == user_id).scalar()
        
        # 获取用户收藏夹数量
        favorite_count = db.query(func.count(Favorite.id)).filter(Favorite.user_id == user_id).scalar() or 0
        
        # 获取用户提示词被使用的总次数
        # 注意：这里可能需要导入Usage模型，但由于我们没有看到它的定义，暂时使用固定值
        total_usage = 0  # 临时使用固定值
        
        # 获取用户提示词的平均评分
        avg_rating = db.query(func.avg(Prompt.average_rating)).filter(
            Prompt.creator_id == user_id,
            Prompt.rating_count > 0
        ).scalar() or 0.0
        
        return ProfileStatistics(
            prompt_count=prompt_count,
            favorite_count=favorite_count,
            total_prompt_usage=total_usage,
            total_prompt_rating=round(avg_rating, 1)
        )
    
    @staticmethod
    async def get_user_prompts(
        db: Session, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[UserPromptListItem]:
        """获取用户创建的提示词列表"""
        # 构建排序条件
        if sort_order.lower() == "asc":
            order_by = getattr(Prompt, sort_by)
        else:
            order_by = desc(getattr(Prompt, sort_by))
        
        # 查询用户创建的提示词
        prompts = db.query(Prompt).filter(
            Prompt.creator_id == user_id
        ).order_by(order_by).offset(skip).limit(limit).all()
        
        return [UserPromptListItem.from_orm(prompt) for prompt in prompts]
    
    @staticmethod
    async def get_user_favorites(
        db: Session, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 10
    ) -> List[UserFavoriteListItem]:
        """获取用户收藏夹列表"""
        # 查询用户的收藏夹
        favorites = db.query(Favorite).filter(
            Favorite.user_id == user_id
        ).order_by(desc(Favorite.created_at)).offset(skip).limit(limit).all()
        
        result = []
        for fav in favorites:
            # 获取收藏夹中的提示词数量
            prompt_count = db.query(func.count(favorite_prompt.c.prompt_id)).filter(
                favorite_prompt.c.favorite_id == fav.id
            ).scalar() or 0
            
            result.append(UserFavoriteListItem(
                id=fav.id,
                name=fav.name,
                created_at=fav.created_at,
                prompt_count=prompt_count
            ))
        
        return result
