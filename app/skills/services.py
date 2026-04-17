from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import uuid

from app.skills.repositories import SkillRepository
from app.skills.schemas import SkillCreate, SkillUpdate, SkillFilter
from app.skills.models import Skill


class SkillService:
    @staticmethod
    def create_skill(db: Session, skill_in: SkillCreate, author_id: uuid.UUID) -> Skill:
        return SkillRepository.create(db, skill_in, author_id)

    @staticmethod
    def get_skill(db: Session, skill_id: uuid.UUID) -> Skill:
        skill = SkillRepository.get_by_id(db, skill_id)
        if not skill:
            raise ValueError("Skill 不存在")
        return skill

    @staticmethod
    def get_skills(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        filter_params: Optional[SkillFilter] = None,
    ) -> Dict[str, Any]:
        return SkillRepository.get_multi(db, skip, limit, filter_params)

    @staticmethod
    def update_skill(
        db: Session,
        skill_id: uuid.UUID,
        skill_in: SkillUpdate,
        user_id: uuid.UUID,
    ) -> Skill:
        skill = SkillRepository.get_by_id(db, skill_id)
        if not skill:
            raise ValueError("Skill 不存在")
        if skill.author_id != user_id:
            raise ValueError("没有权限修改此 Skill")
        return SkillRepository.update(db, skill, skill_in)

    @staticmethod
    def delete_skill(
        db: Session,
        skill_id: uuid.UUID,
        user_id: uuid.UUID,
        is_superuser: bool = False,
    ) -> bool:
        skill = SkillRepository.get_by_id(db, skill_id)
        if not skill:
            raise ValueError("Skill 不存在")
        if not is_superuser and skill.author_id != user_id:
            raise ValueError("没有权限删除此 Skill")
        return SkillRepository.delete(db, skill_id)

    @staticmethod
    def export_skill(db: Session, skill_id: uuid.UUID, fmt: str, requester_id: Optional[uuid.UUID] = None) -> str:
        skill = SkillRepository.get_by_id(db, skill_id)
        if not skill:
            raise ValueError("Skill 不存在")
        if not skill.is_public and skill.author_id != requester_id:
            raise ValueError("该 Skill 不公开，无法导出")

        ordered = sorted(skill.skill_prompts, key=lambda sp: sp.order_index)

        system_parts = [sp.prompt.content for sp in ordered if sp.role == "system" and sp.prompt]
        instruction_parts = [sp.prompt.content for sp in ordered if sp.role == "instruction" and sp.prompt]
        example_parts = [sp.prompt.content for sp in ordered if sp.role == "example" and sp.prompt]

        if fmt == "cursor":
            lines = []
            if system_parts:
                lines.extend(system_parts)
                lines.append("")
            lines.extend(instruction_parts)
            if example_parts:
                lines.append("")
                lines.append("# Examples")
                lines.extend(example_parts)
            return "\n".join(lines)

        if fmt == "claude":
            lines = [f"# {skill.title}", ""]
            if skill.description:
                lines += [skill.description, ""]
            if system_parts:
                lines += ["## Overview", ""] + system_parts + [""]
            if instruction_parts:
                lines += ["## Instructions", ""]
                for i, part in enumerate(instruction_parts, 1):
                    lines.append(f"{i}. {part}")
                lines.append("")
            if example_parts:
                lines += ["## Examples", ""] + example_parts
            return "\n".join(lines)

        if fmt == "copilot":
            lines = [f"# {skill.title}", ""]
            if skill.description:
                lines += [skill.description, ""]
            all_instructions = system_parts + instruction_parts
            for part in all_instructions:
                lines.append(f"- {part}")
            if example_parts:
                lines += ["", "## Examples"] + example_parts
            return "\n".join(lines)

        lines = [f"# {skill.title}", ""]
        if skill.description:
            lines += [skill.description, ""]
        if system_parts:
            lines += ["## System", ""] + system_parts + [""]
        if instruction_parts:
            lines += ["## Instructions", ""] + instruction_parts + [""]
        if example_parts:
            lines += ["## Examples", ""] + example_parts
        return "\n".join(lines)
