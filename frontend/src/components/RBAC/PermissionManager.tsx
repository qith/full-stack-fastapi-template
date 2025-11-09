import { 
  Badge, 
  Button, 
  Container, 
  Dialog, 
  Flex, 
  Heading, 
  Input, 
  Table, 
  Text,
  Select
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"

import { RbacService, type PermissionPublic } from "@/client"
import useAuth from "@/hooks/useAuth"

const PermissionManager = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionPublic | null>(null)
  const createScrollRef = useRef<HTMLDivElement>(null)
  const editScrollRef = useRef<HTMLDivElement>(null)

  // 当弹窗打开时自动获得焦点
  useEffect(() => {
    if (isCreateOpen && createScrollRef.current) {
      createScrollRef.current.focus()
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (isEditOpen && editScrollRef.current) {
      editScrollRef.current.focus()
    }
  }, [isEditOpen])

  const [formData, setFormData] = useState({
    name: "",
    resource: "",
    action: "",
    description: "",
    permission_type: "api",
    menu_path: "",
    button_id: ""
  })

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => RbacService.getPermissionsWorking(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => RbacService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] })
      setIsCreateOpen(false)
      resetForm()
      toaster.create({
        title: "权限创建成功",
        type: "success",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toaster.create({
        title: "创建失败",
        description: error.message || "未知错误",
        type: "error",
        duration: 3000,
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => RbacService.updatePermission({ 
      permissionId: id,
      ...data 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] })
      setIsEditOpen(false)
      setEditingPermission(null)
      resetForm()
      toaster.create({
        title: "权限更新成功",
        type: "success",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toaster.create({
        title: "更新失败",
        description: error.message || "未知错误",
        type: "error",
        duration: 3000,
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => RbacService.deletePermission({ permissionId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] })
      toaster.create({
        title: "权限删除成功",
        type: "success",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toaster.create({
        title: "删除失败",
        description: error.message || "未知错误",
        type: "error",
        duration: 3000,
      })
    }
  })

  const resetForm = () => {
    setFormData({
      name: "",
      resource: "",
      action: "",
      description: "",
      permission_type: "api",
      menu_path: "",
      button_id: ""
    })
  }

  const handleCreate = () => {
    createMutation.mutate(formData)
  }

  const handleEdit = (permission: PermissionPublic) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || "",
      permission_type: (permission as any).permission_type || "api",
      menu_path: (permission as any).menu_path || "",
      button_id: (permission as any).button_id || ""
    })
    setIsEditOpen(true)
  }

  const handleUpdate = () => {
    if (editingPermission) {
      updateMutation.mutate({
        id: editingPermission.id,
        ...formData
      })
    }
  }

  const handleDelete = (permission: PermissionPublic) => {
    if (window.confirm(`确定要删除权限 "${permission.name}" 吗？`)) {
      deleteMutation.mutate(permission.id)
    }
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

  if (isLoading) {
    return <div>加载权限中...</div>
  }

  return (
    <Container maxW="full">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">权限管理</Heading>
        <Button 
          colorScheme="blue" 
          onClick={() => setIsCreateOpen(true)}
        >
          创建权限
        </Button>
      </Flex>

      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>权限类型</Table.ColumnHeader>
            <Table.ColumnHeader>权限名称</Table.ColumnHeader>
            <Table.ColumnHeader>资源/路径/标识</Table.ColumnHeader>
            <Table.ColumnHeader>操作</Table.ColumnHeader>
            <Table.ColumnHeader>描述</Table.ColumnHeader>
            <Table.ColumnHeader>操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.isArray(permissions) && permissions.map((permission: any) => {
            const permissionType = permission.permission_type || "api"
            const typeLabel = permissionType === "menu" ? "菜单" : permissionType === "button" ? "按钮" : "API"
            const typeColor = permissionType === "menu" ? "blue" : permissionType === "button" ? "green" : "purple"
            const detailValue = permissionType === "menu" 
              ? permission.menu_path 
              : permissionType === "button" 
              ? permission.button_id 
              : permission.resource
            
            return (
              <Table.Row key={permission.id}>
                <Table.Cell>
                  <Badge colorScheme={typeColor} variant="solid">
                    {typeLabel}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorScheme="purple" variant="solid">
                    {permission.name}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {permissionType === "api" ? (
                    <Badge colorScheme="orange" variant="outline">
                      {detailValue}
                    </Badge>
                  ) : (
                    <Text fontSize="sm">{detailValue || "无"}</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {permissionType === "api" ? (
                    <Badge colorScheme="teal" variant="outline">
                      {permission.action}
                    </Badge>
                  ) : (
                    <Text fontSize="sm">-</Text>
                  )}
                </Table.Cell>
                <Table.Cell>{permission.description || "无描述"}</Table.Cell>
                <Table.Cell>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(permission)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDelete(permission)}
                    >
                      删除
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>

      {/* 创建权限对话框 */}
      <Dialog.Root open={isCreateOpen} onOpenChange={(details) => setIsCreateOpen(details.open)}>
        <Dialog.Content maxW="md" maxHeight="80vh">
          <Dialog.Header>
            <Dialog.Title>创建权限</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <div 
              ref={createScrollRef}
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
              <Flex direction="column" gap={4}>
              <Field label="权限类型">
                <Select.Root
                  value={formData.permission_type}
                  onValueChange={(e) => setFormData({ ...formData, permission_type: e.value[0] })}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="api">API权限</Select.Item>
                    <Select.Item value="menu">菜单权限</Select.Item>
                    <Select.Item value="button">按钮权限</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Field>
              <Field label="权限名称">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: user.read"
                />
              </Field>
              {formData.permission_type === "api" && (
                <>
                  <Field label="资源">
                    <Input
                      value={formData.resource}
                      onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                      placeholder="例如: users"
                    />
                  </Field>
                  <Field label="操作">
                    <Input
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="例如: read"
                    />
                  </Field>
                </>
              )}
              {formData.permission_type === "menu" && (
                <Field label="菜单路径">
                  <Input
                    value={formData.menu_path}
                    onChange={(e) => setFormData({ ...formData, menu_path: e.target.value })}
                    placeholder="例如: /project-management"
                  />
                </Field>
              )}
              {formData.permission_type === "button" && (
                <Field label="按钮标识">
                  <Input
                    value={formData.button_id}
                    onChange={(e) => setFormData({ ...formData, button_id: e.target.value })}
                    placeholder="例如: create-project"
                  />
                </Field>
              )}
              <Field label="描述">
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="权限描述"
                />
              </Field>
            </Flex>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreate}
              loading={createMutation.isPending}
            >
              创建
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      {/* 编辑权限对话框 */}
      <Dialog.Root open={isEditOpen} onOpenChange={(details) => setIsEditOpen(details.open)}>
        <Dialog.Content maxW="md" maxHeight="80vh">
          <Dialog.Header>
            <Dialog.Title>编辑权限</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <div 
              ref={editScrollRef}
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
              <Flex direction="column" gap={4}>
              <Field label="权限类型">
                <Select.Root
                  value={formData.permission_type}
                  onValueChange={(e) => setFormData({ ...formData, permission_type: e.value[0] })}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="api">API权限</Select.Item>
                    <Select.Item value="menu">菜单权限</Select.Item>
                    <Select.Item value="button">按钮权限</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Field>
              <Field label="权限名称">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: user.read"
                />
              </Field>
              {formData.permission_type === "api" && (
                <>
                  <Field label="资源">
                    <Input
                      value={formData.resource}
                      onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                      placeholder="例如: users"
                    />
                  </Field>
                  <Field label="操作">
                    <Input
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="例如: read"
                    />
                  </Field>
                </>
              )}
              {formData.permission_type === "menu" && (
                <Field label="菜单路径">
                  <Input
                    value={formData.menu_path}
                    onChange={(e) => setFormData({ ...formData, menu_path: e.target.value })}
                    placeholder="例如: /project-management"
                  />
                </Field>
              )}
              {formData.permission_type === "button" && (
                <Field label="按钮标识">
                  <Input
                    value={formData.button_id}
                    onChange={(e) => setFormData({ ...formData, button_id: e.target.value })}
                    placeholder="例如: create-project"
                  />
                </Field>
              )}
              <Field label="描述">
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="权限描述"
                />
              </Field>
            </Flex>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUpdate}
              loading={updateMutation.isPending}
            >
              更新
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Container>
  )
}

export default PermissionManager
