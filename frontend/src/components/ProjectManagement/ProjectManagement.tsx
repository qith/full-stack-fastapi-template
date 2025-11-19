import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  GridLegacy as Grid,
  IconButton,
} from '@mui/material'
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'

import { ProjectsService } from '@/client'
import { getLocationColor, getProjectTypeColor, getProjectStatusColor } from '@/constants/projectConstants'
import ProjectStatisticsWithToggle from './ProjectStatisticsWithToggle'
import ProjectList from './ProjectList'
import ProjectForm from './ProjectForm'
import ProjectDetail from './ProjectDetail'
import DeleteProjectDialog from './DeleteProjectDialog'
import ProductDictManagement from './ProductDictManagement'

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  }
}

const ProjectManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsService.readProjects(),
  })

  const { data: statistics, isLoading: isStatsLoading, refetch: refetchStatistics } = useQuery({
    queryKey: ['project-statistics'],
    queryFn: () => ProjectsService.getProjectStatistics(),
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleCreateDialogOpen = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false)
  }

  const handleProjectCreated = () => {
    refetch()
    refetchStatistics()
    handleCreateDialogClose()
  }

  const handleEditProject = (project: any) => {
    setSelectedProject(project)
    setIsEditDialogOpen(true)
  }

  const handleViewProject = (project: any) => {
    setSelectedProject(project)
    setIsDetailDialogOpen(true)
  }

  const handleDeleteClick = (project: any) => {
    setSelectedProject(project)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedProject) {
      setIsDeleting(true)
      try {
        await ProjectsService.deleteProject({ projectId: selectedProject.id })
        setIsDeleteDialogOpen(false)
        setSelectedProject(null)
        refetch()
        refetchStatistics()
      } catch (error) {
        console.error('删除项目失败:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCloseProject = async (projectId: string) => {
    try {
      await ProjectsService.closeProject({ projectId })
      refetch()
      refetchStatistics()
    } catch (error) {
      console.error('关闭项目失败:', error)
    }
  }

  const handleCompleteProject = async (projectId: string) => {
    try {
      await ProjectsService.completeProject({ projectId })
      refetch()
      refetchStatistics()
    } catch (error) {
      console.error('完成项目失败:', error)
    }
  }

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
    setSelectedProject(null)
  }

  const handleDetailDialogClose = () => {
    setIsDetailDialogOpen(false)
    setSelectedProject(null)
  }

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedProject(null)
    setIsDeleting(false)
  }

  const handleProjectUpdated = () => {
    refetch()
    refetchStatistics()
    handleEditDialogClose()
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">加载项目数据时出错</Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontSize: '1.875rem', fontWeight: 600 }}>
          项目管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          新建项目
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="项目管理标签页">
          <Tab label="项目概览" {...a11yProps(0)} />
          <Tab label="项目列表" {...a11yProps(1)} />
          <Tab label="统计分析" {...a11yProps(2)} />
          <Tab label="产品字典" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            项目统计
          </Typography>
          {isStatsLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                    bgcolor: 'grey.700',
                    color: 'white',
                  }}
                >
                  <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                    总项目数
                  </Typography>
                  <Typography component="p" variant="h3">
                    {statistics?.total_projects || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                    bgcolor: 'success.light',
                    color: 'white',
                  }}
                >
                  <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                    交付项目
                  </Typography>
                  <Typography component="p" variant="h3">
                    {statistics?.by_type.find(t => t.project_type === '交付')?.count || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                    bgcolor: 'primary.light',
                    color: 'white',
                  }}
                >
                  <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                    PoC点
                  </Typography>
                  <Typography component="p" variant="h3">
                    {statistics?.by_type.find(t => t.project_type === 'PoC')?.count || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                    bgcolor: 'warning.light',
                    color: 'white',
                  }}
                >
                  <Typography component="h2" variant="h6" color="inherit" gutterBottom>
                    机会点
                  </Typography>
                  <Typography component="p" variant="h3">
                    {statistics?.by_type.find(t => t.project_type === '机会点')?.count || 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            最近项目
          </Typography>
          <Grid container spacing={3}>
            {projects?.slice(0, 4).map((project) => (
              <Grid item key={project.id} xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" noWrap sx={{ fontSize: '1rem', fontWeight: 600, flex: 1, mr: 1 }}>
                        {project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Chip 
                          label={project.status || '正常'} 
                          size="small"
                          color={getProjectStatusColor(project.status || '正常') as any}
                          variant="filled"
                        />
                        <Chip 
                          label={project.location} 
                          size="small"
                          color={getLocationColor(project.location) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={project.project_type} 
                          size="small" 
                          color={getProjectTypeColor(project.project_type) as any}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      {project.products && project.products.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {project.products.slice(0, 2).map((product: any, index: number) => (
                            <Chip 
                              key={index}
                              label={product.product_name} 
                              size="small" 
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                          {project.products.length > 2 && (
                            <Chip 
                              label={`+${project.products.length - 2}`} 
                              size="small" 
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                    {project.contract_amount && (
                      <Typography variant="body2" color="text.secondary">
                        {project.project_type === '机会点' ? '预算' : '合同'}: ¥{project.contract_amount.toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      创建时间: {new Date(project.created_at).toLocaleDateString()}
                    </Typography>
                    {project.import_time && (
                      <Typography variant="body2" color="text.secondary">
                        导入时间: {new Date(project.import_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewProject(project)}
                        title="查看详情"
                      >
                        <AssignmentIcon />
                      </IconButton>
                      {(project.status === '正常' || !project.status) && (
                        <>
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleEditProject(project)}
                            title="编辑项目"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleCloseProject(project.id)}
                            title="关闭项目"
                          >
                            <CloseIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCompleteProject(project.id)}
                            title="完成项目"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(project)}
                        title="删除项目"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Button 
                      size="small" 
                      startIcon={<TimelineIcon />}
                      onClick={() => handleViewProject(project)}
                    >
                      查看进展
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProjectList projects={projects || []} onProjectUpdated={refetch} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ p: 0 }}>
          <ProjectStatisticsWithToggle />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ProductDictManagement />
      </TabPanel>

      <ProjectForm 
        open={isCreateDialogOpen} 
        onClose={handleCreateDialogClose} 
        onSuccess={handleProjectCreated}
      />

      {/* 编辑项目对话框 */}
      <ProjectForm
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleProjectUpdated}
        project={selectedProject}
      />

      {/* 项目详情对话框 */}
      <ProjectDetail
        open={isDetailDialogOpen}
        onClose={handleDetailDialogClose}
        project={selectedProject}
        onProjectUpdated={refetch}
      />

      {/* 删除确认对话框 */}
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        projectName={selectedProject?.name || ''}
        loading={isDeleting}
      />
    </Container>
  )
}

export default ProjectManagement
