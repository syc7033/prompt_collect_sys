from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.favorites.models import Favorite, favorite_prompt
from app.prompts.models import Prompt

class FavoriteRepository:
    @staticmethod
    def get_favorites(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Favorite]:
        return db.query(Favorite).filter(Favorite.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_favorite(db: Session, favorite_id: uuid.UUID) -> Optional[Favorite]:
        return db.query(Favorite).filter(Favorite.id == favorite_id).first()
    
    @staticmethod
    def create_favorite(db: Session, name: str, user_id: uuid.UUID) -> Favorite:
        favorite = Favorite(name=name, user_id=user_id)
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite
    
    @staticmethod
    def update_favorite(db: Session, favorite_id: uuid.UUID, name: str) -> Optional[Favorite]:
        favorite = db.query(Favorite).filter(Favorite.id == favorite_id).first()
        if not favorite:
            return None
        
        favorite.name = name
        db.commit()
        db.refresh(favorite)
        return favorite
    
    @staticmethod
    def delete_favorite(db: Session, favorite_id: uuid.UUID) -> bool:
        favorite = db.query(Favorite).filter(Favorite.id == favorite_id).first()
        if not favorite:
            return False
        
        db.delete(favorite)
        db.commit()
        return True
    
    @staticmethod
    def add_prompt_to_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        # 检查收藏夹和提示词是否存在
        favorite = db.query(Favorite).filter(Favorite.id == favorite_id).first()
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not favorite or not prompt:
            return False
        
        # 检查提示词是否已经在收藏夹中
        exists = db.query(favorite_prompt).filter(
            favorite_prompt.c.favorite_id == favorite_id,
            favorite_prompt.c.prompt_id == prompt_id
        ).first() is not None
        
        if exists:
            return True  # 已经存在，视为成功
        
        # 添加提示词到收藏夹
        stmt = favorite_prompt.insert().values(favorite_id=favorite_id, prompt_id=prompt_id)
        db.execute(stmt)
        db.commit()
        return True
    
    @staticmethod
    def remove_prompt_from_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        # 检查收藏夹和提示词是否存在
        favorite = db.query(Favorite).filter(Favorite.id == favorite_id).first()
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not favorite or not prompt:
            return False
        
        # 从收藏夹中移除提示词
        stmt = favorite_prompt.delete().where(
            favorite_prompt.c.favorite_id == favorite_id,
            favorite_prompt.c.prompt_id == prompt_id
        )
        db.execute(stmt)
        db.commit()
        return True
    
    @staticmethod
    def get_prompts_in_favorite(db: Session, favorite_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Prompt]:
        return db.query(Prompt).join(
            favorite_prompt,
            Prompt.id == favorite_prompt.c.prompt_id
        ).filter(
            favorite_prompt.c.favorite_id == favorite_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def is_prompt_in_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        return db.query(favorite_prompt).filter(
            favorite_prompt.c.favorite_id == favorite_id,
            favorite_prompt.c.prompt_id == prompt_id
        ).first() is not None
        
    @staticmethod
    def get_prompt_in_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID) -> Optional[Prompt]:
        """获取收藏夹中特定提示词的详细信息"""
        # 首先检查提示词是否在收藏夹中
        is_in_favorite = FavoriteRepository.is_prompt_in_favorite(db, favorite_id, prompt_id)
        if not is_in_favorite:
            return None
            
        # 获取提示词详细信息
        return db.query(Prompt).filter(Prompt.id == prompt_id).first()
