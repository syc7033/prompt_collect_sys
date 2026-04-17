from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.auth.dependencies import get_current_user, get_current_user_optional
from app.auth.models import User
from app.skills.schemas import (
    Skill, SkillCreate, SkillUpdate, SkillFilter, PaginatedSkillResponse
)
from app.skills.services import SkillService

router = APIRouter()


@router.post("", response_model=Skill, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SkillService.create_skill(db, skill_in, current_user.id)


@router.get("", response_model=PaginatedSkillResponse)
async def read_skills(
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    target_tools: Optional[List[str]] = Query(None),
    author_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    filter_params = SkillFilter(
        search=search,
        tags=tags,
        target_tools=target_tools,
        author_id=author_id,
    )
    return SkillService.get_skills(db, skip, limit, filter_params)


@router.get("/{skill_id}", response_model=Skill)
async def read_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    try:
        return SkillService.get_skill(db, skill_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{skill_id}", response_model=Skill)
async def update_skill(
    skill_id: uuid.UUID,
    skill_in: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return SkillService.update_skill(db, skill_id, skill_in, current_user.id)
    except ValueError as e:
        code = status.HTTP_404_NOT_FOUND if "不存在" in str(e) else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=str(e))


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        SkillService.delete_skill(db, skill_id, current_user.id, current_user.is_superuser)
    except ValueError as e:
        code = status.HTTP_404_NOT_FOUND if "不存在" in str(e) else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=str(e))


@router.get("/{skill_id}/export", response_class=PlainTextResponse)
async def export_skill(
    skill_id: uuid.UUID,
    format: str = Query("markdown", regex="^(cursor|claude|copilot|markdown)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    try:
        requester_id = current_user.id if current_user else None
        content = SkillService.export_skill(db, skill_id, format, requester_id)
        filenames = {
            "cursor": ".cursorrules",
            "claude": "CLAUDE.md",
            "copilot": "copilot-instructions.md",
            "markdown": "skill-export.md",
        }
        filename = filenames.get(format, "skill-export.md")
        return PlainTextResponse(
            content=content,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
