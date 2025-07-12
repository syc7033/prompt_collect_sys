from sqlalchemy.orm import Session
from sqlalchemy import func, desc, distinct, text
from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any, Optional

from app.prompts.models import Prompt
from app.auth.models import User
from app.usage.models import Usage
from app.stats.schemas import DashboardStats, ActiveUser, PopularPrompt

class StatsService:
    @staticmethod
    async def get_dashboard_stats(db: Session) -> DashboardStats:
        """获取仪表盘统计数据"""
        # 获取提示词总数
        total_prompts = db.query(func.count(Prompt.id)).scalar() or 0
        
        # 获取用户总数
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # 获取使用总次数
        total_usages = db.query(func.count(Usage.id)).scalar() or 0
        
        # 获取今日新增提示词数
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        prompts_today = db.query(func.count(Prompt.id)).filter(
            Prompt.created_at >= today_start
        ).scalar() or 0
        
        return {
            "total_prompts": total_prompts,
            "total_users": total_users,
            "total_usages": total_usages,
            "prompts_today": prompts_today
        }
    
    @staticmethod
    async def get_active_users(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """获取活跃用户排名"""
        # 获取创建提示词最多的用户
        active_users_query = db.query(
            User.id,
            User.username,
            func.count(Prompt.id).label("prompt_count")
        ).join(
            Prompt, User.id == Prompt.creator_id
        ).group_by(
            User.id, User.username
        ).order_by(
            desc("prompt_count")
        ).limit(limit)
        
        active_users = []
        for user_id, username, prompt_count in active_users_query:
            active_users.append({
                "id": user_id,
                "username": username,
                "prompt_count": prompt_count,
                "avatar": None  # 可以在这里添加用户头像获取逻辑
            })
        
        return active_users
    
    @staticmethod
    async def get_popular_prompts(
        db: Session, 
        time_range: Optional[int] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """获取热门提示词排行"""
        # 基础查询：获取使用次数最多的提示词
        query = db.query(
            Prompt.id,
            Prompt.title,
            Prompt.description,
            User.id.label("creator_id"),
            User.username.label("creator_name"),
            func.count(Usage.id).label("usage_count")
        ).join(
            Usage, Prompt.id == Usage.prompt_id
        ).join(
            User, Prompt.creator_id == User.id
        )
        
        # 如果指定了时间范围，添加时间过滤条件
        if time_range:
            start_date = datetime.now() - timedelta(days=time_range)
            query = query.filter(Usage.created_at >= start_date)
        
        # 分组、排序并限制结果数量
        query = query.group_by(
            Prompt.id, Prompt.title, Prompt.description, User.id, User.username
        ).order_by(
            desc("usage_count")
        ).limit(limit)
        
        # 转换查询结果为字典列表
        popular_prompts = []
        for id, title, description, creator_id, creator_name, usage_count in query:
            popular_prompts.append({
                "id": id,
                "title": title,
                "description": description,
                "creator_id": creator_id,
                "creator_name": creator_name,
                "usage_count": usage_count
            })
        
        return popular_prompts
    
    @staticmethod
    async def get_popular_prompts_fallback(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """获取热门提示词排行的备用方法（当没有使用记录时）"""
        # 获取最新创建的提示词
        recent_prompts_query = db.query(
            Prompt.id,
            Prompt.title,
            Prompt.description,
            User.id.label("creator_id"),
            User.username.label("creator_name")
        ).join(
            User, Prompt.creator_id == User.id
        ).order_by(
            desc(Prompt.created_at)
        ).limit(limit)
        
        # 转换查询结果为字典列表
        popular_prompts = []
        for id, title, description, creator_id, creator_name in recent_prompts_query:
            popular_prompts.append({
                "id": id,
                "title": title,
                "description": description,
                "creator_id": creator_id,
                "creator_name": creator_name,
                "usage_count": 0  # 没有使用记录，设为0
            })
        
        return popular_prompts
