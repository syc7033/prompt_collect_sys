from sqlalchemy import create_engine, inspect, text
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

# 获取数据库URL
database_url = os.getenv("DATABASE_URL")
print(f"连接到数据库: {database_url}")

try:
    # 创建数据库引擎
    engine = create_engine(database_url)
    
    # 获取检查器
    inspector = inspect(engine)
    
    # 获取所有表名
    tables = inspector.get_table_names()
    print(f"数据库中的表: {tables}")
    
    # 检查每个表的列
    for table in tables:
        print(f"\n表 '{table}' 的列:")
        for column in inspector.get_columns(table):
            print(f"  - {column['name']} ({column['type']})")
        
        # 检查索引
        print(f"\n表 '{table}' 的索引:")
        for index in inspector.get_indexes(table):
            print(f"  - {index['name']}: {index['column_names']}")
        
except Exception as e:
    print(f"检查数据库表时出错: {e}")
