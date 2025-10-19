import uuid
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr
from app.models import User as BaseUser


# 扩展的用户模型，基于现有用户模型
class User(BaseUser):
    # 关系
    roles: List["UserRole"] = Relationship(back_populates="user")


# 角色模型
class Role(SQLModel, table=True):
    __tablename__ = "roles"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=50)
    description: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    
    # 关系
    permissions: List["RolePermission"] = Relationship(back_populates="role")
    users: List["UserRole"] = Relationship(back_populates="role")


# 权限模型
class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=100)
    resource: str = Field(max_length=50)  # 资源类型，如 "users", "items", "admin"
    action: str = Field(max_length=50)    # 操作类型，如 "read", "write", "delete"
    description: Optional[str] = Field(default=None, max_length=255)
    
    # 关系
    roles: List["RolePermission"] = Relationship(back_populates="permission")


# 角色权限关联表
class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"
    
    role_id: uuid.UUID = Field(foreign_key="roles.id", primary_key=True)
    permission_id: uuid.UUID = Field(foreign_key="permissions.id", primary_key=True)
    
    # 关系
    role: Role = Relationship(back_populates="permissions")
    permission: Permission = Relationship(back_populates="roles")


# 用户角色关联表
class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"
    
    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)
    role_id: uuid.UUID = Field(foreign_key="roles.id", primary_key=True)
    
    # 关系
    user: User = Relationship(back_populates="roles")
    role: Role = Relationship(back_populates="users")


# 项目模型（保持原有）
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=255)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)


class Item(ItemBase, table=True):
    __tablename__ = "items"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, ondelete="CASCADE")
    
    # 关系
    owner: User = Relationship(back_populates="items")


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: List[ItemPublic]
    count: int


# API 响应模型
class UserPublic(SQLModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    roles: List["RolePublic"] = []


class RolePublic(SQLModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    permissions: List["PermissionPublic"] = []


class PermissionPublic(SQLModel):
    id: uuid.UUID
    name: str
    resource: str
    action: str
    description: Optional[str] = None


class UsersPublic(SQLModel):
    data: List[UserPublic]
    count: int


# 通用消息
class Message(SQLModel):
    message: str


# JWT Token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
