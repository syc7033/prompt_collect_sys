from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid

from app.categories.repositories import CategoryRepository
from app.categories.schemas import CategoryCreate, CategoryUpdate

class CategoryService:
    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100, parent_id: Optional[uuid.UUID] = None):
        return CategoryRepository.get_categories(db, skip, limit, parent_id)
    
    @staticmethod
    def get_category(db: Session, category_id: uuid.UUID):
        return CategoryRepository.get_category(db, category_id)
    
    @staticmethod
    def get_category_tree(db: Session):
        return CategoryRepository.get_category_tree(db)
        
    @staticmethod
    def get_category_tree_with_counts(db: Session):
        """获取分类树结构，并包含每个分类的子节点数量和提示词数量"""
        return CategoryRepository.get_category_tree_with_counts(db)
    
    @staticmethod
    def create_category(db: Session, category: CategoryCreate):
        return CategoryRepository.create_category(
            db,
            name=category.name,
            description=category.description,
            parent_id=category.parent_id
        )
    
    @staticmethod
    def update_category(db: Session, category_id: uuid.UUID, category: CategoryUpdate):
        return CategoryRepository.update_category(
            db,
            category_id=category_id,
            name=category.name,
            description=category.description,
            parent_id=category.parent_id
        )
    
    @staticmethod
    def delete_category(db: Session, category_id: uuid.UUID):
        return CategoryRepository.delete_category(db, category_id)
    
    @staticmethod
    def get_prompts_by_category(db: Session, category_id: uuid.UUID, skip: int = 0, limit: int = 100):
        return CategoryRepository.get_prompts_by_category(db, category_id, skip, limit)
    
    @staticmethod
    def get_categories_with_prompt_count(db: Session):
        return CategoryRepository.get_categories_with_prompt_count(db)
    
    @staticmethod
    def add_prompt_to_category(db: Session, category_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        """将提示词添加到指定分类"""
        return CategoryRepository.add_prompt_to_category(db, category_id, prompt_id)
    
    @staticmethod
    def remove_prompt_from_category(db: Session, prompt_id: uuid.UUID) -> bool:
        """从分类中移除提示词"""
        return CategoryRepository.remove_prompt_from_category(db, prompt_id)
