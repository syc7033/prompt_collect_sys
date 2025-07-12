from typing import Dict, List, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.database import get_db
from app.usage.repositories import UsageRepository
from app.usage.schemas import UsageCreate, UsageResponse, PopularPromptsResponse

class UsageService:
    @staticmethod
    async def record_usage(prompt_id: UUID, user_id: Optional[UUID], usage_type: str) -> Dict[str, Any]:
        """记录提示词使用情况"""
        db = next(get_db())
        
        try:
            usage = await UsageRepository.create(db, prompt_id, user_id, usage_type)
            return {
                "status": "success",
                "usage_id": usage.id,
                "message": "使用记录已创建"
            }
        except ValueError as e:
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"创建使用记录失败: {str(e)}"
            }
    
    @staticmethod
    async def get_prompt_usage_stats(prompt_id: UUID) -> Dict[str, Any]:
        """获取提示词的使用统计数据"""
        db = next(get_db())
        
        try:
            stats = await UsageRepository.get_prompt_usage_stats(db, prompt_id)
            return {
                "status": "success",
                "data": stats
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取使用统计数据失败: {str(e)}"
            }
    
    @staticmethod
    async def get_usage_by_prompt(
        prompt_id: UUID, 
        skip: int = 0, 
        limit: int = 10
    ) -> UsageResponse:
        """获取提示词的使用记录"""
        db = next(get_db())
        
        usages = await UsageRepository.get_by_prompt(db, prompt_id, skip, limit)
        total = await UsageRepository.count_by_prompt(db, prompt_id)
        
        return UsageResponse(
            data=usages,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            size=limit
        )
    
    @staticmethod
    async def get_popular_prompts(
        time_range: Optional[int] = None,  # 时间范围（天）
        skip: int = 0, 
        limit: int = 10
    ) -> PopularPromptsResponse:
        """获取热门提示词"""
        db = next(get_db())
        
        prompts = await UsageRepository.get_popular_prompts(db, time_range, skip, limit)
        total = await UsageRepository.count_popular_prompts(db, time_range)
        
        return PopularPromptsResponse(
            data=prompts,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            size=limit
        )
