import { Badge, Container, Flex, Heading, Table, Tabs } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { RbacService, type RolePublic, type PermissionPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import UserRoleManagement from "@/components/RBAC/UserRoleManagement"
import PermissionManager from "@/components/RBAC/PermissionManager"
import RolePermissionManager from "@/components/RBAC/RolePermissionManager"

export const Route = createFileRoute("/_layout/rbac")({
  component: RbacManagement,
})

function RolesTable() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => RbacService.getRolesWorking(),
  })

  if (isLoading) {
    return <div>Loading roles...</div>
  }

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Role Name</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
          <Table.ColumnHeader>Permissions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {roles?.map((role: RolePublic) => (
          <Table.Row key={role.id}>
            <Table.Cell>
              <Badge colorScheme="blue" variant="solid">
                {role.name}
              </Badge>
            </Table.Cell>
            <Table.Cell>{role.description || "No description"}</Table.Cell>
            <Table.Cell>
              {role.permissions && role.permissions.length > 0 ? (
                <Flex gap={1} wrap="wrap">
                  {role.permissions.map((permission: PermissionPublic) => (
                    <Badge key={permission.id} colorScheme="green" variant="outline">
                      {permission.name}
                    </Badge>
                  ))}
                </Flex>
              ) : (
                <Badge colorScheme="gray" variant="outline">
                  No permissions
                </Badge>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function PermissionsTable() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => RbacService.getPermissionsWorking(),
  })

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Permission Name</Table.ColumnHeader>
          <Table.ColumnHeader>Resource</Table.ColumnHeader>
          <Table.ColumnHeader>Action</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.isArray(permissions) && permissions.map((permission: any) => (
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
            <Table.Cell>{permission.description || "No description"}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function RbacManagement() {
  const { user } = useAuth()

  // 检查用户是否有权限访问此页面
  if (!user?.is_superuser) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} color="red.500">
          Access Denied
        </Heading>
        <p>You don't have permission to access this page.</p>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} mb={6}>
        RBAC Management
      </Heading>

      <Tabs.Root defaultValue="overview" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="overview">概览</Tabs.Trigger>
          <Tabs.Trigger value="permissions">权限管理</Tabs.Trigger>
          <Tabs.Trigger value="role-permissions">角色权限</Tabs.Trigger>
          <Tabs.Trigger value="users">用户管理</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" pt={4}>
          <Flex gap={6}>
            <Flex direction="column" flex="1">
              <Heading size="md" mb={4}>
                系统角色
              </Heading>
              <RolesTable />
            </Flex>
            <Flex direction="column" flex="1">
              <Heading size="md" mb={4}>
                系统权限
              </Heading>
              <PermissionsTable />
            </Flex>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="permissions" pt={4}>
          <PermissionManager />
        </Tabs.Content>

        <Tabs.Content value="role-permissions" pt={4}>
          <RolePermissionManager />
        </Tabs.Content>

        <Tabs.Content value="users" pt={4}>
          <UserRoleManagement />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  )
}
