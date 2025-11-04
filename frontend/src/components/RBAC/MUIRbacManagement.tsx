import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { RbacService, UsersService } from '@/client'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const MUIRbacManagement = () => {
  const [tabValue, setTabValue] = useState(0)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  
  // 编辑状态
  const [editingRole, setEditingRole] = useState<any>(null)
  const [editingPermission, setEditingPermission] = useState<any>(null)
  const [editingUserRoles, setEditingUserRoles] = useState<{userId: string, roles: any[]}>({userId: '', roles: []})
  
  // 表单状态
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [permissionForm, setPermissionForm] = useState({ name: '', description: '', resource: '', action: '' })
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: boolean}>({})
  const [selectedUser, setSelectedUser] = useState('')
  
  // 获取数据
  const { data: roles = [] } = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: () => RbacService.getRolesWorking(),
  })

  const { data: permissions = [] } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => RbacService.getPermissionsWorking(),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
  })
  
  // 存储所有用户的角色信息
  const [userRolesMap, setUserRolesMap] = useState<{[key: string]: any[]}>({})

  // 获取用户角色
  const getUserRoles = async (userId: string) => {
    try {
      const userRoles = await RbacService.getUserRoles({ userId })
      return userRoles
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
      return []
    }
  }

  // 当用户列表加载完成后，获取每个用户的角色
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (users && users.data && users.data.length > 0) {
        const rolesMap: {[key: string]: any[]} = {}
        
        // 并行获取所有用户的角色
        await Promise.all(users.data.map(async (user: any) => {
          try {
            const userRoles = await RbacService.getUserRoles({ userId: user.id })
            rolesMap[user.id] = userRoles
          } catch (error) {
            console.error(`Failed to fetch roles for user ${user.id}:`, error)
            rolesMap[user.id] = []
          }
        }))
        
        setUserRolesMap(rolesMap)
      }
    }
    
    fetchUserRoles()
  }, [users])
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }
  
  // 角色管理函数
  const handleEditRole = (role: any) => {
    setEditingRole(role)
    setRoleForm({
      name: role.name,
      description: role.description || ''
    })
    setRoleDialogOpen(true)
  }
  
  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('确定要删除这个角色吗？')) {
      try {
        await RbacService.deleteRole({ roleId })
        setSnackbar({ open: true, message: '角色删除成功', severity: 'success' })
        // 重新加载角色列表
        const updatedRoles = await RbacService.getRolesWorking()
        // 刷新页面数据
        window.location.reload()
      } catch (error) {
        console.error('Failed to delete role:', error)
        setSnackbar({ open: true, message: '角色删除失败', severity: 'error' })
      }
    }
  }
  
  const handleCloseRoleDialog = () => {
    setEditingRole(null)
    setRoleForm({ name: '', description: '' })
    setRoleDialogOpen(false)
  }
  
  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        // 更新角色
        await RbacService.updateRole({
          roleId: editingRole.id,
          name: roleForm.name,
          description: roleForm.description
        })
        setSnackbar({ open: true, message: '角色更新成功', severity: 'success' })
      } else {
        // 创建角色
        await RbacService.createRole({
          name: roleForm.name,
          description: roleForm.description
        })
        setSnackbar({ open: true, message: '角色创建成功', severity: 'success' })
      }
      
      // 关闭对话框并重置表单
      handleCloseRoleDialog()
      
      // 重新加载角色列表
      window.location.reload()
    } catch (error) {
      console.error('Failed to save role:', error)
      setSnackbar({ 
        open: true, 
        message: editingRole ? '角色更新失败' : '角色创建失败', 
        severity: 'error' 
      })
    }
  }
  
  // 权限管理函数
  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission)
    setPermissionForm({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource || '',
      action: permission.action || ''
    })
    setPermissionDialogOpen(true)
  }
  
  const handleDeletePermission = async (permissionId: string) => {
    if (window.confirm('确定要删除这个权限吗？')) {
      try {
        await RbacService.deletePermission({ permissionId })
        setSnackbar({ open: true, message: '权限删除成功', severity: 'success' })
        // 重新加载权限列表
        window.location.reload()
      } catch (error) {
        console.error('Failed to delete permission:', error)
        setSnackbar({ open: true, message: '权限删除失败', severity: 'error' })
      }
    }
  }
  
  const handleClosePermissionDialog = () => {
    setEditingPermission(null)
    setPermissionForm({ name: '', description: '', resource: '', action: '' })
    setPermissionDialogOpen(false)
  }
  
  const handleSavePermission = async () => {
    try {
      if (editingPermission) {
        // 更新权限
        await RbacService.updatePermission({
          permissionId: editingPermission.id,
          name: permissionForm.name,
          description: permissionForm.description,
          resource: permissionForm.resource,
          action: permissionForm.action
        })
        setSnackbar({ open: true, message: '权限更新成功', severity: 'success' })
      } else {
        // 创建权限
        await RbacService.createPermission({
          name: permissionForm.name,
          description: permissionForm.description,
          resource: permissionForm.resource,
          action: permissionForm.action
        })
        setSnackbar({ open: true, message: '权限创建成功', severity: 'success' })
      }
      
      // 关闭对话框并重置表单
      handleClosePermissionDialog()
      
      // 重新加载权限列表
      window.location.reload()
    } catch (error) {
      console.error('Failed to save permission:', error)
      setSnackbar({ 
        open: true, 
        message: editingPermission ? '权限更新失败' : '权限创建失败', 
        severity: 'error' 
      })
    }
  }
  
  // 用户角色管理函数
  const handleEditUserRoles = async (user: any) => {
    setSelectedUser(user.id)
    
    // 获取用户当前角色
    let userRoles = userRolesMap[user.id]
    
    // 如果没有缓存的角色数据，则从服务器获取
    if (!userRoles) {
      userRoles = await getUserRoles(user.id)
      // 更新缓存
      setUserRolesMap(prev => ({
        ...prev,
        [user.id]: userRoles
      }))
    }
    
    // 初始化选中状态
    const initialSelectedRoles: {[key: string]: boolean} = {}
    userRoles.forEach((role: any) => {
      initialSelectedRoles[role.id] = true
    })
    
    setSelectedRoles(initialSelectedRoles)
    setEditingUserRoles({userId: user.id, roles: userRoles})
    setUserRoleDialogOpen(true)
  }
  
  const handleCloseUserRoleDialog = () => {
    setSelectedUser('')
    setSelectedRoles({})
    setEditingUserRoles({userId: '', roles: []})
    setUserRoleDialogOpen(false)
  }
  
  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
  }
  
  const handleRoleCheckChange = (roleId: string, checked: boolean) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: checked
    }))
  }
  
  // 从用户移除角色
  const handleRemoveRoleFromUser = async (userId: string, roleId: string) => {
    try {
      await RbacService.removeRoleFromUser({ userId, roleId })
      
      // 更新本地状态
      setUserRolesMap(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).filter((role: any) => role.id !== roleId)
      }))
      
      setSnackbar({ open: true, message: '角色已从用户移除', severity: 'success' })
    } catch (error) {
      console.error('Failed to remove role from user:', error)
      setSnackbar({ open: true, message: '移除角色失败', severity: 'error' })
    }
  }
  
  const handleSaveUserRoles = async () => {
    try {
      const userId = editingUserRoles.userId || selectedUser
      if (!userId) {
        setSnackbar({ open: true, message: '请选择用户', severity: 'error' })
        return
      }
      
      // 获取用户当前角色
      const currentRoles = userRolesMap[userId] || await getUserRoles(userId)
      
      // 处理角色变化
      for (const role of roles) {
        const isCurrentlyAssigned = currentRoles.some((r: any) => r.id === role.id)
        const shouldBeAssigned = !!selectedRoles[role.id]
        
        if (!isCurrentlyAssigned && shouldBeAssigned) {
          // 需要添加角色
          await RbacService.assignRoleToUser({ userId, roleId: role.id })
        } else if (isCurrentlyAssigned && !shouldBeAssigned) {
          // 需要移除角色
          await RbacService.removeRoleFromUser({ userId, roleId: role.id })
        }
      }
      
      // 更新本地用户角色数据
      const updatedRoles = await RbacService.getUserRoles({ userId })
      setUserRolesMap(prev => ({
        ...prev,
        [userId]: updatedRoles
      }))
      
      setSnackbar({ open: true, message: '用户角色更新成功', severity: 'success' })
      handleCloseUserRoleDialog()
    } catch (error) {
      console.error('Failed to save user roles:', error)
      setSnackbar({ open: true, message: '用户角色更新失败', severity: 'error' })
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        RBAC 权限管理 (Material UI)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        使用 Material UI 组件实现的角色权限管理系统，提供直观的用户界面和流畅的交互体验。
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rbac tabs">
            <Tab icon={<SecurityIcon />} label="角色管理" />
            <Tab icon={<AdminIcon />} label="权限管理" />
            <Tab icon={<PersonIcon />} label="用户角色" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">角色列表</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setRoleDialogOpen(true)}
            >
              添加角色
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {roles.map((role: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {role.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="编辑">
                          <IconButton size="small" onClick={() => handleEditRole(role)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error" onClick={() => handleDeleteRole(role.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        权限数量: {role.permissions?.length || 0}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.permissions?.slice(0, 3).map((permission: any) => (
                          <Chip
                            key={permission.id}
                            label={permission.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {role.permissions?.length > 3 && (
                          <Chip
                            label={`+${role.permissions.length - 3}`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">权限列表</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPermissionDialogOpen(true)}
            >
              添加权限
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {permissions.map((permission: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {permission.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="编辑">
                          <IconButton size="small" onClick={() => handleEditPermission(permission)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error" onClick={() => handleDeletePermission(permission.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={permission.resource}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">用户角色分配</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUserRoleDialogOpen(true)}
            >
              分配角色
            </Button>
          </Box>
          
          <List>
            {users && users.data && users.data.map((user: any) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={user.full_name || user.email}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">{user.email}</Typography>
                        <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                          角色: {userRolesMap[user.id]?.length ? userRolesMap[user.id].map((r: any) => r.name).join(', ') : '无角色'}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {userRolesMap[user.id]?.map((role: any) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          size="small"
                          color="primary"
                          onDelete={() => handleRemoveRoleFromUser(user.id, role.id)}
                        />
                      ))}
                      <Tooltip title="编辑角色">
                        <IconButton size="small" onClick={() => handleEditUserRoles(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Card>

      {/* 角色对话框 */}
      <Dialog open={roleDialogOpen} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? '编辑角色' : '添加角色'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="角色名称"
            fullWidth
            variant="outlined"
            value={roleForm.name}
            onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="角色描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={roleForm.description}
            onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>取消</Button>
          <Button variant="contained" onClick={handleSaveRole}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 权限对话框 */}
      <Dialog open={permissionDialogOpen} onClose={handleClosePermissionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPermission ? '编辑权限' : '添加权限'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="权限名称"
            fullWidth
            variant="outlined"
            value={permissionForm.name}
            onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="权限描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={permissionForm.description}
            onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>资源类型</InputLabel>
            <Select 
              label="资源类型"
              value={permissionForm.resource}
              onChange={(e) => setPermissionForm({...permissionForm, resource: e.target.value})}
            >
              <MenuItem value="user">用户</MenuItem>
              <MenuItem value="role">角色</MenuItem>
              <MenuItem value="permission">权限</MenuItem>
              <MenuItem value="item">项目</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="操作类型"
            fullWidth
            variant="outlined"
            value={permissionForm.action}
            onChange={(e) => setPermissionForm({...permissionForm, action: e.target.value})}
            placeholder="例如：read, write, delete"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog}>取消</Button>
          <Button variant="contained" onClick={handleSavePermission}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 用户角色对话框 */}
      <Dialog open={userRoleDialogOpen} onClose={handleCloseUserRoleDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingUserRoles.userId ? '编辑用户角色' : '分配用户角色'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>选择用户</InputLabel>
            <Select 
              label="选择用户"
              value={selectedUser}
              onChange={(e) => handleUserChange(e.target.value)}
              disabled={!!editingUserRoles.userId}
            >
              {users && users.data && users.data.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            选择角色
          </Typography>
          <Box sx={{ maxHeight: '300px', overflowY: 'auto', p: 1 }}>
            {roles.map((role: any) => (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox 
                    checked={!!selectedRoles[role.id]} 
                    onChange={(e) => handleRoleCheckChange(role.id, e.target.checked)}
                  />
                }
                label={role.name}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserRoleDialog}>取消</Button>
          <Button variant="contained" onClick={handleSaveUserRoles}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MUIRbacManagement
