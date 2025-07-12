from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user, get_current_user_optional
from app.auth.models import User
from app.prompts.schemas import (
    Prompt, PromptCreate, PromptUpdate, PromptHistory,
    PaginatedPromptResponse, PromptFilter
)
from app.prompts.services import PromptService

router = APIRouter()

@router.post("", response_model=Prompt, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    prompt_in: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建新的提示词
    """
    try:
        prompt = PromptService.create_prompt(db, prompt_in, current_user.id)
        return prompt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("", response_model=PaginatedPromptResponse)
async def read_prompts(
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    creator_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取提示词列表，支持搜索、过滤和分页
    """
    filter_params = PromptFilter(
        search=search,
        tags=tags,
        creator_id=creator_id
    )
    
    result = PromptService.get_prompts(db, skip, limit, filter_params)
    return result

@router.get("/{prompt_id}", response_model=Prompt)
async def read_prompt(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取提示词详情
    """
    try:
        prompt = PromptService.get_prompt(db, prompt_id)
        return prompt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.put("/{prompt_id}", response_model=Prompt)
async def update_prompt(
    prompt_id: uuid.UUID,
    prompt_in: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新提示词
    """
    try:
        prompt = PromptService.update_prompt(db, prompt_id, prompt_in, current_user.id)
        return prompt
    except ValueError as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除提示词
    """
    try:
        # 添加调试日志
        import logging
        logger = logging.getLogger("app")
        logger.info(f"删除提示词: prompt_id={prompt_id}, user_id={current_user.id}, is_superuser={current_user.is_superuser}")
        
        # 检查用户权限：管理员可以删除任何提示词，普通用户只能删除自己的提示词
        prompt = PromptService.get_prompt(db, prompt_id)
        logger.info(f"提示词信息: prompt_id={prompt_id}, creator_id={prompt.creator_id}")
        
        if prompt.creator_id != current_user.id and not current_user.is_superuser:
            logger.warning(f"权限检查失败: user_id={current_user.id}, is_superuser={current_user.is_superuser}, prompt.creator_id={prompt.creator_id}")
            raise ValueError("没有权限删除此提示词")
        
        # 调用服务层删除提示词，传递管理员状态
        logger.info(f"权限检查通过，开始删除提示词: prompt_id={prompt_id}, is_superuser={current_user.is_superuser}")
        PromptService.delete_prompt(db, prompt_id, current_user.id, current_user.is_superuser)
    except ValueError as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

@router.get("/{prompt_id}/histories", response_model=List[PromptHistory])
async def read_prompt_histories(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取提示词历史记录
    """
    try:
        histories = PromptService.get_prompt_histories(db, prompt_id)
        return histories
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/{prompt_id}/histories/{version}", response_model=PromptHistory)
async def read_prompt_history_by_version(
    prompt_id: uuid.UUID,
    version: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    获取指定版本的提示词历史记录
    """
    try:
        history = PromptService.get_prompt_history_by_version(db, prompt_id, version)
        return history
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{prompt_id}/fork", response_model=Prompt, status_code=status.HTTP_201_CREATED)
async def fork_prompt(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fork一个提示词（创建一个新版本）
    """
    import logging
    import traceback
    logger = logging.getLogger("app")
    
    logger.info(f"接收到fork提示词请求: prompt_id={prompt_id}, user_id={current_user.id}, username={current_user.username}")
    
    try:
        # 记录请求开始处理
        logger.info(f"开始处理fork请求: prompt_id={prompt_id}")
        
        # 调用服务层方法
        prompt = PromptService.fork_prompt(db, prompt_id, current_user.id)
        
        # 记录成功响应
        logger.info(f"Fork提示词成功: 原始id={prompt_id}, 新id={prompt.id}, title={prompt.title}")
        return prompt
    except ValueError as e:
        # 记录错误
        error_msg = f"Fork提示词失败: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        
        # 返回适当的HTTP错误
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        # 记录未预期的错误
        error_msg = f"Fork提示词时发生未预期错误: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        
        # 返回500错误
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="处理请求时发生内部错误，请稍后重试"
        )

