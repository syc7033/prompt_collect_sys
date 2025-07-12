import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    score = Column(Integer, nullable=False)  # 1-5星
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    prompt = relationship("Prompt", back_populates="ratings")
    user = relationship("User", back_populates="ratings")
    helpful_marks = relationship("HelpfulMark", back_populates="rating", cascade="all, delete-orphan")

class HelpfulMark(Base):
    __tablename__ = "helpful_marks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rating_id = Column(UUID(as_uuid=True), ForeignKey("ratings.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    rating = relationship("Rating", back_populates="helpful_marks")
    user = relationship("User", back_populates="helpful_marks")
