#!/usr/bin/env python3
from app.database import Base, engine
from app.auth.models import User
from app.categories.models import Category
from app.prompts.models import Prompt, PromptHistory
from app.ratings.models import Rating
from app.favorites.models import Favorite
from app.usage.models import Usage
from app.skills.models import Skill, SkillPrompt

Base.metadata.create_all(bind=engine, tables=[
    Base.metadata.tables['skills'],
    Base.metadata.tables['skill_prompts']
])

print("✓ skills 表创建成功")
print("✓ skill_prompts 表创建成功")
