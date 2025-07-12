from sqlalchemy import Column, String, DateTime, func, UUID, ForeignKey, Integer, ARRAY, JSON, Float
from sqlalchemy.orm import relationship
import uuid

from app.database import Base

class Prompt(Base):
    __tablename__ = "prompts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    content = Column(String, nullable=False)
    description = Column(String, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    version = Column(Integer, default=1)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id"), nullable=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    average_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    
    # 关系定义
    creator = relationship("User", back_populates="prompts")
    category = relationship("Category", back_populates="prompts")
    children = relationship("Prompt", backref="parent", remote_side=[id])
    histories = relationship("PromptHistory", back_populates="prompt", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="prompt", cascade="all, delete-orphan")
    usages = relationship("Usage", back_populates="prompt", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Prompt {self.title}>"

class PromptHistory(Base):
    __tablename__ = "prompt_histories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id"), nullable=False)
    snapshot = Column(JSON, nullable=False)  # 存储提示词的历史快照
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系定义
    prompt = relationship("Prompt", back_populates="histories")
    
    def __repr__(self):
        return f"<PromptHistory {self.prompt_id} v{self.version}>"
