from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional, Dict, Any
import uuid
import json

from app.prompts.models import Prompt, PromptHistory
from app.prompts.schemas import PromptCreate, PromptUpdate, PromptFilter
from app.ratings.models import Rating

class PromptRepository:
    @staticmethod
    def create(db: Session, prompt_in: PromptCreate, creator_id: uuid.UUID) -> Prompt:
        """
        创建新的提示词
        """
        import logging
        import traceback
        logger = logging.getLogger("app")
        
        try:
            # 记录创建提示词的输入参数
            logger.info(f"开始创建提示词: title={prompt_in.title}, parent_id={prompt_in.parent_id}, category_id={prompt_in.category_id}")
            
            # 检查category_id是否存在
            if not prompt_in.category_id:
                logger.warning(f"创建提示词时缺少category_id: title={prompt_in.title}, parent_id={prompt_in.parent_id}")
            
            # 创建提示词对象
            db_prompt = Prompt(
                title=prompt_in.title,
                content=prompt_in.content,
                description=prompt_in.description,
                tags=prompt_in.tags,
                parent_id=prompt_in.parent_id,
                creator_id=creator_id,
                category_id=prompt_in.category_id,  # 添加分类字段
                version=1
            )
            
            # 记录创建的提示词对象信息
            logger.info(f"提示词对象创建成功，准备保存到数据库: id={db_prompt.id}, title={db_prompt.title}")
            
            # 保存到数据库
            try:
                db.add(db_prompt)
                db.commit()
                logger.info(f"提示词成功保存到数据库: id={db_prompt.id}")
                db.refresh(db_prompt)
                logger.info(f"提示词刷新成功: id={db_prompt.id}, title={db_prompt.title}, category_id={db_prompt.category_id}")
            except Exception as db_error:
                logger.error(f"保存提示词到数据库时出错: {str(db_error)}")
                logger.error(traceback.format_exc())
                db.rollback()
                raise
            
            # 创建历史记录
            try:
                history = PromptRepository.create_history(db, db_prompt)
                logger.info(f"提示词历史记录创建成功: prompt_id={db_prompt.id}, history_id={history.id}, version={history.version}")
            except Exception as history_error:
                logger.error(f"创建提示词历史记录时出错: {str(history_error)}")
                logger.error(traceback.format_exc())
                # 不抛出异常，因为主要提示词已创建成功
            
            return db_prompt
        except Exception as e:
            error_msg = f"创建提示词过程中发生错误: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise ValueError(error_msg)
    
    @staticmethod
    def update(db: Session, prompt: Prompt, prompt_in: PromptUpdate) -> Prompt:
        """
        更新提示词
        """
        # 更新提示词属性
        update_data = prompt_in.dict(exclude_unset=True)
        
        # 如果有内容更新，增加版本号
        if any(field in update_data for field in ["title", "content", "description"]):
            prompt.version += 1
        
        # 更新提示词对象的属性
        for field, value in update_data.items():
            setattr(prompt, field, value)
        
        # 保存到数据库
        db.add(prompt)
        db.commit()
        db.refresh(prompt)
        
        # 创建历史记录
        PromptRepository.create_history(db, prompt)
        
        return prompt
    
    @staticmethod
    def delete(db: Session, prompt_id: uuid.UUID) -> bool:
        """
        删除提示词
        """
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            return False
        
        db.delete(prompt)
        db.commit()
        return True
    
    @staticmethod
    def get_by_id(db: Session, prompt_id: uuid.UUID) -> Optional[Prompt]:
        """
        通过ID获取提示词
        """
        return db.query(Prompt).filter(Prompt.id == prompt_id).first()
    
    @staticmethod
    def get_multi(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        filter_params: Optional[PromptFilter] = None
    ) -> Dict[str, Any]:
        """
        获取多个提示词，支持分页和过滤
        """
        # 添加日志输出，调试评分数据问题
        print(f"获取提示词列表: skip={skip}, limit={limit}, filter_params={filter_params}")
        
        # 使用joinedload加载关联数据
        query = db.query(Prompt)
        
        # 应用过滤条件
        if filter_params:
            if filter_params.search:
                search = f"%{filter_params.search}%"
                query = query.filter(
                    or_(
                        Prompt.title.ilike(search),
                        Prompt.description.ilike(search),
                        Prompt.content.ilike(search)
                    )
                )
            
            if filter_params.tags:
                for tag in filter_params.tags:
                    query = query.filter(Prompt.tags.contains([tag]))
            
            if filter_params.creator_id:
                query = query.filter(Prompt.creator_id == filter_params.creator_id)
        
        # 获取总数
        total = query.count()
        
        # 应用分页并获取数据
        prompts = query.order_by(Prompt.updated_at.desc()).offset(skip).limit(limit).all()
        
        # 确保评分数据正确加载
        for prompt in prompts:
            # 重新计算评分统计数据
            # 1. 计算评分数量
            rating_count = db.query(func.count("*")).select_from(
                db.query(Rating).filter(Rating.prompt_id == prompt.id).subquery()
            ).scalar()
            
            # 2. 计算平均评分
            avg_rating = db.query(func.avg(Rating.score)).filter(
                Rating.prompt_id == prompt.id
            ).scalar()
            
            # 3. 更新提示词对象的评分数据
            prompt.rating_count = rating_count or 0
            prompt.average_rating = float(avg_rating) if avg_rating is not None else 0.0
            
            # 打印每个提示词的评分数据，用于调试
            print(f"提示词ID: {prompt.id}, 标题: {prompt.title}, 重新计算评分: {prompt.average_rating}, 评论数: {prompt.rating_count}")
            
            # 如果评分数据为None，设置默认值
            if prompt.average_rating is None:
                prompt.average_rating = 0.0
            if prompt.rating_count is None:
                prompt.rating_count = 0
        
        return {
            "data": prompts,
            "total": total,
            "page": skip // limit + 1 if limit > 0 else 1,
            "size": limit
        }
    
    @staticmethod
    def create_history(db: Session, prompt: Prompt) -> PromptHistory:
        """
        创建提示词历史记录
        """
        import logging
        import traceback
        logger = logging.getLogger("app")
        
        logger.info(f"开始创建提示词历史记录: prompt_id={prompt.id}, version={prompt.version}")
        
        try:
            # 创建快照
            snapshot = {
                "title": prompt.title,
                "content": prompt.content,
                "description": prompt.description,
                "tags": prompt.tags
            }
            
            logger.info(f"快照创建成功: prompt_id={prompt.id}, title={prompt.title}")
            
            # 创建历史记录对象
            history = PromptHistory(
                prompt_id=prompt.id,
                snapshot=snapshot,
                version=prompt.version
            )
            
            logger.info(f"历史记录对象创建成功: prompt_id={prompt.id}, version={prompt.version}")
            
            # 保存到数据库
            try:
                db.add(history)
                db.commit()
                logger.info(f"历史记录保存成功: history_id={history.id}")
                db.refresh(history)
                logger.info(f"历史记录刷新成功: history_id={history.id}, prompt_id={history.prompt_id}, version={history.version}")
            except Exception as db_error:
                logger.error(f"保存历史记录到数据库时出错: {str(db_error)}")
                logger.error(traceback.format_exc())
                db.rollback()
                raise
            
            return history
        except Exception as e:
            error_msg = f"创建历史记录时发生错误: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise ValueError(error_msg)
    
    @staticmethod
    def get_histories(db: Session, prompt_id: uuid.UUID) -> List[PromptHistory]:
        """
        获取提示词的历史记录
        """
        return db.query(PromptHistory).filter(
            PromptHistory.prompt_id == prompt_id
        ).order_by(PromptHistory.version.desc()).all()
    
    @staticmethod
    def get_history_by_version(db: Session, prompt_id: uuid.UUID, version: int) -> Optional[PromptHistory]:
        """
        获取指定版本的提示词历史记录
        """
        return db.query(PromptHistory).filter(
            PromptHistory.prompt_id == prompt_id,
            PromptHistory.version == version
        ).first()
