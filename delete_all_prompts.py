import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入应用模块
from app.database import get_db, Base, engine
from app.prompts.models import Prompt, PromptHistory
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

def delete_all_prompts():
    """删除数据库中所有用户的提示词"""
    # 获取数据库会话
    db = next(get_test_db())
    
    try:
        # 先获取所有提示词的数量，用于确认
        prompt_count = db.query(Prompt).count()
        logger.info(f"数据库中共有 {prompt_count} 个提示词")
        
        # 获取所有提示词历史记录的数量
        history_count = db.query(PromptHistory).count()
        logger.info(f"数据库中共有 {history_count} 个提示词历史记录")
        
        # 确认是否继续删除
        confirm = input(f"确认要删除所有 {prompt_count} 个提示词和 {history_count} 个历史记录吗？(y/n): ")
        if confirm.lower() != 'y':
            logger.info("操作已取消")
            return
        
        # 先删除所有提示词历史记录（因为外键约束）
        logger.info("正在删除所有提示词历史记录...")
        db.query(PromptHistory).delete()
        
        # 再删除所有提示词
        logger.info("正在删除所有提示词...")
        db.query(Prompt).delete()
        
        # 提交事务
        db.commit()
        
        # 确认删除成功
        new_prompt_count = db.query(Prompt).count()
        new_history_count = db.query(PromptHistory).count()
        
        logger.info(f"删除完成！当前数据库中有 {new_prompt_count} 个提示词和 {new_history_count} 个历史记录")
        
    except Exception as e:
        db.rollback()
        logger.error(f"删除过程中发生错误: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    # 再次确认
    print("警告：此操作将删除数据库中所有用户的所有提示词和历史记录！")
    print("此操作不可逆，请确保你已经备份了重要数据。")
    final_confirm = input("请输入 'DELETE ALL PROMPTS' 以确认操作: ")
    
    if final_confirm == "DELETE ALL PROMPTS":
        delete_all_prompts()
    else:
        print("操作已取消")
