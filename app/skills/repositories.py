from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
import uuid

from app.skills.models import Skill, SkillPrompt
from app.skills.schemas import SkillCreate, SkillUpdate, SkillFilter


class SkillRepository:
    @staticmethod
    def create(db: Session, skill_in: SkillCreate, author_id: uuid.UUID) -> Skill:
        db_skill = Skill(
            title=skill_in.title,
            description=skill_in.description,
            tags=skill_in.tags,
            target_tools=skill_in.target_tools,
            is_public=skill_in.is_public,
            category_id=skill_in.category_id,
            author_id=author_id,
        )
        db.add(db_skill)
        db.flush()

        for sp in skill_in.skill_prompts:
            db_sp = SkillPrompt(
                skill_id=db_skill.id,
                prompt_id=sp.prompt_id,
                order_index=sp.order_index,
                role=sp.role,
            )
            db.add(db_sp)

        db.commit()
        db.refresh(db_skill)
        return db_skill

    @staticmethod
    def get_by_id(db: Session, skill_id: uuid.UUID) -> Optional[Skill]:
        return db.query(Skill).filter(Skill.id == skill_id).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        filter_params: Optional[SkillFilter] = None,
    ) -> Dict[str, Any]:
        query = db.query(Skill).filter(Skill.is_public == True)

        if filter_params:
            if filter_params.search:
                search = f"%{filter_params.search}%"
                query = query.filter(
                    or_(
                        Skill.title.ilike(search),
                        Skill.description.ilike(search),
                    )
                )
            if filter_params.tags:
                for tag in filter_params.tags:
                    query = query.filter(Skill.tags.contains([tag]))
            if filter_params.target_tools:
                for tool in filter_params.target_tools:
                    query = query.filter(Skill.target_tools.contains([tool]))
            if filter_params.author_id:
                query = query.filter(Skill.author_id == filter_params.author_id)

        total = query.count()
        skills = query.order_by(Skill.updated_at.desc()).offset(skip).limit(limit).all()

        return {
            "data": skills,
            "total": total,
            "page": skip // limit + 1 if limit > 0 else 1,
            "size": limit,
        }

    @staticmethod
    def update(db: Session, skill: Skill, skill_in: SkillUpdate) -> Skill:
        update_data = skill_in.dict(exclude_unset=True)
        skill_prompts_data = update_data.pop("skill_prompts", None)

        for field, value in update_data.items():
            setattr(skill, field, value)

        if skill_prompts_data is not None:
            db.query(SkillPrompt).filter(SkillPrompt.skill_id == skill.id).delete()
            for sp in skill_prompts_data:
                db_sp = SkillPrompt(
                    skill_id=skill.id,
                    prompt_id=sp["prompt_id"],
                    order_index=sp.get("order_index", 0),
                    role=sp.get("role", "instruction"),
                )
                db.add(db_sp)

        db.add(skill)
        db.commit()
        db.refresh(skill)
        return skill

    @staticmethod
    def delete(db: Session, skill_id: uuid.UUID) -> bool:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            return False
        db.delete(skill)
        db.commit()
        return True
