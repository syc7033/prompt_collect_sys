from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user, get_current_active_superuser, get_current_user_optional
from app.auth.models import User
from app.categories.schemas import Category, CategoryCreate, CategoryUpdate, CategoryWithChildren, CategoryWithPrompts
from app.categories.services import CategoryService
from app.prompts.schemas import Prompt

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[CategoryWithPrompts])
async def get_categories(
    skip: int = 0,
    limit: int = 100,
    parent_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取分类列表，如果提供parent_id则返回该父分类的子分类，否则返回根分类"""
    categories = CategoryService.get_categories(db, skip=skip, limit=limit, parent_id=parent_id)
    categories_with_count = CategoryService.get_categories_with_prompt_count(db)
    
    # 将提示词数量添加到分类对象中
    result = []
    for category in categories:
        category_dict = {c.name: getattr(category, c.name) for c in category.__table__.columns}
        # 查找对应的提示词数量
        prompt_count = 0
        for cat_count in categories_with_count:
            if cat_count['id'] == category.id:
                prompt_count = cat_count['prompt_count']
                break
        result.append({**category_dict, 'prompt_count': prompt_count})
    
    return result

@router.get("/tree", response_model=List[CategoryWithChildren])
async def get_category_tree(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取分类树结构"""
    return CategoryService.get_category_tree(db)
    
@router.get("/tree-with-counts")
async def get_category_tree_with_counts(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取分类树结构，并包含每个分类的子节点数量和提示词数量"""
    return CategoryService.get_category_tree_with_counts(db)

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)  # 只有管理员可以创建分类
):
    """创建新分类"""
    return CategoryService.create_category(db, category)

@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取特定分类"""
    category = CategoryService.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: uuid.UUID,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)  # 只有管理员可以更新分类
):
    """更新分类"""
    updated_category = CategoryService.update_category(db, category_id, category)
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)  # 只有管理员可以删除分类
):
    """删除分类"""
    success = CategoryService.delete_category(db, category_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category. It may have children or associated prompts."
        )
    return {"status": "success"}

@router.get("/{category_id}/prompts", response_model=List[Prompt])
async def get_prompts_by_category(
    category_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取特定分类下的所有提示词"""
    category = CategoryService.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryService.get_prompts_by_category(db, category_id, skip, limit)

@router.post("/{category_id}/prompts/{prompt_id}", status_code=status.HTTP_200_OK)
async def add_prompt_to_category(
    category_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """将提示词添加到指定分类"""
    # 检查分类是否存在
    category = CategoryService.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 检查提示词是否存在
    from app.prompts.services import PromptService
    prompt = PromptService.get_prompt(db, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # 检查权限（只有提示词的创建者或管理员可以添加到分类）
    if prompt.creator_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # 将提示词添加到分类
    success = CategoryService.add_prompt_to_category(db, category_id, prompt_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to add prompt to category"
        )
    
    return {"status": "success"}

@router.delete("/{category_id}/prompts/{prompt_id}", status_code=status.HTTP_200_OK)
async def remove_prompt_from_category(
    category_id: uuid.UUID,
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """从分类中移除提示词"""
    # 检查分类是否存在
    category = CategoryService.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 检查提示词是否存在
    from app.prompts.services import PromptService
    prompt = PromptService.get_prompt(db, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # 检查权限（只有提示词的创建者或管理员可以从分类中移除）
    if prompt.creator_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # 从分类中移除提示词
    success = CategoryService.remove_prompt_from_category(db, prompt_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to remove prompt from category"
        )
    
    return {"status": "success"}
