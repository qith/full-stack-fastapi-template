import React, { useState } from 'react'
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
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
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error">
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
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error">
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
            {(users as any[]).map((user: any) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={user.full_name || user.email}
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {user.roles?.map((role: any) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          size="small"
                          color="primary"
                          onDelete={() => {}}
                        />
                      ))}
                      <Tooltip title="编辑角色">
                        <IconButton size="small">
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
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加角色</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="角色名称"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="角色描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => setRoleDialogOpen(false)}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 权限对话框 */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加权限</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="权限名称"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="权限描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>资源类型</InputLabel>
            <Select label="资源类型">
              <MenuItem value="user">用户</MenuItem>
              <MenuItem value="role">角色</MenuItem>
              <MenuItem value="permission">权限</MenuItem>
              <MenuItem value="item">项目</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => setPermissionDialogOpen(false)}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 用户角色对话框 */}
      <Dialog open={userRoleDialogOpen} onClose={() => setUserRoleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>分配用户角色</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>选择用户</InputLabel>
            <Select label="选择用户">
              {(users as any[]).map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            选择角色
          </Typography>
          {roles.map((role: any) => (
            <FormControlLabel
              key={role.id}
              control={<Checkbox />}
              label={role.name}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => setUserRoleDialogOpen(false)}>
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
