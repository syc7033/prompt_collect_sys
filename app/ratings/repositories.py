from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from sqlalchemy.sql import select, and_

from app.ratings.models import Rating, HelpfulMark
from app.ratings.schemas import RatingCreate, RatingUpdate
from app.auth.models import User
from app.prompts.models import Prompt

class RatingRepository:
    @staticmethod
    async def create(db: Session, prompt_id: UUID, user_id: UUID, rating_data: RatingCreate) -> Rating:
        """创建或更新评分"""
        # 检查用户是否已经评分过
        existing_rating = db.query(Rating).filter(
            Rating.prompt_id == prompt_id,
            Rating.user_id == user_id
        ).first()
        
        if existing_rating:
            # 更新现有评分
            existing_rating.score = rating_data.score
            if rating_data.comment is not None:
                existing_rating.comment = rating_data.comment
            db.commit()
            db.refresh(existing_rating)
            return existing_rating
        
        # 创建新评分
        db_rating = Rating(
            prompt_id=prompt_id,
            user_id=user_id,
            score=rating_data.score,
            comment=rating_data.comment
        )
        db.add(db_rating)
        db.commit()
        db.refresh(db_rating)
        return db_rating
    
    @staticmethod
    async def get_by_id(db: Session, rating_id: UUID) -> Optional[Rating]:
        """通过ID获取评分"""
        return db.query(Rating).filter(Rating.id == rating_id).first()
    
    @staticmethod
    async def get_by_prompt(db: Session, prompt_id: UUID, skip: int = 0, limit: int = 10) -> List[Rating]:
        """获取提示词的评分列表"""
        return db.query(Rating)\
            .filter(Rating.prompt_id == prompt_id)\
            .order_by(desc(Rating.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    async def count_by_prompt(db: Session, prompt_id: UUID) -> int:
        """统计提示词的评分数量"""
        return db.query(func.count(Rating.id))\
            .filter(Rating.prompt_id == prompt_id)\
            .scalar()
    
    @staticmethod
    async def get_average_score(db: Session, prompt_id: UUID) -> float:
        """计算提示词的平均评分"""
        result = db.query(func.avg(Rating.score))\
            .filter(Rating.prompt_id == prompt_id)\
            .scalar()
        return float(result) if result is not None else 0.0
    
    @staticmethod
    async def update_prompt_rating_stats(db: Session, prompt_id: UUID) -> None:
        """更新提示词的评分统计信息"""
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if prompt:
            count = await RatingRepository.count_by_prompt(db, prompt_id)
            avg_score = await RatingRepository.get_average_score(db, prompt_id)
            
            prompt.rating_count = count
            prompt.average_rating = avg_score
            db.commit()

    @staticmethod
    async def delete(db: Session, rating_id: UUID) -> bool:
        """删除评分"""
        rating = await RatingRepository.get_by_id(db, rating_id)
        if not rating:
            return False
            
        # 保存提示词ID以便更新统计信息
        prompt_id = rating.prompt_id
        
        # 先删除与评分相关的所有有用标记
        db.query(HelpfulMark).filter(HelpfulMark.rating_id == rating_id).delete()
        
        # 删除评分
        db.delete(rating)
        db.commit()
        
        # 更新提示词的评分统计信息
        await RatingRepository.update_prompt_rating_stats(db, prompt_id)
        
        return True

class HelpfulMarkRepository:
    @staticmethod
    async def toggle_helpful(db: Session, rating_id: UUID, user_id: UUID) -> bool:
        """切换评分的有用标记"""
        # 检查是否已经标记过
        existing_mark = db.query(HelpfulMark).filter(
            HelpfulMark.rating_id == rating_id,
            HelpfulMark.user_id == user_id
        ).first()
        
        if existing_mark:
            # 已标记，则取消标记
            db.delete(existing_mark)
            db.commit()
            return False
        
        # 创建新标记
        db_mark = HelpfulMark(rating_id=rating_id, user_id=user_id)
        db.add(db_mark)
        db.commit()
        return True
    
    @staticmethod
    async def count_by_rating(db: Session, rating_id: UUID) -> int:
        """统计评分的有用标记数量"""
        return db.query(func.count(HelpfulMark.id))\
            .filter(HelpfulMark.rating_id == rating_id)\
            .scalar()
    
    @staticmethod
    async def is_marked_helpful(db: Session, rating_id: UUID, user_id: UUID) -> bool:
        """检查用户是否已标记评分为有用"""
        mark = db.query(HelpfulMark).filter(
            HelpfulMark.rating_id == rating_id,
            HelpfulMark.user_id == user_id
        ).first()
        return mark is not None
