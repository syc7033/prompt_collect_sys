from sqlalchemy import Column, String, DateTime, func, UUID, ForeignKey, Table
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base

# 收藏夹与提示词的多对多关联表
favorite_prompt = Table(
    "favorite_prompt",
    Base.metadata,
    Column("favorite_id", UUID(as_uuid=True), ForeignKey("favorites.id"), primary_key=True),
    Column("prompt_id", UUID(as_uuid=True), ForeignKey("prompts.id"), primary_key=True),
    Column("added_at", DateTime, default=datetime.utcnow)
)

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系定义
    user = relationship("User", back_populates="favorites")
    prompts = relationship("Prompt", secondary=favorite_prompt, backref="favorites")
    
    def __repr__(self):
        return f"<Favorite {self.name}>"
