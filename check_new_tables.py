from sqlalchemy import inspect
from app.database import engine

def check_tables():
    """检查数据库中的表结构"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print("数据库中的表:")
    for table in tables:
        print(f"- {table}")
    
    # 检查categories表
    if 'categories' in tables:
        print("\n分类表(categories)的列:")
        for column in inspector.get_columns('categories'):
            print(f"- {column['name']}: {column['type']}")
    
    # 检查favorites表
    if 'favorites' in tables:
        print("\n收藏夹表(favorites)的列:")
        for column in inspector.get_columns('favorites'):
            print(f"- {column['name']}: {column['type']}")
    
    # 检查favorite_prompt表
    if 'favorite_prompt' in tables:
        print("\n收藏夹-提示词关联表(favorite_prompt)的列:")
        for column in inspector.get_columns('favorite_prompt'):
            print(f"- {column['name']}: {column['type']}")
    
    # 检查prompts表是否有新的category_id列
    if 'prompts' in tables:
        print("\n提示词表(prompts)的列:")
        columns = [col['name'] for col in inspector.get_columns('prompts')]
        if 'category_id' in columns:
            print("- category_id列已成功添加到prompts表中")
        else:
            print("- category_id列未添加到prompts表中")

if __name__ == "__main__":
    check_tables()
