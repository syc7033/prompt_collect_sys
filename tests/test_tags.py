import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入应用模块
from app.database import get_db, Base, engine
from app.prompts.models import Prompt
from app.auth.models import User
from app.config import settings

# 创建测试会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def main():
    # 获取数据库会话
    db = next(get_test_db())
    
    # 打印所有提示词及其标签
    print("=== 当前数据库中的提示词和标签 ===")
    prompts = db.query(Prompt).all()
    print(f"总共有 {len(prompts)} 个提示词")
    
    for prompt in prompts:
        print(f"ID: {prompt.id}")
        print(f"标题: {prompt.title}")
        print(f"标签: {prompt.tags}")
        print("-" * 50)
    
    # 检查是否有用户
    users = db.query(User).all()
    if not users:
        print("没有找到用户，请先创建用户")
        return
    
    # 添加一个带有API标签的测试提示词
    test_user = users[0]
    
    # 检查是否已经存在带有API标签的提示词
    api_prompts = db.query(Prompt).filter(Prompt.tags.contains(["API"])).all()
    if api_prompts:
        print(f"已经存在 {len(api_prompts)} 个带有API标签的提示词")
        return
    
    # 创建新的测试提示词
    new_prompt = Prompt(
        id=uuid.uuid4(),
        title="API测试提示词",
        content="这是一个用于测试API标签搜索的提示词",
        description="测试API标签搜索",
        tags=["API", "测试"],
        creator_id=test_user.id
    )
    
    # 添加到数据库
    db.add(new_prompt)
    db.commit()
    
    print("成功添加测试提示词，标签为: ['API', '测试']")
    
    # 验证添加是否成功
    api_prompts = db.query(Prompt).filter(Prompt.tags.contains(["API"])).all()
    print(f"现在有 {len(api_prompts)} 个带有API标签的提示词")

if __name__ == "__main__":
    main()
