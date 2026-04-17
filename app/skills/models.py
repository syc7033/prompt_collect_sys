from sqlalchemy import Column, String, Boolean, DateTime, func, UUID, ForeignKey, Integer, ARRAY, Text
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    target_tools = Column(ARRAY(String), nullable=True)
    is_public = Column(Boolean, default=True)
    fork_from = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="skills")
    category = relationship("Category")
    skill_prompts = relationship("SkillPrompt", back_populates="skill", cascade="all, delete-orphan", order_by="SkillPrompt.order_index")

    def __repr__(self):
        return f"<Skill {self.title}>"


class SkillPrompt(Base):
    __tablename__ = "skill_prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id"), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    role = Column(String, nullable=False, default="instruction")

    skill = relationship("Skill", back_populates="skill_prompts")
    prompt = relationship("Prompt")

    def __repr__(self):
        return f"<SkillPrompt skill={self.skill_id} prompt={self.prompt_id} role={self.role}>"
