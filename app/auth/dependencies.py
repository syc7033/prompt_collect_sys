from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.config import settings
from app.database import get_db
from app.auth.models import User
from app.auth.schemas import TokenPayload

# OAuth2密码流的令牌URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# 可选的OAuth2密码流的令牌URL
from fastapi.security import OAuth2PasswordBearer as _OAuth2PasswordBearer

class OAuth2PasswordBearerOptional(_OAuth2PasswordBearer):
    async def __call__(self, request: Request = None) -> Optional[str]:
        try:
            return await super().__call__(request)
        except HTTPException:
            return None

oauth2_scheme_optional = OAuth2PasswordBearerOptional(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建JWT访问令牌
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    获取当前用户
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenPayload(sub=user_id, exp=payload.get("exp"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已停用")
    return user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    获取当前活跃的超级用户
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="权限不足"
        )
    return current_user

async def get_current_user_optional(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    """
    获取当前用户（可选）
    如果用户未登录，返回None而不是抛出异常
    """
    if token is None:
        return None
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        token_data = TokenPayload(sub=user_id, exp=payload.get("exp"))
    except JWTError:
        return None
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None or not user.is_active:
        return None
        
    return user
