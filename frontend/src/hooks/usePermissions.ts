import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { RbacService } from "@/client"
import useAuth from "./useAuth"

export const usePermissions = () => {
  const { user } = useAuth()

  // 获取所有权限
  const { data: permissions } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => RbacService.getPermissionsWorking(),
    enabled: !!user?.is_superuser,
  })

  // 检查用户是否有特定权限
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    if (user.is_superuser) return true

    if (!Array.isArray(permissions)) return false

    return permissions.some((permission: any) => 
      permission.resource === resource && permission.action === action
    )
  }

  // 检查用户是否有管理员权限
  const isAdmin = useMemo(() => {
    return user?.is_superuser || false
  }, [user])

  // 检查用户是否有特定资源的管理权限
  const canManage = (resource: string): boolean => {
    return hasPermission(resource, "write") || hasPermission(resource, "delete")
  }

  // 检查用户是否有特定资源的查看权限
  const canView = (resource: string): boolean => {
    return hasPermission(resource, "read") || isAdmin
  }

  return {
    permissions,
    hasPermission,
    isAdmin,
    canManage,
    canView,
    isLoading: !permissions && !!user?.is_superuser,
  }
}

export default usePermissions
