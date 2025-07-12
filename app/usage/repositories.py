from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta

from app.usage.models import Usage, UsageType
from app.usage.schemas import UsageCreate
from app.prompts.models import Prompt
from app.auth.models import User

class UsageRepository:
    @staticmethod
    async def create(db: Session, prompt_id: UUID, user_id: Optional[UUID], usage_type: str) -> Usage:
        """创建使用记录"""
        # 验证使用类型
        valid_types = [ut.value for ut in UsageType]
        if usage_type not in valid_types:
            raise ValueError(f"无效的使用类型: {usage_type}. 有效类型: {valid_types}")
            
        # 创建使用记录
        db_usage = Usage(
            prompt_id=prompt_id,
            user_id=user_id,
            usage_type=usage_type
        )
        db.add(db_usage)
        db.commit()
        db.refresh(db_usage)
        return db_usage
    
    @staticmethod
    async def get_by_prompt(db: Session, prompt_id: UUID, skip: int = 0, limit: int = 10) -> List[Usage]:
        """获取提示词的使用记录"""
        return db.query(Usage)\
            .filter(Usage.prompt_id == prompt_id)\
            .order_by(desc(Usage.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    async def count_by_prompt(db: Session, prompt_id: UUID) -> int:
        """统计提示词的使用次数"""
        return db.query(func.count(Usage.id))\
            .filter(Usage.prompt_id == prompt_id)\
            .scalar()
    
    @staticmethod
    async def count_by_prompt_and_type(db: Session, prompt_id: UUID, usage_type: str) -> int:
        """统计提示词特定类型的使用次数"""
        return db.query(func.count(Usage.id))\
            .filter(and_(
                Usage.prompt_id == prompt_id,
                Usage.usage_type == usage_type
            ))\
            .scalar()
    
    @staticmethod
    async def get_prompt_usage_stats(db: Session, prompt_id: UUID) -> Dict[str, Any]:
        """获取提示词的使用统计数据"""
        total = await UsageRepository.count_by_prompt(db, prompt_id)
        copy_count = await UsageRepository.count_by_prompt_and_type(db, prompt_id, "copy")
        apply_count = await UsageRepository.count_by_prompt_and_type(db, prompt_id, "apply")
        view_count = await UsageRepository.count_by_prompt_and_type(db, prompt_id, "view")
        fork_count = await UsageRepository.count_by_prompt_and_type(db, prompt_id, "fork")
        
        return {
            "prompt_id": prompt_id,
            "total_usages": total,
            "copy_count": copy_count,
            "apply_count": apply_count,
            "view_count": view_count,
            "fork_count": fork_count
        }
    
    @staticmethod
    async def get_popular_prompts(
        db: Session, 
        time_range: Optional[int] = None,  # 时间范围（天）
        skip: int = 0, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """获取热门提示词"""
        # 构建查询
        query = db.query(
            Usage.prompt_id,
            func.count(Usage.id).label("usage_count")
        )
        
        # 添加时间范围过滤
        if time_range:
            start_date = datetime.utcnow() - timedelta(days=time_range)
            query = query.filter(Usage.created_at >= start_date)
        
        # 分组并排序
        result = query.group_by(Usage.prompt_id)\
            .order_by(desc("usage_count"))\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        # 获取提示词详情
        popular_prompts = []
        for prompt_id, usage_count in result:
            prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if prompt:
                creator = db.query(User).filter(User.id == prompt.creator_id).first()
                creator_username = creator.username if creator else "未知用户"
                
                popular_prompts.append({
                    "prompt_id": prompt_id,
                    "title": prompt.title,
                    "description": prompt.description,
                    "usage_count": usage_count,
                    "creator_username": creator_username,
                    "average_rating": prompt.average_rating,
                    "rating_count": prompt.rating_count
                })
        
        return popular_prompts
    
    @staticmethod
    async def count_popular_prompts(
        db: Session, 
        time_range: Optional[int] = None  # 时间范围（天）
    ) -> int:
        """统计热门提示词的总数"""
        # 构建查询
        query = db.query(
            Usage.prompt_id,
            func.count(Usage.id).label("usage_count")
        )
        
        # 添加时间范围过滤
        if time_range:
            start_date = datetime.utcnow() - timedelta(days=time_range)
            query = query.filter(Usage.created_at >= start_date)
        
        # 分组并计数
        result = query.group_by(Usage.prompt_id).all()
        return len(result)
