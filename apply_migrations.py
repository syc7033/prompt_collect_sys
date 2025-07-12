import os
import sys
from dotenv import load_dotenv
from alembic import command
from alembic.config import Config

# 加载.env文件中的环境变量
load_dotenv()

def apply_migrations():
    """应用数据库迁移"""
    try:
        # 获取当前脚本的目录
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 创建Alembic配置
        alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
        
        # 应用迁移
        print("正在应用数据库迁移...")
        command.upgrade(alembic_cfg, "head")
        
        print("数据库迁移成功完成！")
        return True
    except Exception as e:
        print(f"数据库迁移失败: {str(e)}")
        return False

if __name__ == "__main__":
    apply_migrations()
