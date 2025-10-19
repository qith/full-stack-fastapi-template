from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.db import engine
from app.services.permission_service import PermissionService
from app.models_extended import (
    Role, Permission, User, UserRole, RolePermission,
    RolePublic, PermissionPublic, UserPublic, Message
)
from app.decorators.permissions import require_permission, require_superuser

router = APIRouter(prefix="/permissions", tags=["permissions"])


def get_permission_service() -> PermissionService:
    """获取权限服务实例"""
    session = Session(engine)
    return PermissionService(session)


# 权限相关接口
@router.get("/", response_model=List[PermissionPublic])
@require_permission("admin", "access")
def get_permissions(permission_service: PermissionService = Depends(get_permission_service)):
    """获取所有权限"""
    return permission_service.get_permissions()


@router.post("/", response_model=PermissionPublic)
@require_superuser
def create_permission(
    name: str,
    resource: str,
    action: str,
    description: str = None,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """创建权限"""
    return permission_service.create_permission(name, resource, action, description)


# 角色相关接口
@router.get("/roles", response_model=List[RolePublic])
@require_permission("admin", "access")
def get_roles(permission_service: PermissionService = Depends(get_permission_service)):
    """获取所有角色"""
    return permission_service.get_roles()


@router.post("/roles", response_model=RolePublic)
@require_superuser
def create_role(
    name: str,
    description: str = None,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """创建角色"""
    return permission_service.create_role(name, description)


@router.get("/roles/{role_id}", response_model=RolePublic)
@require_permission("admin", "access")
def get_role(role_id: str, permission_service: PermissionService = Depends(get_permission_service)):
    """获取特定角色"""
    role = permission_service.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


# 用户角色管理
@router.post("/users/{user_id}/roles/{role_id}", response_model=Message)
@require_superuser
def assign_role_to_user(
    user_id: str,
    role_id: str,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """为用户分配角色"""
    success = permission_service.assign_role_to_user(user_id, role_id)
    if not success:
        raise HTTPException(status_code=400, detail="Role already assigned or user/role not found")
    return Message(message="Role assigned successfully")


@router.delete("/users/{user_id}/roles/{role_id}", response_model=Message)
@require_superuser
def remove_role_from_user(
    user_id: str,
    role_id: str,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """移除用户的角色"""
    success = permission_service.remove_role_from_user(user_id, role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    return Message(message="Role removed successfully")


@router.get("/users/{user_id}/roles", response_model=List[RolePublic])
@require_permission("admin", "access")
def get_user_roles(user_id: str, permission_service: PermissionService = Depends(get_permission_service)):
    """获取用户的角色"""
    return permission_service.get_user_roles(user_id)


@router.get("/users/{user_id}/permissions", response_model=List[PermissionPublic])
@require_permission("admin", "access")
def get_user_permissions(user_id: str, permission_service: PermissionService = Depends(get_permission_service)):
    """获取用户的权限"""
    return permission_service.get_user_permissions(user_id)


# 角色权限管理
@router.post("/roles/{role_id}/permissions/{permission_id}", response_model=Message)
@require_superuser
def assign_permission_to_role(
    role_id: str,
    permission_id: str,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """为角色分配权限"""
    success = permission_service.assign_permission_to_role(role_id, permission_id)
    if not success:
        raise HTTPException(status_code=400, detail="Permission already assigned or role/permission not found")
    return Message(message="Permission assigned successfully")


@router.delete("/roles/{role_id}/permissions/{permission_id}", response_model=Message)
@require_superuser
def remove_permission_from_role(
    role_id: str,
    permission_id: str,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """移除角色的权限"""
    success = permission_service.remove_permission_from_role(role_id, permission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Permission assignment not found")
    return Message(message="Permission removed successfully")


# 权限检查接口
@router.get("/check/{user_id}/{resource}/{action}")
@require_permission("admin", "access")
def check_permission(
    user_id: str,
    resource: str,
    action: str,
    permission_service: PermissionService = Depends(get_permission_service)
):
    """检查用户权限"""
    has_permission = permission_service.has_permission(user_id, resource, action)
    return {
        "user_id": user_id,
        "resource": resource,
        "action": action,
        "has_permission": has_permission
    }


# 初始化默认权限和角色
@router.post("/init", response_model=Message)
@require_superuser
def init_default_permissions(permission_service: PermissionService = Depends(get_permission_service)):
    """初始化默认权限和角色"""
    permission_service.init_default_permissions()
    return Message(message="Default permissions and roles initialized successfully")
