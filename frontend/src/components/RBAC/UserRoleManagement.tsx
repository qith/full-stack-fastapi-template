import { Badge, Button, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { UsersService, type UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"

const UserRoleManagement = () => {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
  })

  if (!user?.is_superuser) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} color="red.500">
          Access Denied
        </Heading>
        <Text>You don't have permission to access this page.</Text>
      </Container>
    )
  }

  if (isLoading) {
    return <div>Loading users...</div>
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} mb={6}>
        User Role Management
      </Heading>

      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>User</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Current Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users?.data?.map((user: UserPublic) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Text fontWeight="medium">
                  {user.full_name || "N/A"}
                </Text>
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <Badge 
                  colorScheme={user.is_superuser ? "red" : "blue"} 
                  variant="solid"
                >
                  {user.is_superuser ? "Superuser" : "User"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge 
                  colorScheme={user.is_active ? "green" : "red"} 
                  variant="outline"
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUser(user)}
                >
                  Manage Roles
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {selectedUser && (
        <Container maxW="full" mt={8} p={4} border="1px" borderColor="gray.200" borderRadius="md">
          <Heading size="md" mb={4}>
            Manage Roles for {selectedUser.full_name || selectedUser.email}
          </Heading>
          <Text mb={4}>
            Current role: <Badge colorScheme={selectedUser.is_superuser ? "red" : "blue"}>
              {selectedUser.is_superuser ? "Superuser" : "User"}
            </Badge>
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => {
                // TODO: Implement role assignment
                console.log("Assign role to user:", selectedUser.id)
              }}
            >
              Assign Role
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </Button>
          </Flex>
        </Container>
      )}
    </Container>
  )
}

export default UserRoleManagement
