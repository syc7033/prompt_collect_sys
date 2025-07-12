from sqlalchemy import Column, String, Boolean, DateTime, func, UUID, Text
from sqlalchemy.orm import relationship
import uuid

from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 个人资料字段
    avatar_url = Column(String, nullable=True)  # 头像URL
    display_name = Column(String, nullable=True)  # 显示名称
    bio = Column(Text, nullable=True)  # 个人简介
    website = Column(String, nullable=True)  # 个人网站
    location = Column(String, nullable=True)  # 位置
    profession = Column(String, nullable=True)  # 职业
    interests = Column(String, nullable=True)  # 兴趣标签，以逗号分隔
    
    # 关系定义
    prompts = relationship("Prompt", back_populates="creator")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user")
    helpful_marks = relationship("HelpfulMark", back_populates="user")
    usages = relationship("Usage", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"
