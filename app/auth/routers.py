from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging
import traceback

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.database import get_db
from app.auth.schemas import User, UserCreate, UserUpdate, Token, ChangePasswordRequest
from app.auth.services import AuthService
from app.auth.dependencies import create_access_token, get_current_user, get_current_active_superuser
from app.config import settings

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """
    注册新用户
    """
    try:
        logger.info(f"尝试注册新用户: {user_in.username}, {user_in.email}")
        user = AuthService.create_user(db, user_in)
        logger.info(f"用户注册成功: {user.username}")
        return user
    except ValueError as e:
        logger.warning(f"用户注册失败 - 验证错误: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        error_msg = f"用户注册失败 - 未处理异常: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器内部错误，请稍后再试"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    用户登录获取令牌
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码不正确",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前登录用户信息
    """
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新当前登录用户信息
    """
    user = AuthService.update_user(db, current_user, user_in)
    return user

@router.put("/change-password", response_model=User)
async def change_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    修改当前登录用户的密码
    """
    try:
        user = AuthService.change_password(
            db, 
            current_user, 
            password_data.old_password, 
            password_data.new_password
        )
        logger.info(f"用户 {user.username} 成功修改密码")
        return user
    except ValueError as e:
        logger.warning(f"用户 {current_user.username} 修改密码失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        error_msg = f"修改密码失败 - 未处理异常: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器内部错误，请稍后再试"
        )
