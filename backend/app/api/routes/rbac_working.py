from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.db import engine
from app.models_rbac import Role, RolePublic
from app.api.deps import get_current_user

router = APIRouter(prefix="/rbac-working", tags=["rbac-working"])


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


@router.get("/permissions")
def get_permissions_working(current_user = Depends(get_current_user)):
    """获取所有权限 - 直接查询版本"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser privileges required")
    
    try:
        with Session(engine) as session:
            # 直接查询权限
            from app.models_rbac import Permission
            permissions = session.query(Permission).all()
            return [
                {
                    "id": str(perm.id),
                    "name": perm.name,
                    "resource": perm.resource,
                    "action": perm.action,
                    "description": perm.description
                }
                for perm in permissions
            ]
    except Exception as e:
        print(f"Error in get_permissions_working: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
