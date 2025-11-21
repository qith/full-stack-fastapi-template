import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  GridLegacy as Grid,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Milestone, Project, ProjectsReadProjectMilestonesResponse, ProjectsReadProjectProgressesResponse } from '@/client'
import { ProjectsService } from '@/client'
import useAuth from '@/hooks/useAuth'
import { getLocationColor, getProjectTypeColor, getMilestoneStatusColor, MILESTONE_STATUSES, PROGRESS_TYPES } from '@/constants/projectConstants'

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
      id={`project-detail-tabpanel-${index}`}
      aria-labelledby={`project-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `project-detail-tab-${index}`,
    'aria-controls': `project-detail-tabpanel-${index}`,
  }
}

interface ProjectDetailProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onProjectUpdated: () => void
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ open, onClose, project, onProjectUpdated }) => {
  const [tabValue, setTabValue] = useState(0)
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = useState(false)
  const [isEditMilestoneDialogOpen, setIsEditMilestoneDialogOpen] = useState(false)
  const [isAddProgressDialogOpen, setIsAddProgressDialogOpen] = useState(false)
  const [isEditProgressDialogOpen, setIsEditProgressDialogOpen] = useState(false)
  const [editingProgress, setEditingProgress] = useState<any>(null)
  const [editingMilestone, setEditingMilestone] = useState<any>(null)
  const [newMilestone, setNewMilestone] = useState({
    milestone_date: '',
    description: '',
    status: '正常',
  })
  const [newProgress, setNewProgress] = useState({
    description: '',
    progress_type: '日进展',
    progress_date: new Date().toISOString().split('T')[0],
  })

  const queryClient = useQueryClient()
  const { user } = useAuth()

  // 获取最新的项目数据
  const { data: latestProject } = useQuery<Project>({
    queryKey: ['project', project?.id],
    queryFn: async () => {
      if (!project) {
        throw new Error('Project not found')
      }
      return ProjectsService.readProject({ projectId: project.id })
    },
    enabled: !!project && open, // 只有当项目存在且对话框打开时才查询
  })

  const currentProject: Project | null = useMemo(
    () => latestProject ?? project ?? null,
    [latestProject, project],
  )

  // 获取项目里程碑
  const {
    data: apiMilestones = [],
    isLoading: isMilestonesLoading,
    error: milestonesError,
  } = useQuery<ProjectsReadProjectMilestonesResponse>({
    queryKey: ['project-milestones', currentProject?.id],
    queryFn: async () => {
      if (!currentProject) {
        return []
      }
      return ProjectsService.readProjectMilestones({ projectId: currentProject.id })
    },
    enabled: !!currentProject, // 总是调用API获取最新的里程碑数据
  })

  const milestones: Milestone[] = apiMilestones


  // 获取项目进展
  const {
    data: progressesData,
    isLoading: isProgressesLoading,
  } = useQuery<ProjectsReadProjectProgressesResponse>({
    queryKey: ['project-progresses', currentProject?.id],
    queryFn: async () => {
      if (!currentProject) {
        return [] as any
      }
      return ProjectsService.readProjectProgresses({ projectId: currentProject.id })
    },
    enabled: !!currentProject,
  })
  
  const progresses: any[] = Array.isArray(progressesData) ? progressesData : []

  // 添加里程碑
  const addMilestoneMutation = useMutation({
    mutationFn: (data: any) => ProjectsService.createMilestone(data),
    onSuccess: () => {
      // 刷新里程碑缓存
      queryClient.invalidateQueries({ queryKey: ['project-milestones', project?.id] })
      // 刷新项目列表缓存，确保项目概览页面也能看到更新
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // 刷新项目统计缓存
      queryClient.invalidateQueries({ queryKey: ['project-statistics'] })
      // 通知父组件项目已更新
      onProjectUpdated()
      setIsAddMilestoneDialogOpen(false)
      setNewMilestone({
        milestone_date: '',
        description: '',
        status: '正常',
      })
    },
    onError: (error: any) => {
      console.error('添加里程碑失败:', error)
    },
  })

  // 编辑里程碑
  const editMilestoneMutation = useMutation({
    mutationFn: (data: any) => ProjectsService.updateMilestone({
      projectId: currentProject!.id,
      milestoneId: editingMilestone.id,
      requestBody: data.requestBody
    }),
    onSuccess: () => {
      // 刷新里程碑缓存
      queryClient.invalidateQueries({ queryKey: ['project-milestones', project?.id] })
      // 刷新项目列表缓存
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // 刷新项目统计缓存
      queryClient.invalidateQueries({ queryKey: ['project-statistics'] })
      // 通知父组件项目已更新
      onProjectUpdated()
      setIsEditMilestoneDialogOpen(false)
      setEditingMilestone(null)
    },
    onError: (error: any) => {
      console.error('编辑里程碑失败:', error)
    },
  })

  // 删除里程碑
  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => ProjectsService.deleteMilestone({
      projectId: currentProject!.id,
      milestoneId: milestoneId
    }),
    onSuccess: () => {
      // 刷新里程碑缓存
      queryClient.invalidateQueries({ queryKey: ['project-milestones', project?.id] })
      // 刷新项目列表缓存
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // 刷新项目统计缓存
      queryClient.invalidateQueries({ queryKey: ['project-statistics'] })
      // 通知父组件项目已更新
      onProjectUpdated()
    },
    onError: (error: any) => {
      console.error('删除里程碑失败:', error)
    },
  })

  // 添加进展
  const addProgressMutation = useMutation({
    mutationFn: (data: any) => ProjectsService.createProgress({
      projectId: currentProject!.id,
      requestBody: {
        tracking_user_id: user?.id || '3fad6319-9471-4a50-8bbd-d39672ed4b9e', // 使用当前登录用户ID
        ...data,
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-progresses', project?.id] })
      setIsAddProgressDialogOpen(false)
      setNewProgress({
        description: '',
        progress_type: '日进展',
        progress_date: new Date().toISOString().split('T')[0],
      })
    },
  })

  // 编辑进展
  const editProgressMutation = useMutation({
    mutationFn: (data: any) => ProjectsService.updateProgress({
      projectId: currentProject!.id,
      progressId: editingProgress?.id,
      requestBody: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-progresses', project?.id] })
      setIsEditProgressDialogOpen(false)
      setEditingProgress(null)
    },
  })

  // 删除进展
  const deleteProgressMutation = useMutation({
    mutationFn: (progressId: string) => ProjectsService.deleteProgress({
      projectId: currentProject!.id,
      progressId: progressId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-progresses', project?.id] })
    },
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddMilestone = () => {
    setIsAddMilestoneDialogOpen(true)
  }

  const handleEditMilestone = (milestone: any) => {
    setEditingMilestone({
      ...milestone,
      milestone_date: milestone.milestone_date ? new Date(milestone.milestone_date).toISOString().split('T')[0] : ''
    })
    setIsEditMilestoneDialogOpen(true)
  }

  const handleDeleteMilestone = (milestoneId: string) => {
    if (window.confirm('确定要删除这个里程碑吗？删除后无法恢复。')) {
      deleteMilestoneMutation.mutate(milestoneId)
    }
  }

  const handleAddProgress = () => {
    setIsAddProgressDialogOpen(true)
  }
  const handleEditProgress = (progress: any) => {
    setEditingProgress(progress)
    setIsEditProgressDialogOpen(true)
  }

  const handleDeleteProgress = (progressId: string) => {
    if (window.confirm('确定要删除这个进展记录吗？')) {
      deleteProgressMutation.mutate(progressId)
    }
  }

  const handleMilestoneInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewMilestone((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMilestoneStatusChange = (event: SelectChangeEvent<string>) => {
    setNewMilestone((prev) => ({
      ...prev,
      status: event.target.value,
    }))
  }

  const handleProgressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewProgress((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProgressTypeChange = (event: SelectChangeEvent<string>) => {
    setNewProgress((prev) => ({
      ...prev,
      progress_type: event.target.value,
    }))
  }

  const handleSubmitMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    addMilestoneMutation.mutate({
      projectId: currentProject!.id,
      requestBody: {
        milestone_date: new Date(newMilestone.milestone_date).toISOString(),
        description: newMilestone.description,
        status: newMilestone.status,
      }
    })
  }

  const handleSubmitEditMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    editMilestoneMutation.mutate({
      requestBody: {
        milestone_date: new Date(editingMilestone.milestone_date).toISOString(),
        description: editingMilestone.description,
        status: editingMilestone.status,
      }
    })
  }

  const handleSubmitProgress = (e: React.FormEvent) => {
    e.preventDefault()
    addProgressMutation.mutate({
      description: newProgress.description,
      progress_type: newProgress.progress_type, // 直接使用中文值
      progress_date: new Date(newProgress.progress_date).toISOString(),
    })
  }

  const handleSubmitEditProgress = (e: React.FormEvent) => {
    e.preventDefault()
    editProgressMutation.mutate({
      description: editingProgress.description,
      progress_type: editingProgress.progress_type,
      progress_date: new Date(editingProgress.progress_date).toISOString(),
    })
  }

  // 获取里程碑状态对应的颜色和图标
  const getMilestoneStatusProps = (status: string) => {
    const color = getMilestoneStatusColor(status)
    switch (status) {
      case '完成':
        return { color, icon: <CheckIcon /> }
      case '延期':
        return { color, icon: <WarningIcon /> }
      case '正常':
      default:
        return { color, icon: <ScheduleIcon /> }
    }
  }

  if (!project || !currentProject) {
    return null
  }

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentProject.name}</Typography>
          <Chip 
            label={currentProject.project_type} 
            color={getProjectTypeColor(currentProject.project_type) as any}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="项目详情标签页">
            <Tab label="基本信息" {...a11yProps(0)} />
            <Tab label="时间计划" {...a11yProps(1)} />
            <Tab label="项目进展" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
                  项目基本信息
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        项目名称
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{currentProject.name}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        项目类型
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{currentProject.project_type}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        项目属地
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip 
                        label={currentProject.location} 
                        size="small"
                        color={getLocationColor(currentProject.location) as any}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        项目产品
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      {currentProject.products && currentProject.products.length > 0 ? (
                        <Box>
                          {currentProject.products.map((product: any, index: number) => (
                            <Box key={index} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {product.product_name}
                              </Typography>
                              {product.product_amount && (
                                <Typography variant="caption" color="text.secondary">
                                  金额: ¥{product.product_amount.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body1" color="text.secondary">未设置</Typography>
                      )}
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {currentProject.project_type === '机会点' ? '预算金额' : '合同金额'}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {currentProject.contract_amount ? `¥${currentProject.contract_amount.toLocaleString()}` : '未设置'}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        创建时间
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {new Date(currentProject.created_at).toLocaleString()}
                      </Typography>
                    </Grid>

                    {currentProject.import_time && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            项目导入时间
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {new Date(currentProject.import_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
                  项目背景信息
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 2 }}>
                  {currentProject.background || '暂无项目背景信息'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
                    项目角色成员
                  </Typography>
                </Box>
                {currentProject.role_assignments && currentProject.role_assignments.length > 0 ? (
                  <Grid container spacing={2}>
                    {currentProject.role_assignments.map((role: any) => (
                      <Grid item key={role.id} xs={12} sm={6} md={4}>
                        <Chip 
                          label={`${role.role_name}: ${role.user_name || '未知用户'}`} 
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    暂无项目角色成员
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
              项目时间计划
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMilestone}
            >
              添加里程碑
            </Button>
          </Box>

          {isMilestonesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : milestonesError ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="error">
                加载里程碑失败: {milestonesError.message}
              </Typography>
            </Box>
          ) : milestones && milestones.length > 0 ? (
            <Timeline position="alternate">
              {milestones.sort((a: any, b: any) => 
                new Date(b.milestone_date).getTime() - new Date(a.milestone_date).getTime()
              ).map((milestone: any, index: number) => {
                const statusProps = getMilestoneStatusProps(milestone.status)
                return (
                  <TimelineItem key={milestone.id}>
                    <TimelineOppositeContent color="text.secondary">
                      {new Date(milestone.milestone_date).toLocaleDateString()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={statusProps.color as any}>
                        {statusProps.icon}
                      </TimelineDot>
                      {index < milestones.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            {milestone.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={milestone.status} 
                              size="small" 
                              color={statusProps.color as any} 
                              sx={{ ml: 1 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleEditMilestone(milestone)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                暂无里程碑信息
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMilestone}
                sx={{ mt: 2 }}
              >
                添加第一个里程碑
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
              项目进展记录
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProgress}
            >
              添加进展
            </Button>
          </Box>

          {isProgressesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : progresses && progresses.length > 0 ? (
            <Grid container spacing={3}>
              {progresses.sort((a: any, b: any) => 
                new Date(b.progress_date).getTime() - new Date(a.progress_date).getTime()
              ).map((progress: any) => (
                <Grid item key={progress.id} xs={12}>
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: progress.progress_type === '日进展' ? 'primary.main' : 'secondary.main' }}>
                          {progress.progress_type === '日进展' ? 'D' : 'W'}
                        </Avatar>
                      }
                      title={`${progress.progress_type} - ${new Date(progress.progress_date).toLocaleDateString()}`}
                      subheader={`跟踪人: ${progress.tracking_user_name || progress.tracking_user_id || '未知用户'}`}
                      action={
                        <Box>
                          <IconButton 
                            size="small" 
                            title="编辑"
                            onClick={() => handleEditProgress(progress)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            title="删除"
                            onClick={() => handleDeleteProgress(progress.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    />
                    <CardContent>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {progress.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                暂无进展记录
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddProgress}
                sx={{ mt: 2 }}
              >
                添加第一条进展
              </Button>
            </Box>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>

      {/* 添加里程碑对话框 */}
      <Dialog open={isAddMilestoneDialogOpen} onClose={() => setIsAddMilestoneDialogOpen(false)}>
        <form onSubmit={handleSubmitMilestone}>
          <DialogTitle>添加里程碑</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="milestone_date"
                  label="里程碑日期"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                    value={newMilestone.milestone_date}
                    onChange={handleMilestoneInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="里程碑描述"
                  fullWidth
                  required
                  value={newMilestone.description}
                  onChange={handleMilestoneInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="milestone-status-label">状态</InputLabel>
                  <Select
                    labelId="milestone-status-label"
                    name="status"
                    value={newMilestone.status}
                    label="状态"
                    onChange={handleMilestoneStatusChange}
                  >
                    {MILESTONE_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddMilestoneDialogOpen(false)}>取消</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={addMilestoneMutation.isPending}
            >
              {addMilestoneMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogActions>
          {addMilestoneMutation.error && (
            <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="body2">
                添加失败: {addMilestoneMutation.error.message}
              </Typography>
            </Box>
          )}
        </form>
      </Dialog>

      {/* 编辑里程碑对话框 */}
      <Dialog open={isEditMilestoneDialogOpen} onClose={() => setIsEditMilestoneDialogOpen(false)}>
        <form onSubmit={handleSubmitEditMilestone}>
          <DialogTitle>编辑里程碑</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="milestone_date"
                  label="里程碑日期"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={editingMilestone?.milestone_date || ''}
                  onChange={(event) => setEditingMilestone((prev: any) => ({
                    ...prev,
                    milestone_date: event.target.value,
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="里程碑描述"
                  fullWidth
                  required
                  value={editingMilestone?.description || ''}
                  onChange={(event) => setEditingMilestone((prev: any) => ({
                    ...prev,
                    description: event.target.value,
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="edit-milestone-status-label">状态</InputLabel>
                  <Select
                    labelId="edit-milestone-status-label"
                    name="status"
                    value={editingMilestone?.status || '正常'}
                    label="状态"
                    onChange={(event: SelectChangeEvent<string>) => setEditingMilestone((prev: any) => ({
                      ...prev,
                      status: event.target.value,
                    }))}
                  >
                    {MILESTONE_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditMilestoneDialogOpen(false)}>取消</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={editMilestoneMutation.isPending}
            >
              {editMilestoneMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogActions>
          {editMilestoneMutation.error && (
            <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="body2">
                编辑失败: {(editMilestoneMutation.error as Error).message}
              </Typography>
            </Box>
          )}
        </form>
      </Dialog>

      {/* 添加进展对话框 */}
      <Dialog open={isAddProgressDialogOpen} onClose={() => setIsAddProgressDialogOpen(false)}>
        <form onSubmit={handleSubmitProgress}>
          <DialogTitle>添加项目进展</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="progress-type-label">进展类型</InputLabel>
                  <Select
                    labelId="progress-type-label"
                    name="progress_type"
                    value={newProgress.progress_type}
                    label="进展类型"
                    onChange={handleProgressTypeChange}
                  >
                    {PROGRESS_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="progress_date"
                  label="进展日期"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newProgress.progress_date}
                  onChange={handleProgressInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="进展描述"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={newProgress.description}
                  onChange={handleProgressInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddProgressDialogOpen(false)}>取消</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={addProgressMutation.isPending}
            >
              {addProgressMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 编辑进展对话框 */}
      <Dialog open={isEditProgressDialogOpen} onClose={() => setIsEditProgressDialogOpen(false)}>
        <form onSubmit={handleSubmitEditProgress}>
          <DialogTitle>编辑项目进展</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="edit-progress-type-label">进展类型</InputLabel>
                  <Select
                    labelId="edit-progress-type-label"
                    name="progress_type"
                    value={editingProgress?.progress_type || ''}
                    label="进展类型"
                    onChange={(event: SelectChangeEvent<string>) => setEditingProgress((prev: any) => ({
                      ...prev,
                      progress_type: event.target.value,
                    }))}
                  >
                    {PROGRESS_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="progress_date"
                  label="进展日期"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={editingProgress?.progress_date ? new Date(editingProgress.progress_date).toISOString().split('T')[0] : ''}
                  onChange={(event) => setEditingProgress((prev: any) => ({
                    ...prev,
                    progress_date: event.target.value,
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="进展描述"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={editingProgress?.description || ''}
                  onChange={(event) => setEditingProgress((prev: any) => ({
                    ...prev,
                    description: event.target.value,
                  }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditProgressDialogOpen(false)}>取消</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={editProgressMutation.isPending}
            >
              {editProgressMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default ProjectDetail
