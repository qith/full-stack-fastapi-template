from functools import wraps
from typing import Callable, Any
from fastapi import HTTPException, Depends
from sqlmodel import Session
from app.core.db import engine
from app.services.permission_service import PermissionService
from app.models_extended import User


def require_permission(resource: str, action: str):
    """
    权限检查装饰器
    
    Args:
        resource: 资源类型，如 "users", "items", "admin"
        action: 操作类型，如 "read", "write", "delete"
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从参数中获取当前用户
            current_user = None
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                    break
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # 检查权限
            with Session(engine) as session:
                permission_service = PermissionService(session)
                
                # 超级用户拥有所有权限
                if permission_service.is_superuser(str(current_user.id)):
                    return await func(*args, **kwargs)
                
                # 检查特定权限
                if not permission_service.has_permission(str(current_user.id), resource, action):
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Insufficient permissions. Required: {resource}:{action}"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_superuser(func: Callable) -> Callable:
    """要求超级用户权限的装饰器"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # 从参数中获取当前用户
        current_user = None
        for arg in args:
            if isinstance(arg, User):
                current_user = arg
                break
        
        for key, value in kwargs.items():
            if isinstance(value, User):
                current_user = value
                break
        
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Superuser privileges required")
        
        return await func(*args, **kwargs)
    return wrapper


def require_any_permission(permissions: list[tuple[str, str]]):
    """
    要求拥有任意一个权限的装饰器
    
    Args:
        permissions: 权限列表，格式为 [(resource, action), ...]
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从参数中获取当前用户
            current_user = None
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                    break
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # 检查权限
            with Session(engine) as session:
                permission_service = PermissionService(session)
                
                # 超级用户拥有所有权限
                if permission_service.is_superuser(str(current_user.id)):
                    return await func(*args, **kwargs)
                
                # 检查是否有任意一个权限
                has_any_permission = any(
                    permission_service.has_permission(str(current_user.id), resource, action)
                    for resource, action in permissions
                )
                
                if not has_any_permission:
                    required_perms = " or ".join([f"{r}:{a}" for r, a in permissions])
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Insufficient permissions. Required: {required_perms}"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_all_permissions(permissions: list[tuple[str, str]]):
    """
    要求拥有所有权限的装饰器
    
    Args:
        permissions: 权限列表，格式为 [(resource, action), ...]
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从参数中获取当前用户
            current_user = None
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                    break
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # 检查权限
            with Session(engine) as session:
                permission_service = PermissionService(session)
                
                # 超级用户拥有所有权限
                if permission_service.is_superuser(str(current_user.id)):
                    return await func(*args, **kwargs)
                
                # 检查是否有所有权限
                has_all_permissions = all(
                    permission_service.has_permission(str(current_user.id), resource, action)
                    for resource, action in permissions
                )
                
                if not has_all_permissions:
                    required_perms = " and ".join([f"{r}:{a}" for r, a in permissions])
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Insufficient permissions. Required: {required_perms}"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
