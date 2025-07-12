from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import uuid

from app.categories.models import Category
from app.prompts.models import Prompt

class CategoryRepository:
    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100, parent_id: Optional[uuid.UUID] = None) -> List[Category]:
        query = db.query(Category)
        if parent_id is not None:
            # 如果提供了parent_id，返回该父分类的子分类
            query = query.filter(Category.parent_id == parent_id)
        else:
            # 否则返回根分类
            query = query.filter(Category.parent_id.is_(None))
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_category(db: Session, category_id: uuid.UUID) -> Optional[Category]:
        return db.query(Category).filter(Category.id == category_id).first()
    
    @staticmethod
    def get_category_with_children(db: Session, category_id: uuid.UUID) -> Optional[Category]:
        return db.query(Category).filter(Category.id == category_id).first()
    
    @staticmethod
    def get_category_tree(db: Session) -> List[Category]:
        # 获取所有根分类（没有父分类的分类）
        return db.query(Category).filter(Category.parent_id.is_(None)).all()
        
    @staticmethod
    def get_category_tree_with_counts(db: Session) -> List[dict]:
        """获取分类树结构，并包含每个分类的子节点数量和提示词数量"""
        import logging
        logger = logging.getLogger(__name__)
        
        # 获取所有分类
        categories = db.query(Category).all()
        
        # 创建分类 ID 到子节点数量的映射
        children_count_map = {}
        for category in categories:
            # 计算直接子节点数量
            children_count = db.query(Category).filter(Category.parent_id == category.id).count()
            children_count_map[str(category.id)] = children_count
            
        # 获取提示词数量
        prompt_counts = db.query(
            Prompt.category_id,
            func.count(Prompt.id).label('prompt_count')
        ).group_by(Prompt.category_id).all()
        
        # 创建分类 ID 到提示词数量的映射
        prompt_count_map = {}
        for category_id, count in prompt_counts:
            if category_id:  # 有些提示词可能没有分类
                prompt_count_map[str(category_id)] = count
        
        # 获取根分类
        root_categories = db.query(Category).filter(Category.parent_id.is_(None)).all()
        
        # 递归构建分类树
        def build_tree(category):
            category_dict = {c.name: getattr(category, c.name) for c in Category.__table__.columns}
            
            # 添加子节点数量
            category_id_str = str(category.id)
            category_dict['children_count'] = children_count_map.get(category_id_str, 0)
            
            # 添加提示词数量
            category_dict['prompt_count'] = prompt_count_map.get(category_id_str, 0)
            
            # 递归处理子分类
            if hasattr(category, 'children') and category.children:
                category_dict['children'] = [build_tree(child) for child in category.children]
            else:
                category_dict['children'] = []
                
            return category_dict
        
        # 构建完整的分类树
        result = [build_tree(category) for category in root_categories]
        
        return result
    
    @staticmethod
    def create_category(db: Session, name: str, description: Optional[str] = None, parent_id: Optional[uuid.UUID] = None) -> Category:
        category = Category(name=name, description=description, parent_id=parent_id)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def update_category(db: Session, category_id: uuid.UUID, name: Optional[str] = None, description: Optional[str] = None, parent_id: Optional[uuid.UUID] = None) -> Optional[Category]:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return None
        
        if name is not None:
            category.name = name
        if description is not None:
            category.description = description
        if parent_id is not None:
            category.parent_id = parent_id
        
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def delete_category(db: Session, category_id: uuid.UUID) -> bool:
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"[分类仓库] 尝试删除分类 {category_id}")
        
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            logger.error(f"[分类仓库] 删除失败: 分类 {category_id} 不存在")
            return False
        
        logger.info(f"[分类仓库] 找到分类: {category.name} (ID: {category.id})")
        
        # 检查是否有子分类
        has_children = db.query(Category).filter(Category.parent_id == category_id).first() is not None
        if has_children:
            logger.error(f"[分类仓库] 删除失败: 分类 {category.name} (ID: {category.id}) 有子分类")
            return False
        
        # 检查是否有提示词关联到该分类
        has_prompts = db.query(Prompt).filter(Prompt.category_id == category_id).first() is not None
        if has_prompts:
            logger.error(f"[分类仓库] 删除失败: 分类 {category.name} (ID: {category.id}) 有关联的提示词")
            return False
        
        try:
            logger.info(f"[分类仓库] 开始删除分类 {category.name} (ID: {category.id})")
            db.delete(category)
            db.commit()
            logger.info(f"[分类仓库] 成功删除分类 {category.name} (ID: {category.id})")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"[分类仓库] 删除失败: {str(e)}")
            return False
    
    @staticmethod
    def get_prompts_by_category(db: Session, category_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Prompt]:
        return db.query(Prompt).filter(Prompt.category_id == category_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_categories_with_prompt_count(db: Session) -> List[dict]:
        # 获取每个分类及其提示词数量
        result = db.query(
            Category,
            func.count(Prompt.id).label('prompt_count')
        ).outerjoin(
            Prompt, Category.id == Prompt.category_id
        ).group_by(
            Category.id
        ).all()
        
        return [
            {
                **{c.name: getattr(category, c.name) for c in Category.__table__.columns},
                'prompt_count': prompt_count
            }
            for category, prompt_count in result
        ]
    
    @staticmethod
    def add_prompt_to_category(db: Session, category_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        """将提示词添加到指定分类"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # 导入Prompt模型
            from app.prompts.models import Prompt
            
            # 查询提示词
            prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if not prompt:
                logger.error(f"[分类仓库] 添加失败: 提示词 {prompt_id} 不存在")
                return False
            
            # 更新提示词的分类字段
            prompt.category_id = category_id
            db.commit()
            
            logger.info(f"[分类仓库] 成功将提示词 {prompt_id} 添加到分类 {category_id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"[分类仓库] 添加失败: {str(e)}")
            return False
    
    @staticmethod
    def remove_prompt_from_category(db: Session, prompt_id: uuid.UUID) -> bool:
        """从分类中移除提示词"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # 导入Prompt模型
            from app.prompts.models import Prompt
            
            # 查询提示词
            prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if not prompt:
                logger.error(f"[分类仓库] 移除失败: 提示词 {prompt_id} 不存在")
                return False
            
            # 如果提示词没有分类，则无需操作
            if prompt.category_id is None:
                logger.info(f"[分类仓库] 提示词 {prompt_id} 没有分类，无需移除")
                return True
            
            # 记录原分类信息便于日志
            original_category_id = prompt.category_id
            
            # 将提示词的分类设置为Null
            prompt.category_id = None
            db.commit()
            
            logger.info(f"[分类仓库] 成功将提示词 {prompt_id} 从分类 {original_category_id} 中移除")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"[分类仓库] 移除失败: {str(e)}")
            return False
