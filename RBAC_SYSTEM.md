# RBAC 权限管理系统

## 概述

本项目已成功集成了基于角色的访问控制（RBAC）权限管理系统，基于 FastAPI 和 SQLModel 构建。

## 系统架构

### 核心组件

1. **数据模型** (`app/models_rbac.py`)
   - `Role`: 角色模型
   - `Permission`: 权限模型
   - `UserRole`: 用户角色关联
   - `RolePermission`: 角色权限关联

2. **服务层** (`app/services/rbac_service.py`)
   - `RBACService`: 权限管理核心服务
   - 提供角色、权限的 CRUD 操作
   - 权限检查逻辑

3. **API 接口** (`app/api/routes/rbac.py`)
   - RESTful API 接口
   - 权限验证中间件

4. **初始化脚本** (`app/init_rbac.py`)
   - 默认权限和角色初始化
   - 管理员用户角色分配

## 默认权限和角色

### 角色
- **admin**: 管理员 - 拥有所有权限
- **user**: 普通用户 - 基础权限
- **viewer**: 访客 - 只读权限

### 权限
- **user.read**: 查看用户
- **user.write**: 编辑用户
- **user.delete**: 删除用户
- **item.read**: 查看项目
- **item.write**: 编辑项目
- **item.delete**: 删除项目
- **admin.access**: 访问管理面板

## API 接口

### 基础接口

#### 获取角色列表
```bash
GET /api/v1/rbac/roles
Authorization: Bearer <token>
```

#### 获取权限列表
```bash
GET /api/v1/rbac/permissions
Authorization: Bearer <token>
```

### 权限检查

#### 检查用户权限
```bash
GET /api/v1/rbac/check/{user_id}/{resource}/{action}
Authorization: Bearer <token>
```

示例：
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/rbac/check/fa963144-45ad-415f-bd7b-8548307b51f7/admin/access"
```

## 使用示例

### 1. 获取当前用户信息
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/users/me"
```

### 2. 查看所有角色
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/rbac/roles"
```

### 3. 查看所有权限
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/rbac/permissions"
```

### 4. 检查特定权限
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/rbac/check/{user_id}/admin/access"
```

## 数据库表结构

### roles 表
- `id`: UUID 主键
- `name`: 角色名称（唯一）
- `description`: 角色描述

### permissions 表
- `id`: UUID 主键
- `name`: 权限名称（唯一）
- `resource`: 资源类型
- `action`: 操作类型
- `description`: 权限描述

### user_roles 表
- `user_id`: 用户 ID（外键）
- `role_id`: 角色 ID（外键）

### role_permissions 表
- `role_id`: 角色 ID（外键）
- `permission_id`: 权限 ID（外键）

## 权限验证

系统使用两级权限验证：

1. **超级用户检查**: 超级用户自动拥有所有权限
2. **具体权限检查**: 检查用户是否具有特定资源的具体操作权限

## 初始化

系统启动时会自动：
1. 创建默认角色和权限
2. 为管理员用户分配 admin 角色
3. 建立角色和权限的关联关系

## 扩展

要添加新的权限或角色：

1. 在 `app/init_rbac.py` 中添加新的权限/角色定义
2. 重新运行初始化脚本
3. 在 API 接口中添加相应的权限检查

## 安全注意事项

1. 所有 RBAC 接口都需要认证
2. 只有超级用户可以管理权限和角色
3. 权限检查在服务层进行，确保数据安全
4. 使用 UUID 作为主键，避免 ID 猜测攻击

## 测试

系统已通过以下测试：
- ✅ 用户认证
- ✅ 角色查询
- ✅ 权限查询
- ✅ 权限检查
- ✅ 超级用户权限验证

权限管理系统已完全集成到 FastAPI 项目中，可以安全地管理用户权限和角色分配。
