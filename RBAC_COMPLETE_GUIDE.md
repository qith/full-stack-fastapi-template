# RBAC 权限管理系统完整指南

## 概述

现在你的 FastAPI 项目已经具备了完整的 RBAC（基于角色的访问控制）权限管理系统，包括后端 API 和前端管理界面。

## 功能特性

### 1. 权限管理
- ✅ **创建权限** - 可以创建新的权限（如 `menu.access`）
- ✅ **编辑权限** - 可以修改权限的名称、资源、操作和描述
- ✅ **删除权限** - 可以删除不需要的权限
- ✅ **查看权限** - 列出所有系统权限

### 2. 角色管理
- ✅ **创建角色** - 可以创建新的角色（如 `editor`、`moderator`）
- ✅ **编辑角色** - 可以修改角色的名称和描述
- ✅ **删除角色** - 可以删除不需要的角色
- ✅ **查看角色** - 列出所有系统角色

### 3. 角色权限分配
- ✅ **为角色分配权限** - 可以将权限分配给特定角色
- ✅ **从角色移除权限** - 可以从角色中移除权限
- ✅ **查看角色权限** - 查看某个角色拥有的所有权限

### 4. 用户角色管理
- ✅ **为用户分配角色** - 可以将角色分配给用户
- ✅ **从用户移除角色** - 可以从用户中移除角色
- ✅ **查看用户角色** - 查看用户拥有的所有角色
- ✅ **查看用户权限** - 查看用户通过角色获得的所有权限

## 前端界面

### 访问路径
- 前端地址：http://localhost:5174/
- RBAC 管理页面：http://localhost:5174/rbac

### 界面功能
1. **概览页面** - 显示系统角色和权限的概览
2. **权限管理** - 完整的权限 CRUD 操作界面
3. **角色权限** - 角色权限分配管理界面
4. **用户管理** - 用户角色分配管理界面

## API 接口

### 权限管理 API
```
GET    /api/v1/rbac/permissions              # 获取所有权限
POST   /api/v1/rbac/permissions              # 创建权限
PUT    /api/v1/rbac/permissions/{id}         # 更新权限
DELETE /api/v1/rbac/permissions/{id}         # 删除权限
```

### 角色管理 API
```
GET    /api/v1/rbac/roles                    # 获取所有角色
POST   /api/v1/rbac/roles                    # 创建角色
PUT    /api/v1/rbac/roles/{id}               # 更新角色
DELETE /api/v1/rbac/roles/{id}               # 删除角色
```

### 角色权限管理 API
```
GET    /api/v1/rbac/roles/{id}/permissions   # 获取角色权限
POST   /api/v1/rbac/roles/{id}/permissions/{perm_id}  # 分配权限给角色
DELETE /api/v1/rbac/roles/{id}/permissions/{perm_id}  # 从角色移除权限
```

### 用户角色管理 API
```
GET    /api/v1/rbac/users/{id}/roles         # 获取用户角色
GET    /api/v1/rbac/users/{id}/permissions   # 获取用户权限
POST   /api/v1/rbac/users/{id}/roles/{role_id}        # 分配角色给用户
DELETE /api/v1/rbac/users/{id}/roles/{role_id}        # 从用户移除角色
```

## 使用示例

### 1. 创建菜单权限
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "menu.access", "resource": "menu", "action": "access", "description": "访问菜单"}' \
  "http://localhost:8000/api/v1/rbac/permissions"
```

### 2. 为管理员角色分配菜单权限
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/rbac/roles/ROLE_ID/permissions/PERMISSION_ID"
```

### 3. 为用户分配角色
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/rbac/users/USER_ID/roles/ROLE_ID"
```

## 权限检查

### 后端权限检查
```python
from app.services.rbac_service import RBACService

# 检查用户是否有特定权限
with Session(engine) as session:
    rbac_service = RBACService(session)
    has_permission = rbac_service.has_permission(user_id, "menu", "access")
```

### 前端权限检查
```typescript
import usePermissions from "@/hooks/usePermissions"

// 在组件中使用
const { hasPermission } = usePermissions()
const canAccessMenu = hasPermission("menu", "access")
```

## 默认权限和角色

系统初始化时会创建以下默认数据：

### 默认权限
- `user.read` - 查看用户
- `user.write` - 编辑用户
- `user.delete` - 删除用户
- `item.read` - 查看项目
- `item.write` - 编辑项目
- `item.delete` - 删除项目
- `admin.access` - 访问管理面板

### 默认角色
- `admin` - 管理员（拥有所有权限）
- `user` - 普通用户（拥有 item.read, item.write）
- `viewer` - 访客（只有 item.read）

## 安全特性

1. **超级用户检查** - 所有 RBAC 管理操作都需要超级用户权限
2. **JWT 认证** - 所有 API 都需要有效的 JWT token
3. **权限验证** - 可以检查用户是否有特定权限
4. **角色继承** - 用户通过角色获得权限

## 扩展建议

1. **菜单权限控制** - 可以根据用户权限动态显示/隐藏菜单项
2. **页面权限控制** - 可以根据权限控制页面访问
3. **按钮权限控制** - 可以根据权限控制按钮的显示/隐藏
4. **数据权限** - 可以基于用户角色过滤数据访问

## 总结

现在你的系统已经具备了完整的 RBAC 权限管理功能，可以：

1. ✅ 创建和管理权限
2. ✅ 创建和管理角色
3. ✅ 为角色分配权限
4. ✅ 为用户分配角色
5. ✅ 检查用户权限
6. ✅ 通过前端界面进行管理

你可以通过访问 http://localhost:5174/rbac 来使用这些功能！
