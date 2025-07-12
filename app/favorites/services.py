from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.favorites.repositories import FavoriteRepository
from app.favorites.schemas import FavoriteCreate, FavoriteUpdate

class FavoriteService:
    @staticmethod
    def get_favorites(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
        return FavoriteRepository.get_favorites(db, user_id, skip, limit)
    
    @staticmethod
    def get_favorite(db: Session, favorite_id: uuid.UUID):
        return FavoriteRepository.get_favorite(db, favorite_id)
    
    @staticmethod
    def create_favorite(db: Session, favorite: FavoriteCreate, user_id: uuid.UUID):
        return FavoriteRepository.create_favorite(db, name=favorite.name, user_id=user_id)
    
    @staticmethod
    def update_favorite(db: Session, favorite_id: uuid.UUID, favorite: FavoriteUpdate):
        return FavoriteRepository.update_favorite(db, favorite_id, name=favorite.name)
    
    @staticmethod
    def delete_favorite(db: Session, favorite_id: uuid.UUID):
        return FavoriteRepository.delete_favorite(db, favorite_id)
    
    @staticmethod
    def add_prompt_to_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID):
        return FavoriteRepository.add_prompt_to_favorite(db, favorite_id, prompt_id)
    
    @staticmethod
    def remove_prompt_from_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID):
        return FavoriteRepository.remove_prompt_from_favorite(db, favorite_id, prompt_id)
    
    @staticmethod
    def get_prompts_in_favorite(db: Session, favorite_id: uuid.UUID, skip: int = 0, limit: int = 100):
        return FavoriteRepository.get_prompts_in_favorite(db, favorite_id, skip, limit)
    
    @staticmethod
    def is_prompt_in_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID):
        return FavoriteRepository.is_prompt_in_favorite(db, favorite_id, prompt_id)
        
    @staticmethod
    def get_prompt_in_favorite(db: Session, favorite_id: uuid.UUID, prompt_id: uuid.UUID):
        """获取收藏夹中特定提示词的详细信息"""
        return FavoriteRepository.get_prompt_in_favorite(db, favorite_id, prompt_id)
