import React, { useState } from 'react'
import {Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  GridLegacy as Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Tab,
  Tabs,} from '@mui/material'
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import MilestoneTimeline from './MilestoneTimeline'
import { getProjectTypeColor } from '@/constants/projectConstants'

interface ProjectDetailDialogProps {
  open: boolean
  onClose: () => void
  project: any
  onEdit: () => void
}

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const ProjectDetailDialog: React.FC<ProjectDetailDialogProps> = ({
  open,
  onClose,
  project,
  onEdit,
}) => {
  const [tabValue, setTabValue] = useState(0)

  if (!project) return null

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 使用统一的颜色定义（已从 projectConstants 导入 getProjectTypeColor）

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {project.name}
          </Typography>
          <Chip
            label={project.project_type}
            color={getProjectTypeColor(project.project_type)}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project detail tabs">
          <Tab label="基本信息" />
          <Tab label="里程碑计划" />
          <Tab label="进展跟踪" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      项目类型
                    </Typography>
                  </Box>
                  <Typography variant="body1">{project.project_type}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      项目属地
                    </Typography>
                  </Box>
                  <Typography variant="body1">{project.location}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      产品名称
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {project.products && project.products.length > 0 
                      ? project.products.map((p: any) => p.product_name).join(', ')
                      : '未设置'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      {project.project_type === '机会点' ? '预算金额' : '合同金额'}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {project.contract_amount
                      ? `¥${project.contract_amount.toLocaleString()}`
                      : '未填写'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {project.background && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      项目背景
                    </Typography>
                    <Typography variant="body2">{project.background}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  创建时间: {formatDate(project.created_at)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  更新时间: {formatDate(project.updated_at)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <MilestoneTimeline milestones={project.milestones || []} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              进展跟踪功能开发中...
            </Typography>
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          关闭
        </Button>
        <Button onClick={onEdit} variant="contained" startIcon={<EditIcon />}>
          编辑项目
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProjectDetailDialog

