from pydantic import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

class Settings(BaseSettings):
    # 项目基本信息
    PROJECT_NAME: str = "AI提示词知识库平台"
    API_V1_STR: str = "/api"
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/prompt_system")
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # CORS配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # 前端开发服务器
        "http://localhost:8000",  # 后端开发服务器
    ]
    
    # 管理员配置
    ADMIN_INVITE_CODE: str = os.getenv("ADMIN_INVITE_CODE", "PROMPT-ADMIN-2025")  # 默认邀请码，生产环境应通过环境变量设置
    
    class Config:
        case_sensitive = True

# 创建全局设置对象
settings = Settings()
