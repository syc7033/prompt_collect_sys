from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
import os
import shutil

# 确保静态文件目录存在
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(static_dir, exist_ok=True)

from app.config import settings
from app.auth.routers import router as auth_router
from app.prompts.routers import router as prompts_router
from app.search.routers import router as search_router
from app.ratings.routers import router as ratings_router
from app.usage.routers import router as usage_router
from app.categories.routers import router as categories_router
from app.favorites.routers import router as favorites_router
from app.stats.routers import router as stats_router
from app.profile.routers import router as profile_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI提示词知识库平台API",
    version="1.0.0",
    docs_url=None  # 禁用默认的docs URL
)

# 配置CORS - 使用更宽松的配置解决跨域问题
print(f"CORS 配置: 允许的源 = {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，仅在开发环境中使用
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 注册路由
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(prompts_router, prefix="/api/prompts", tags=["提示词"])
app.include_router(search_router, prefix="/api/search", tags=["搜索"])
app.include_router(ratings_router, prefix="/api", tags=["评分与评论"])
app.include_router(usage_router, prefix="/api", tags=["使用统计"])
app.include_router(categories_router, prefix="/api", tags=["分类管理"])
app.include_router(favorites_router, prefix="/api", tags=["收藏夹"])
app.include_router(stats_router, prefix="/api", tags=["统计分析"])
app.include_router(profile_router, prefix="/api", tags=["个人中心"])

# 自定义文档路由，使用本地静态文件
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - API文档",
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",
    )

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/api/health", tags=["健康检查"])
async def health_check():
    return {"status": "ok"}
