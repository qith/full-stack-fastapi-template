from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from app.core.db import engine
from app.models_rbac import Role, RolePublic, Permission, PermissionPublic, UserRole, RolePermission
from app.api.deps import get_current_user
from app.services.rbac_service import RBACService

router = APIRouter(prefix="/rbac", tags=["rbac"])


# 请求模型
class PermissionCreate(BaseModel):
    name: str
    resource: str
    action: str
    description: str = None
    permission_type: str = "api"  # 权限类型：menu/button/api
    menu_path: str = None  # 菜单路径
    button_id: str = None  # 按钮标识

class PermissionUpdate(BaseModel):
    name: str = None
    resource: str = None
    action: str = None
    description: str = None
    permission_type: str = None
    menu_path: str = None
    button_id: str = None

class RoleCreate(BaseModel):
    name: str
    description: str = None

class RoleUpdate(BaseModel):
    name: str = None
    description: str = None


@router.get("/roles", response_model=List[RolePublic])
def get_roles_working(current_user = Depends(get_current_user)):
    """获取所有角色 - 直接查询版本"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            # 直接查询角色
            roles = session.query(Role).all()
            return [RolePublic(id=role.id, name=role.name, description=role.description) for role in roles]
    except Exception as e:
        print(f"Error in get_roles_working: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/permissions", response_model=List[PermissionPublic])
def get_permissions_working(current_user = Depends(get_current_user)):
    """获取所有权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            permissions = rbac_service.get_permissions()
            return [
                PermissionPublic(
                    id=perm.id,
                    name=perm.name,
                    resource=perm.resource,
                    action=perm.action,
                    description=perm.description,
                    permission_type=getattr(perm, 'permission_type', 'api'),
                    menu_path=getattr(perm, 'menu_path', None),
                    button_id=getattr(perm, 'button_id', None)
                )
                for perm in permissions
            ]
    except Exception as e:
        print(f"Error in get_permissions_working: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# 权限管理接口
@router.post("/permissions", response_model=PermissionPublic)
def create_permission(
    permission_data: PermissionCreate,
    current_user = Depends(get_current_user)
):
    """创建权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            permission = rbac_service.create_permission(
                permission_data.name, 
                permission_data.resource, 
                permission_data.action, 
                permission_data.description,
                permission_data.permission_type,
                permission_data.menu_path,
                permission_data.button_id
            )
            return PermissionPublic(
                id=permission.id,
                name=permission.name,
                resource=permission.resource,
                action=permission.action,
                description=permission.description,
                permission_type=getattr(permission, 'permission_type', 'api'),
                menu_path=getattr(permission, 'menu_path', None),
                button_id=getattr(permission, 'button_id', None)
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating permission: {str(e)}")


@router.put("/permissions/{permission_id}", response_model=PermissionPublic)
def update_permission(
    permission_id: str,
    permission_data: PermissionUpdate,
    current_user = Depends(get_current_user)
):
    """更新权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            permission = rbac_service.update_permission(
                permission_id, 
                permission_data.name, 
                permission_data.resource, 
                permission_data.action, 
                permission_data.description,
                permission_data.permission_type,
                permission_data.menu_path,
                permission_data.button_id
            )
            return PermissionPublic(
                id=permission.id,
                name=permission.name,
                resource=permission.resource,
                action=permission.action,
                description=permission.description,
                permission_type=getattr(permission, 'permission_type', 'api'),
                menu_path=getattr(permission, 'menu_path', None),
                button_id=getattr(permission, 'button_id', None)
            )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating permission: {str(e)}")


@router.delete("/permissions/{permission_id}")
def delete_permission(
    permission_id: str,
    current_user = Depends(get_current_user)
):
    """删除权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.delete_permission(permission_id)
            if not success:
                raise HTTPException(status_code=404, detail="Permission not found")
            return {"message": "Permission deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting permission: {str(e)}")


# 角色管理接口
@router.post("/roles", response_model=RolePublic)
def create_role(
    role_data: RoleCreate,
    current_user = Depends(get_current_user)
):
    """创建角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            role = rbac_service.create_role(role_data.name, role_data.description)
            return RolePublic(
                id=role.id,
                name=role.name,
                description=role.description,
                permissions=[]
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating role: {str(e)}")


@router.put("/roles/{role_id}", response_model=RolePublic)
def update_role(
    role_id: str,
    role_data: RoleUpdate,
    current_user = Depends(get_current_user)
):
    """更新角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            role = rbac_service.update_role(role_id, role_data.name, role_data.description)
            # 获取角色的权限
            permissions = rbac_service.get_role_permissions(role_id)
            return RolePublic(
                id=role.id,
                name=role.name,
                description=role.description,
                permissions=[
                    PermissionPublic(
                        id=perm.id,
                        name=perm.name,
                        resource=perm.resource,
                        action=perm.action,
                        description=perm.description,
                        permission_type=getattr(perm, 'permission_type', 'api'),
                        menu_path=getattr(perm, 'menu_path', None),
                        button_id=getattr(perm, 'button_id', None)
                    )
                    for perm in permissions
                ]
            )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating role: {str(e)}")


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: str,
    current_user = Depends(get_current_user)
):
    """删除角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.delete_role(role_id)
            if not success:
                raise HTTPException(status_code=404, detail="Role not found")
            return {"message": "Role deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting role: {str(e)}")


# 角色权限管理接口
@router.post("/roles/{role_id}/permissions/{permission_id}")
def assign_permission_to_role(
    role_id: str,
    permission_id: str,
    current_user = Depends(get_current_user)
):
    """为角色分配权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.assign_permission_to_role(role_id, permission_id)
            if not success:
                raise HTTPException(status_code=400, detail="Permission already assigned or role/permission not found")
            return {"message": "Permission assigned to role successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning permission: {str(e)}")


@router.delete("/roles/{role_id}/permissions/{permission_id}")
def remove_permission_from_role(
    role_id: str,
    permission_id: str,
    current_user = Depends(get_current_user)
):
    """从角色移除权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.remove_permission_from_role(role_id, permission_id)
            if not success:
                raise HTTPException(status_code=400, detail="Permission not assigned or role/permission not found")
            return {"message": "Permission removed from role successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing permission: {str(e)}")


@router.get("/roles/{role_id}/permissions", response_model=List[PermissionPublic])
def get_role_permissions(
    role_id: str,
    current_user = Depends(get_current_user)
):
    """获取角色的权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            permissions = rbac_service.get_role_permissions(role_id)
            return [
                PermissionPublic(
                    id=perm.id,
                    name=perm.name,
                    resource=perm.resource,
                    action=perm.action,
                    description=perm.description,
                    permission_type=getattr(perm, 'permission_type', 'api'),
                    menu_path=getattr(perm, 'menu_path', None),
                    button_id=getattr(perm, 'button_id', None)
                )
                for perm in permissions
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting role permissions: {str(e)}")


# 用户角色管理接口
@router.post("/users/{user_id}/roles/{role_id}")
def assign_role_to_user(
    user_id: str,
    role_id: str,
    current_user = Depends(get_current_user)
):
    """为用户分配角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.assign_role_to_user(user_id, role_id)
            if not success:
                raise HTTPException(status_code=400, detail="Role already assigned or user/role not found")
            return {"message": "Role assigned to user successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning role: {str(e)}")


@router.delete("/users/{user_id}/roles/{role_id}")
def remove_role_from_user(
    user_id: str,
    role_id: str,
    current_user = Depends(get_current_user)
):
    """从用户移除角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            success = rbac_service.remove_role_from_user(user_id, role_id)
            if not success:
                raise HTTPException(status_code=400, detail="Role not assigned or user/role not found")
            return {"message": "Role removed from user successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing role: {str(e)}")


@router.get("/users/{user_id}/roles", response_model=List[RolePublic])
def get_user_roles(
    user_id: str,
    current_user = Depends(get_current_user)
):
    """获取用户的角色"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            roles = rbac_service.get_user_roles(user_id)
            return [
                RolePublic(
                    id=role.id,
                    name=role.name,
                    description=role.description,
                    permissions=[]
                )
                for role in roles
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user roles: {str(e)}")


@router.get("/users/{user_id}/permissions", response_model=List[PermissionPublic])
def get_user_permissions(
    user_id: str,
    current_user = Depends(get_current_user)
):
    """获取用户的权限"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            rbac_service = RBACService(session)
            permissions = rbac_service.get_user_permissions(user_id)
            return [
                PermissionPublic(
                    id=perm.id,
                    name=perm.name,
                    resource=perm.resource,
                    action=perm.action,
                    description=perm.description,
                    permission_type=getattr(perm, 'permission_type', 'api'),
                    menu_path=getattr(perm, 'menu_path', None),
                    button_id=getattr(perm, 'button_id', None)
                )
                for perm in permissions
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user permissions: {str(e)}")
