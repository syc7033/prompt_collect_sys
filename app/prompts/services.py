from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid

from app.prompts.repositories import PromptRepository
from app.prompts.schemas import PromptCreate, PromptUpdate, PromptFilter
from app.prompts.models import Prompt, PromptHistory

class PromptService:
    @staticmethod
    def create_prompt(db: Session, prompt_in: PromptCreate, creator_id: uuid.UUID) -> Prompt:
        """
        创建新的提示词
        """
        return PromptRepository.create(db, prompt_in, creator_id)
    
    @staticmethod
    def update_prompt(db: Session, prompt_id: uuid.UUID, prompt_in: PromptUpdate, user_id: uuid.UUID) -> Prompt:
        """
        更新提示词
        """
        prompt = PromptRepository.get_by_id(db, prompt_id)
        if not prompt:
            raise ValueError("提示词不存在")
        
        # 检查权限
        if prompt.creator_id != user_id:
            raise ValueError("没有权限修改此提示词")
        
        return PromptRepository.update(db, prompt, prompt_in)
    @staticmethod
    def delete_prompt(db: Session, prompt_id: uuid.UUID, user_id: uuid.UUID, is_superuser: bool = False) -> bool:
        """
        删除提示词
        
        参数:
            db: 数据库会话
            prompt_id: 要删除的提示词ID
            user_id: 当前用户ID
            is_superuser: 当前用户是否为管理员，默认为False
        """
        prompt = PromptRepository.get_by_id(db, prompt_id)
        if not prompt:
            raise ValueError("提示词不存在")
        
        # 检查权限：只有创建者或管理员可以删除
        if not is_superuser and prompt.creator_id != user_id:
            raise ValueError("没有权限删除此提示词")
        
        return PromptRepository.delete(db, prompt_id)    
    
    @staticmethod
    def get_prompt(db: Session, prompt_id: uuid.UUID) -> Prompt:
        """
        获取提示词详情
        """
        prompt = PromptRepository.get_by_id(db, prompt_id)
        if not prompt:
            raise ValueError("提示词不存在")
        
        return prompt
    
    @staticmethod
    def get_prompts(
        db: Session, 
        skip: int = 0, 
        limit: int = 20, 
        filter_params: Optional[PromptFilter] = None
    ) -> Dict[str, Any]:
        """
        获取提示词列表
        """
        return PromptRepository.get_multi(db, skip, limit, filter_params)
    
    @staticmethod
    def get_prompt_histories(db: Session, prompt_id: uuid.UUID) -> List[PromptHistory]:
        """
        获取提示词历史记录
        """
        prompt = PromptRepository.get_by_id(db, prompt_id)
        if not prompt:
            raise ValueError("提示词不存在")
        
        return PromptRepository.get_histories(db, prompt_id)
    
    @staticmethod
    def get_prompt_history_by_version(db: Session, prompt_id: uuid.UUID, version: int) -> PromptHistory:
        """
        获取指定版本的提示词历史记录
        """
        prompt = PromptRepository.get_by_id(db, prompt_id)
        if not prompt:
            raise ValueError("提示词不存在")
        
        history = PromptRepository.get_history_by_version(db, prompt_id, version)
        if not history:
            raise ValueError("指定版本的历史记录不存在")
        
        return history
    
    @staticmethod
    def fork_prompt(db: Session, prompt_id: uuid.UUID, user_id: uuid.UUID) -> Prompt:
        """
        Fork一个提示词（创建一个新版本）
        """
        import logging
        import traceback
        logger = logging.getLogger("app")
        
        logger.info(f"开始fork提示词: prompt_id={prompt_id}, user_id={user_id}")
        
        try:
            prompt = PromptRepository.get_by_id(db, prompt_id)
            logger.info(f"获取原始提示词结果: {prompt is not None}, 提示词ID: {prompt_id}")
            
            if not prompt:
                logger.error(f"提示词不存在: {prompt_id}")
                raise ValueError("提示词不存在")
            
            # 记录原始提示词信息
            logger.info(f"原始提示词信息: id={prompt.id}, title={prompt.title}, category_id={prompt.category_id}")
            
            # 创建新的提示词
            prompt_in = PromptCreate(
                title=f"{prompt.title} (Fork)",
                content=prompt.content,
                description=prompt.description,
                tags=prompt.tags,
                parent_id=prompt.id,
                category_id=prompt.category_id  # 确保包含分类ID
            )
            
            logger.info(f"准备创建fork提示词: title={prompt_in.title}, parent_id={prompt_in.parent_id}, category_id={prompt_in.category_id}")
            
            # 创建新提示词
            new_prompt = PromptRepository.create(db, prompt_in, user_id)
            logger.info(f"Fork提示词创建成功: new_id={new_prompt.id}, title={new_prompt.title}")
            
            return new_prompt
        except Exception as e:
            error_msg = f"Fork提示词时发生错误: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise ValueError(error_msg)
