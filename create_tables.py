from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from app.database import Base
from app.auth.models import User
from app.prompts.models import Prompt, PromptHistory

# 加载.env文件中的环境变量
load_dotenv()

# 获取数据库URL
database_url = os.getenv("DATABASE_URL")
print(f"连接到数据库: {database_url}")

try:
    # 创建数据库引擎
    engine = create_engine(database_url)
    
    # 创建所有表
    print("开始创建数据库表...")
    Base.metadata.create_all(engine)
    print("数据库表创建成功!")
    
except Exception as e:
    print(f"创建数据库表时出错: {e}")
