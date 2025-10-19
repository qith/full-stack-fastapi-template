import { 
  Badge, 
  Button, 
  Container, 
  Dialog, 
  Flex, 
  Heading, 
  Table, 
  Text
} from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"

import { RbacService, type RolePublic } from "@/client"
import useAuth from "@/hooks/useAuth"

const RolePermissionManager = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<RolePublic | null>(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 当弹窗打开时自动获得焦点
  useEffect(() => {
    if (isAssignOpen && scrollRef.current) {
      scrollRef.current.focus()
    }
  }, [isAssignOpen])

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => RbacService.getRolesWorking(),
  })

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => RbacService.getPermissionsWorking(),
  })

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ["rbac-role-permissions", selectedRole?.id],
    queryFn: async () => {
      if (!selectedRole) return []
      const result = await RbacService.getRolePermissions({ 
        roleId: selectedRole.id 
      })
      return result || []
    },
    enabled: !!selectedRole
  })

  const assignMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string, permissionId: string }) => 
      RbacService.assignPermissionToRole({ 
        roleId: roleId, 
        permissionId: permissionId 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions"] })
      toaster.create({
        title: "权限分配成功",
        type: "success",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toaster.create({
        title: "分配失败",
        description: error.message || "未知错误",
        type: "error",
        duration: 3000,
      })
    }
  })

  const removeMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string, permissionId: string }) => 
      RbacService.removePermissionFromRole({ 
        roleId: roleId, 
        permissionId: permissionId 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions"] })
      toaster.create({
        title: "权限移除成功",
        type: "success",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toaster.create({
        title: "移除失败",
        description: error.message || "未知错误",
        type: "error",
        duration: 3000,
      })
    }
  })

  const handleAssignPermission = (permission: any) => {
    if (selectedRole) {
      assignMutation.mutate({
        roleId: selectedRole.id,
        permissionId: permission.id
      })
    }
  }

  const handleRemovePermission = (permission: any) => {
    if (selectedRole) {
      removeMutation.mutate({
        roleId: selectedRole.id,
        permissionId: permission.id
      })
    }
  }

  const isPermissionAssigned = (permissionId: string) => {
    return Array.isArray(rolePermissions) && 
           rolePermissions.some((p: any) => p.id === permissionId)
  }

  if (!user?.is_superuser) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} color="red.500">
          访问被拒绝
        </Heading>
        <Text>您没有权限访问此页面。</Text>
      </Container>
    )
  }

  if (rolesLoading || permissionsLoading) {
    return <div>加载中...</div>
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} mb={6}>
        角色权限管理
      </Heading>

      <Flex gap={6}>
        {/* 角色列表 */}
        <Flex direction="column" flex="1">
          <Heading size="md" mb={4}>选择角色</Heading>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>角色名称</Table.ColumnHeader>
                <Table.ColumnHeader>描述</Table.ColumnHeader>
                <Table.ColumnHeader>操作</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Array.isArray(roles) && roles.map((role: any) => (
                <Table.Row 
                  key={role.id}
                  bg={selectedRole?.id === role.id ? "blue.50" : "transparent"}
                  cursor="pointer"
                  onClick={() => setSelectedRole(role)}
                >
                  <Table.Cell>
                    <Badge colorScheme="blue" variant="solid">
                      {role.name}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{role.description || "无描述"}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRole(role)}
                    >
                      管理权限
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>

        {/* 权限管理 */}
        {selectedRole && (
          <Flex direction="column" flex="2">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">
                {selectedRole.name} 的权限
              </Heading>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => setIsAssignOpen(true)}
              >
                分配权限
              </Button>
            </Flex>

            {rolePermissionsLoading ? (
              <div>加载权限中...</div>
            ) : (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>权限名称</Table.ColumnHeader>
                    <Table.ColumnHeader>资源</Table.ColumnHeader>
                    <Table.ColumnHeader>操作</Table.ColumnHeader>
                    <Table.ColumnHeader>描述</Table.ColumnHeader>
                    <Table.ColumnHeader>操作</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Array.isArray(rolePermissions) && rolePermissions.map((permission: any) => (
                    <Table.Row key={permission.id}>
                      <Table.Cell>
                        <Badge colorScheme="purple" variant="solid">
                          {permission.name}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme="orange" variant="outline">
                          {permission.resource}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme="teal" variant="outline">
                          {permission.action}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{permission.description || "无描述"}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleRemovePermission(permission)}
                        >
                          移除
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Flex>
        )}
      </Flex>

      {/* 分配权限对话框 */}
      <Dialog.Root open={isAssignOpen} onOpenChange={(details) => setIsAssignOpen(details.open)}>
        <Dialog.Content maxW="4xl" maxHeight="80vh">
          <Dialog.Header>
            <Dialog.Title>为 {selectedRole?.name} 分配权限</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <div 
              ref={scrollRef}
              style={{ 
                maxHeight: '60vh', 
                overflowY: 'auto',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                outline: 'none'
              }}
              tabIndex={0}
              onWheel={(e) => {
                e.stopPropagation()
                const element = e.currentTarget
                element.scrollTop += e.deltaY
              }}
            >
              <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>选择</Table.ColumnHeader>
                  <Table.ColumnHeader>权限名称</Table.ColumnHeader>
                  <Table.ColumnHeader>资源</Table.ColumnHeader>
                  <Table.ColumnHeader>操作</Table.ColumnHeader>
                  <Table.ColumnHeader>描述</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Array.isArray(permissions) && permissions.map((permission: any) => (
                  <Table.Row key={permission.id}>
                    <Table.Cell>
                        <input
                          type="checkbox"
                          checked={isPermissionAssigned(permission.id)}
                          onChange={() => {
                            if (isPermissionAssigned(permission.id)) {
                              handleRemovePermission(permission)
                            } else {
                              handleAssignPermission(permission)
                            }
                          }}
                        />
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorScheme="purple" variant="solid">
                        {permission.name}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorScheme="orange" variant="outline">
                        {permission.resource}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorScheme="teal" variant="outline">
                        {permission.action}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{permission.description || "无描述"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => setIsAssignOpen(false)}>
              完成
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Container>
  )
}

export default RolePermissionManager
