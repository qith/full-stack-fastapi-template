from typing import List, Optional
from sqlmodel import Session, select
from app.models import User
from app.models_extended import Role, Permission, UserRole, RolePermission


class PermissionService:
    def __init__(self, session: Session):
        self.session = session

    # 用户权限相关方法
    def get_user_permissions(self, user_id: str) -> List[Permission]:
        """获取用户的所有权限"""
        statement = (
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRole, RolePermission.role_id == UserRole.role_id)
            .where(UserRole.user_id == user_id)
        )
        return self.session.exec(statement).all()

    def get_user_roles(self, user_id: str) -> List[Role]:
        """获取用户的所有角色"""
        statement = (
            select(Role)
            .join(UserRole, Role.id == UserRole.role_id)
            .where(UserRole.user_id == user_id)
        )
        return self.session.exec(statement).all()

    def has_permission(self, user_id: str, resource: str, action: str) -> bool:
        """检查用户是否有特定权限"""
        statement = (
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRole, RolePermission.role_id == UserRole.role_id)
            .where(
                UserRole.user_id == user_id,
                Permission.resource == resource,
                Permission.action == action
            )
        )
        return self.session.exec(statement).first() is not None

    def is_superuser(self, user_id: str) -> bool:
        """检查用户是否为超级用户"""
        user = self.session.get(User, user_id)
        return user.is_superuser if user else False

    # 角色管理方法
    def create_role(self, name: str, description: Optional[str] = None) -> Role:
        """创建角色"""
        role = Role(name=name, description=description)
        self.session.add(role)
        self.session.commit()
        self.session.refresh(role)
        return role

    def get_role(self, role_id: str) -> Optional[Role]:
        """获取角色"""
        return self.session.get(Role, role_id)

    def get_roles(self) -> List[Role]:
        """获取所有角色"""
        statement = select(Role)
        return self.session.exec(statement).all()

    def assign_role_to_user(self, user_id: str, role_id: str) -> bool:
        """为用户分配角色"""
        # 检查是否已存在
        existing = self.session.exec(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id
            )
        ).first()
        
        if existing:
            return False
        
        user_role = UserRole(user_id=user_id, role_id=role_id)
        self.session.add(user_role)
        self.session.commit()
        return True

    def remove_role_from_user(self, user_id: str, role_id: str) -> bool:
        """移除用户的角色"""
        statement = select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        )
        user_role = self.session.exec(statement).first()
        
        if not user_role:
            return False
        
        self.session.delete(user_role)
        self.session.commit()
        return True

    # 权限管理方法
    def create_permission(self, name: str, resource: str, action: str, description: Optional[str] = None) -> Permission:
        """创建权限"""
        permission = Permission(
            name=name,
            resource=resource,
            action=action,
            description=description
        )
        self.session.add(permission)
        self.session.commit()
        self.session.refresh(permission)
        return permission

    def get_permission(self, permission_id: str) -> Optional[Permission]:
        """获取权限"""
        return self.session.get(Permission, permission_id)

    def get_permissions(self) -> List[Permission]:
        """获取所有权限"""
        statement = select(Permission)
        return self.session.exec(statement).all()

    def assign_permission_to_role(self, role_id: str, permission_id: str) -> bool:
        """为角色分配权限"""
        # 检查是否已存在
        existing = self.session.exec(
            select(RolePermission).where(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == permission_id
            )
        ).first()
        
        if existing:
            return False
        
        role_permission = RolePermission(role_id=role_id, permission_id=permission_id)
        self.session.add(role_permission)
        self.session.commit()
        return True

    def remove_permission_from_role(self, role_id: str, permission_id: str) -> bool:
        """移除角色的权限"""
        statement = select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        )
        role_permission = self.session.exec(statement).first()
        
        if not role_permission:
            return False
        
        self.session.delete(role_permission)
        self.session.commit()
        return True

    # 初始化默认数据
    def init_default_permissions(self):
        """初始化默认权限和角色"""
        # 创建默认权限
        permissions = [
            ("user.read", "users", "read", "查看用户"),
            ("user.write", "users", "write", "编辑用户"),
            ("user.delete", "users", "delete", "删除用户"),
            ("item.read", "items", "read", "查看项目"),
            ("item.write", "items", "write", "编辑项目"),
            ("item.delete", "items", "delete", "删除项目"),
            ("admin.access", "admin", "access", "访问管理面板"),
        ]
        
        for name, resource, action, description in permissions:
            existing = self.session.exec(
                select(Permission).where(Permission.name == name)
            ).first()
            if not existing:
                self.create_permission(name, resource, action, description)
        
        # 创建默认角色
        roles = [
            ("admin", "管理员", ["user.read", "user.write", "user.delete", "item.read", "item.write", "item.delete", "admin.access"]),
            ("user", "普通用户", ["item.read", "item.write"]),
            ("viewer", "访客", ["item.read"]),
        ]
        
        for role_name, role_desc, permission_names in roles:
            existing_role = self.session.exec(
                select(Role).where(Role.name == role_name)
            ).first()
            
            if not existing_role:
                role = self.create_role(role_name, role_desc)
                
                # 为角色分配权限
                for perm_name in permission_names:
                    permission = self.session.exec(
                        select(Permission).where(Permission.name == perm_name)
                    ).first()
                    if permission:
                        self.assign_permission_to_role(str(role.id), str(permission.id))
