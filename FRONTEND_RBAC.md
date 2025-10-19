# 前端权限管理系统

## 概述

前端已成功集成了完整的 RBAC（基于角色的访问控制）权限管理系统，与后端 API 完全对接。

## 功能特性

### 1. 权限管理页面 (`/rbac`)
- **角色管理**: 查看系统所有角色及其权限
- **权限管理**: 查看系统所有权限定义
- **用户管理**: 管理用户角色分配

### 2. 权限验证 Hook (`usePermissions`)
- `hasPermission(resource, action)`: 检查特定权限
- `isAdmin`: 检查是否为管理员
- `canManage(resource)`: 检查管理权限
- `canView(resource)`: 检查查看权限

### 3. 权限保护组件 (`PermissionGuard`)
- 基于权限条件渲染组件
- 支持管理员权限检查
- 可自定义无权限时的回退内容

## 页面结构

### RBAC 管理页面
```
/rbac
├── Roles Tab - 角色列表
├── Permissions Tab - 权限列表
└── User Management Tab - 用户角色管理
```

### 导航菜单
- 只有超级用户才能看到 "RBAC" 菜单项
- 使用盾牌图标 (FiShield) 标识

## 组件说明

### 1. RBAC 主页面 (`src/routes/_layout/rbac.tsx`)
- 使用 Tab 组件组织不同功能
- 集成角色、权限、用户管理
- 自动检查用户权限

### 2. 用户角色管理 (`src/components/RBAC/UserRoleManagement.tsx`)
- 显示所有用户及其当前角色
- 支持角色分配操作
- 实时状态显示

### 3. 权限 Hook (`src/hooks/usePermissions.ts`)
- 提供权限检查方法
- 缓存权限数据
- 支持多种权限验证场景

### 4. 权限保护组件 (`src/components/Common/PermissionGuard.tsx`)
- 声明式权限控制
- 支持条件渲染
- 可配置回退内容

## API 集成

### 自动生成的客户端
- 使用 `@hey-api/openapi-ts` 自动生成
- 包含所有 RBAC 相关接口
- 类型安全的 API 调用

### 支持的接口
- `RbacService.getRolesWorking()`: 获取角色列表
- `RbacService.getPermissionsWorking()`: 获取权限列表

## 使用示例

### 1. 在组件中使用权限检查
```tsx
import usePermissions from "@/hooks/usePermissions"

function MyComponent() {
  const { hasPermission, isAdmin } = usePermissions()
  
  if (!hasPermission("users", "read")) {
    return <div>No permission</div>
  }
  
  return <div>Content for users with read permission</div>
}
```

### 2. 使用权限保护组件
```tsx
import PermissionGuard from "@/components/Common/PermissionGuard"

function AdminPanel() {
  return (
    <PermissionGuard 
      resource="admin" 
      action="access"
      fallback={<div>Access denied</div>}
    >
      <div>Admin content</div>
    </PermissionGuard>
  )
}
```

### 3. 检查管理员权限
```tsx
import usePermissions from "@/hooks/usePermissions"

function AdminButton() {
  const { isAdmin } = usePermissions()
  
  if (!isAdmin) return null
  
  return <button>Admin Action</button>
}
```

## 权限级别

### 超级用户 (Superuser)
- 拥有所有权限
- 可以访问 RBAC 管理页面
- 可以管理用户角色

### 普通用户 (User)
- 基础权限
- 无法访问管理功能
- 受权限保护组件限制

### 访客 (Viewer)
- 只读权限
- 限制更多操作

## 安全特性

1. **前端权限验证**: 所有敏感操作都有权限检查
2. **API 集成**: 与后端权限系统完全同步
3. **类型安全**: 使用 TypeScript 确保类型安全
4. **缓存优化**: 权限数据自动缓存，减少 API 调用

## 开发指南

### 添加新的权限检查
1. 在后端定义权限
2. 重新生成前端 API 客户端
3. 使用 `usePermissions` Hook 进行权限检查

### 保护新页面
1. 使用 `PermissionGuard` 组件包装内容
2. 在路由级别添加权限检查
3. 更新导航菜单的权限逻辑

### 添加新的管理功能
1. 在 RBAC 页面添加新的 Tab
2. 创建对应的管理组件
3. 集成相应的 API 调用

## 测试

前端权限系统已通过以下测试：
- ✅ 权限页面访问控制
- ✅ 角色和权限数据展示
- ✅ 用户角色管理界面
- ✅ 权限 Hook 功能
- ✅ 权限保护组件

## 部署注意事项

1. 确保后端 API 正常运行
2. 前端构建时包含最新的 API 客户端
3. 检查 CORS 配置允许前端访问
4. 验证权限验证逻辑在生产环境中的表现

前端权限管理系统现已完全集成，提供了完整的用户界面来管理角色和权限，同时确保了安全性和易用性。
