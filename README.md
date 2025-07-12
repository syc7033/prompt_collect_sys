# AI提示词知识库平台

这是一个用于管理和共享AI提示词的知识库平台，旨在帮助团队更高效地利用AI工具进行开发工作。

## 项目结构

```
├── app/                          # 主应用目录
│   ├── __init__.py               # 应用初始化
│   ├── main.py                   # 应用入口点
│   ├── config.py                 # 配置管理
│   ├── database.py               # 数据库连接管理
│   ├── auth/                     # 认证模块
│   │   ├── __init__.py
│   │   ├── models.py             # 用户模型
│   │   ├── schemas.py            # Pydantic模式
│   │   ├── dependencies.py       # 依赖函数(如获取当前用户)
│   │   ├── services.py           # 业务逻辑
│   │   └── routers.py            # API路由
│   ├── prompts/                  # 提示词核心模块
│   │   ├── __init__.py
│   │   ├── models.py             # 数据模型
│   │   ├── schemas.py            # Pydantic模式
│   │   ├── repositories.py       # 数据访问层
│   │   ├── services.py           # 业务逻辑
│   │   └── routers.py            # API路由
│   └── search/                   # 搜索模块
│       ├── __init__.py
│       ├── services.py           # 搜索业务逻辑
│       └── routers.py            # 搜索API路由
├── tests/                        # 测试目录
├── alembic/                      # 数据库迁移
│   ├── versions/                 # 迁移版本
│   └── alembic.ini               # Alembic配置
├── .env                          # 环境变量
├── requirements.txt              # 项目依赖
└── README.md                     # 项目说明
```

## 技术栈

- **后端框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **认证**: JWT
- **数据库迁移**: Alembic

## 功能特性

- 用户认证与授权
- 提示词的创建、读取、更新和删除
- 提示词版本控制
- 标签管理
- 全文搜索
- 相似提示词推荐

## 开发环境设置

### 前提条件

- Python 3.8+
- PostgreSQL

### 安装步骤

1. 克隆仓库

2. 创建虚拟环境并激活
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. 安装依赖
   ```
   pip install -r requirements.txt
   ```

4. 创建PostgreSQL数据库
   ```
   createdb prompt_system
   ```

5. 配置环境变量
   创建`.env`文件并设置以下变量:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prompt_system
   SECRET_KEY=your_secret_key
   ```

6. 运行数据库迁移
   ```
   alembic upgrade head
   ```

7. 启动开发服务器
   ```
   uvicorn app.main:app --reload
   ```

## API文档

启动服务器后，可以通过以下URL访问API文档:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 数据库模型

### 用户模型 (User)
- id: UUID (主键)
- email: 字符串 (唯一)
- username: 字符串 (唯一)
- hashed_password: 字符串
- is_active: 布尔值
- is_superuser: 布尔值
- created_at: 日期时间
- updated_at: 日期时间

### 提示词模型 (Prompt)
- id: UUID (主键)
- title: 字符串
- content: 字符串
- description: 字符串 (可选)
- tags: 字符串数组
- version: 整数
- parent_id: UUID (可选，自引用)
- creator_id: UUID (外键 -> User)
- created_at: 日期时间
- updated_at: 日期时间

### 提示词历史模型 (PromptHistory)
- id: UUID (主键)
- prompt_id: UUID (外键 -> Prompt)
- snapshot: JSON (提示词的历史快照)
- version: 整数
- created_at: 日期时间
