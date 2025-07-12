from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import logging

from app.config import settings

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建数据库引擎，添加连接池配置
engine = create_engine(
    settings.DATABASE_URL,
    # 连接池配置
    poolclass=QueuePool,
    pool_size=10,  # 连接池大小
    max_overflow=20,  # 最大溢出连接数
    pool_timeout=30,  # 连接超时时间（秒）
    pool_recycle=1800,  # 连接回收时间（秒）
    pool_pre_ping=True,  # 连接前ping，确保连接有效
    connect_args={
        "connect_timeout": 10,  # 连接超时（秒）
        "application_name": "prompt_system",  # 应用名称，便于在数据库中识别
    }
)

# 添加引擎连接事件监听器
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    logger.info("数据库连接已创建")

@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    logger.debug("数据库连接已检出")

@event.listens_for(engine, "checkin")
def checkin(dbapi_connection, connection_record):
    logger.debug("数据库连接已归还")

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

# 获取数据库会话的依赖函数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
