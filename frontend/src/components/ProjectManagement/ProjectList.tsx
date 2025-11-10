import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  GridLegacy as Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { ProjectsService } from '@/client'
import { getLocationColor, getProjectTypeColor, getProjectStatusColor } from '@/constants/projectConstants'
import useCustomToast from '@/hooks/useCustomToast'

import ProjectForm from './ProjectForm'
import DeleteProjectDialog from './DeleteProjectDialog'
import ProjectDetail from './ProjectDetail'

interface ProjectListProps {
  projects: any[]
  onProjectUpdated: () => void
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProjectType, setSelectedProjectType] = useState<string>('')
  const [selectedProductName, setSelectedProductName] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [closingProjectId, setClosingProjectId] = useState<string | null>(null)
  const toast = useCustomToast()

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
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
        onProjectUpdated()
        toast.showSuccessToast('项目删除成功')
      } catch (error: any) {
        console.error('删除项目失败:', error)
        toast.showErrorToast(error?.body?.detail || '删除项目失败')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCloseProject = async (projectId: string) => {
    setClosingProjectId(projectId)
    try {
      await ProjectsService.closeProject({ projectId })
      onProjectUpdated()
      toast.showSuccessToast('项目已关闭')
    } catch (error: any) {
      console.error('关闭项目失败:', error)
      toast.showErrorToast(error?.body?.detail || '关闭项目失败')
    } finally {
      setClosingProjectId(null)
    }
  }

  const handleCompleteProject = async (projectId: string) => {
    try {
      await ProjectsService.completeProject({ projectId })
      onProjectUpdated()
      toast.showSuccessToast('项目已完成')
    } catch (error: any) {
      console.error('完成项目失败:', error)
      toast.showErrorToast(error?.body?.detail || '完成项目失败')
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
    onProjectUpdated()
    handleEditDialogClose()
  }

  // 获取可用产品名称 - 根据选中的项目类型进行过滤
  const availableProductNames = useMemo(() => {
    const productSet = new Set<string>()
    projects.forEach(project => {
      // 如果选择了项目类型，只考虑该类型的项目
      if (!selectedProjectType || project.project_type === selectedProjectType) {
        project.products?.forEach((p: any) => {
          if (p.product_name) {
            productSet.add(p.product_name)
          }
        })
      }
    })
    return Array.from(productSet).sort()
  }, [projects, selectedProjectType])

  // 当项目类型改变时，如果当前选中的产品不在新的产品列表中，则清除产品选择
  React.useEffect(() => {
    if (selectedProductName && !availableProductNames.includes(selectedProductName)) {
      setSelectedProductName('')
    }
  }, [selectedProjectType, availableProductNames, selectedProductName])

  // 过滤项目
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 搜索框过滤
      const matchesSearch = !searchTerm ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.products?.some((p: any) => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))

      // 项目类型过滤
      const matchesProjectType = !selectedProjectType || project.project_type === selectedProjectType

      // 产品名称过滤
      const matchesProduct = !selectedProductName || 
        project.products?.some((p: any) => p.product_name === selectedProductName)

      return matchesSearch && matchesProjectType && matchesProduct
    })
  }, [projects, searchTerm, selectedProjectType, selectedProductName])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedProjectType('')
    setSelectedProductName('')
  }

  const hasActiveFilters = searchTerm || selectedProjectType || selectedProductName

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="搜索项目..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>项目类型</InputLabel>
          <Select
            value={selectedProjectType}
            onChange={(e) => setSelectedProjectType(e.target.value)}
            label="项目类型"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="交付">交付</MenuItem>
            <MenuItem value="PoC">PoC</MenuItem>
            <MenuItem value="机会点">机会点</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          size="small"
          options={availableProductNames}
          value={selectedProductName || null}
          onChange={(_, newValue) => setSelectedProductName(newValue || '')}
          renderInput={(params) => <TextField {...params} label="产品名称" />}
          sx={{ minWidth: 200 }}
          disabled={!selectedProjectType && availableProductNames.length === 0}
        />

        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            清除筛选
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Grid item key={project.id} xs={12} sm={6} md={4}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 600, flex: 1 }}>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
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
                  <Box sx={{ mb: 2 }}>
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
                          disabled={closingProjectId === project.id}
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
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="textSecondary">
              未找到匹配的项目
            </Typography>
          </Grid>
        )}
      </Grid>

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
        onProjectUpdated={onProjectUpdated}
      />

      {/* 删除确认对话框 */}
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        projectName={selectedProject?.name || ''}
        loading={isDeleting}
      />
    </Box>
  )
}

export default ProjectList
