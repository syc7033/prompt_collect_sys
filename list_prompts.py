#!/usr/bin/env python3
from app.database import SessionLocal
from app.auth.models import User
from app.categories.models import Category
from app.prompts.models import Prompt, PromptHistory
from app.ratings.models import Rating
from app.favorites.models import Favorite
from app.usage.models import Usage
from app.skills.models import Skill, SkillPrompt

db = SessionLocal()
prompts = db.query(Prompt).limit(30).all()
for p in prompts:
    print(f"{p.id} | {p.title} | {p.tags}")
db.close()
