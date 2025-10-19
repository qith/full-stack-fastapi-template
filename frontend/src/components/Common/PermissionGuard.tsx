import { ReactNode } from "react"
import usePermissions from "@/hooks/usePermissions"

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  action: string
  fallback?: ReactNode
  requireAdmin?: boolean
}

const PermissionGuard = ({ 
  children, 
  resource, 
  action, 
  fallback = null,
  requireAdmin = false 
}: PermissionGuardProps) => {
  const { hasPermission, isAdmin } = usePermissions()

  // 如果需要管理员权限
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>
  }

  // 检查特定权限
  if (!hasPermission(resource, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default PermissionGuard
