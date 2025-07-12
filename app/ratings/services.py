from typing import List, Dict, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.database import get_db
from app.ratings.repositories import RatingRepository, HelpfulMarkRepository
from app.ratings.schemas import RatingCreate, Rating, RatingResponse
from app.auth.models import User

class RatingService:
    @staticmethod
    async def create_rating(prompt_id: UUID, user_id: UUID, rating_data: RatingCreate) -> Dict[str, Any]:
        """创建或更新评分"""
        db = next(get_db())
        
        # 验证评分范围
        if rating_data.score < 1 or rating_data.score > 5:
            return {"status": "error", "message": "评分必须在1到5之间"}
        
        # 创建或更新评分
        rating_model = await RatingRepository.create(db, prompt_id, user_id, rating_data)
        
        # 更新提示词的平均评分和评分数量
        await RatingRepository.update_prompt_rating_stats(db, prompt_id)
        
        # 将SQLAlchemy模型转换为字典
        rating = {
            "id": rating_model.id,
            "prompt_id": rating_model.prompt_id,
            "user_id": rating_model.user_id,
            "score": rating_model.score,
            "comment": rating_model.comment,
            "created_at": rating_model.created_at,
            "updated_at": rating_model.updated_at
        }
        
        return {"status": "success", "rating": rating}
    
    @staticmethod
    async def get_ratings_by_prompt(
        prompt_id: UUID, 
        current_user_id: Optional[UUID] = None, 
        skip: int = 0, 
        limit: int = 10
    ) -> RatingResponse:
        """获取提示词的评分列表"""
        db = next(get_db())
        
        # 获取评分列表
        ratings = await RatingRepository.get_by_prompt(db, prompt_id, skip, limit)
        
        # 获取总数
        total = await RatingRepository.count_by_prompt(db, prompt_id)
        
        # 处理评分数据，添加用户名和有用标记数量
        result_ratings = []
        for rating in ratings:
            # 获取用户名
            user = db.query(User).filter(User.id == rating.user_id).first()
            user_username = user.username if user else "未知用户"
            
            # 获取有用标记数量
            helpful_count = await HelpfulMarkRepository.count_by_rating(db, rating.id)
            
            # 检查当前用户是否标记为有用
            is_helpful = False
            if current_user_id:
                is_helpful = await HelpfulMarkRepository.is_marked_helpful(db, rating.id, current_user_id)
            
            # 创建评分对象
            rating_dict = {
                "id": rating.id,
                "prompt_id": rating.prompt_id,
                "user_id": rating.user_id,
                "score": rating.score,
                "comment": rating.comment,
                "created_at": rating.created_at,
                "updated_at": rating.updated_at,
                "user_username": user_username,
                "helpful_count": helpful_count,
                "is_helpful": is_helpful
            }
            result_ratings.append(rating_dict)
        
        return RatingResponse(
            data=result_ratings,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            size=limit
        )
    
    @staticmethod
    async def mark_helpful(rating_id: UUID, user_id: UUID) -> Dict[str, Any]:
        """标记或取消标记评分为有用"""
        db = next(get_db())
        
        # 检查评分是否存在
        rating = await RatingRepository.get_by_id(db, rating_id)
        if not rating:
            return {"status": "error", "message": "评分不存在"}
        
        # 不允许用户标记自己的评分
        if rating.user_id == user_id:
            return {"status": "error", "message": "不能标记自己的评分为有用"}
        
        # 标记或取消标记为有用
        is_marked = await HelpfulMarkRepository.toggle_helpful(db, rating_id, user_id)
        
        # 获取最新的有用标记数量
        helpful_count = await HelpfulMarkRepository.count_by_rating(db, rating_id)
        
        return {
            "status": "success", 
            "is_helpful": is_marked,
            "helpful_count": helpful_count
        }
    @staticmethod
    async def delete_rating(rating_id: UUID, user_id: UUID, is_admin: bool = False) -> Dict[str, Any]:
        """删除评分
        
        Args:
            rating_id: 评分ID
            user_id: 当前用户ID
            is_admin: 是否是管理员
            
        Returns:
            包含操作状态的字典
        """
        db = next(get_db())
        
        # 检查评分是否存在
        rating = await RatingRepository.get_by_id(db, rating_id)
        if not rating:
            return {"status": "error", "message": "评分不存在"}
        
        # 检查权限：用户只能删除自己的评分，管理员可以删除任何评分
        if not is_admin and rating.user_id != user_id:
            return {"status": "error", "message": "没有权限删除此评分"}
        
        # 执行删除
        result = await RatingRepository.delete(db, rating_id)
        if not result:
            return {"status": "error", "message": "删除评分失败"}
        
        return {
            "status": "success",
            "message": "评分已删除"
        }
