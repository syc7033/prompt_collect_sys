from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

# 获取数据库URL
database_url = os.getenv("DATABASE_URL")
print(f"尝试连接到数据库: {database_url}")

try:
    # 创建数据库引擎
    engine = create_engine(database_url)
    
    # 尝试连接并执行简单查询
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("数据库连接成功!")
        print(f"查询结果: {result.fetchone()}")
        
except Exception as e:
    print(f"连接数据库时出错: {e}")
