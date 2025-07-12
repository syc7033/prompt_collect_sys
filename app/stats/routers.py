from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user, get_current_user_optional
from app.auth.models import User
from app.stats.schemas import DashboardStats, ActiveUsersResponse, PopularPromptsResponse
from app.stats.services import StatsService

router = APIRouter(
    prefix="/stats",
    tags=["统计"],
    responses={404: {"description": "Not found"}},
)

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取仪表盘统计数据
    
    返回系统总体统计数据，包括：
    - 提示词总数
    - 用户总数
    - 使用总次数
    - 今日新增提示词数
    """
    try:
        stats = await StatsService.get_dashboard_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计数据失败: {str(e)}")

@router.get("/active-users", response_model=ActiveUsersResponse)
async def get_active_users(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取活跃用户排名
    
    返回创建提示词最多的用户列表
    
    - **limit**: 返回的用户数量，默认为10
    """
    try:
        users = await StatsService.get_active_users(db, limit)
        return {
            "data": users,
            "total": len(users)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取活跃用户失败: {str(e)}")

@router.get("/top-prompts", response_model=PopularPromptsResponse)
async def get_top_prompts(
    time_range: Optional[int] = Query(None, description="时间范围（天）"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取热门提示词排行
    
    返回使用次数最多的提示词列表
    
    - **time_range**: 时间范围（天），例如7表示最近7天，不指定则为所有时间
    - **limit**: 返回的提示词数量，默认为10
    """
    try:
        prompts = await StatsService.get_popular_prompts(db, time_range, limit)
        
        # 如果没有使用记录，使用备用方法获取最新提示词
        if not prompts:
            prompts = await StatsService.get_popular_prompts_fallback(db, limit)
        
        return {
            "data": prompts,
            "total": len(prompts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取热门提示词失败: {str(e)}")
