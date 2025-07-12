import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

class UsageType(str, PyEnum):
    """使用类型枚举"""
    COPY = "copy"  # 复制提示词
    APPLY = "apply"  # 应用提示词
    VIEW = "view"  # 查看提示词详情
    FORK = "fork"  # Fork提示词

class Usage(Base):
    """提示词使用记录模型"""
    __tablename__ = "usages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # 允许匿名使用
    usage_type = Column(String, nullable=False)  # 使用类型：复制、应用等
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    prompt = relationship("Prompt", back_populates="usages")
    user = relationship("User", back_populates="usages")
    
    # 索引
    __table_args__ = (
        Index("ix_usages_prompt_id", "prompt_id"),
        Index("ix_usages_user_id", "user_id"),
        Index("ix_usages_created_at", "created_at"),
    )

# 更新Prompt模型中的关系（这部分需要在Prompt模型中添加）
# 在app/prompts/models.py中添加：
# usages = relationship("Usage", back_populates="prompt", cascade="all, delete-orphan")

# 更新User模型中的关系（这部分需要在User模型中添加）
# 在app/auth/models.py中添加：
# usages = relationship("Usage", back_populates="user", cascade="all, delete-orphan")
