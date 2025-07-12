from sqlalchemy import Column, String, DateTime, func, UUID, ForeignKey, Integer
from sqlalchemy.orm import relationship, backref
import uuid
from datetime import datetime

from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系定义
    parent = relationship("Category", remote_side=[id], backref=backref("children", lazy="joined"))
    prompts = relationship("Prompt", back_populates="category")
    
    def __repr__(self):
        return f"<Category {self.name}>"
