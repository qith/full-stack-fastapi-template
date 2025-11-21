import React, { useState, useEffect } from 'react'
import {Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
  Divider,
  GridLegacy as Grid,} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { ProjectsService } from '@/client'
import { PROJECT_LOCATIONS, PROJECT_TYPES } from '@/constants/projectConstants'
import MilestoneInput from './MilestoneInput'
import RoleMemberInput from './RoleMemberInput'
import ProductInput from './ProductInput'

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project?: any
}

interface RoleMember {
  id: string
  role: string
  name: string
  email: string
  phone: string
  description: string
}

interface Product {
  id: string
  product_name: string
  product_amount: number | null
}

const ProjectForm: React.FC<ProjectFormProps> = ({ open, onClose, onSuccess, project }) => {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [milestones, setMilestones] = useState<any[]>([])
  const [roleMembers, setRoleMembers] = useState<RoleMember[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const queryClient = useQueryClient()

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      project_type: '交付',
      location: '华北',
      contract_amount: '',
      background: '',
      import_time: '',
    }
  })

  const projectType = watch('project_type')

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        project_type: project.project_type,
        location: project.location,
        contract_amount: project.contract_amount ? String(project.contract_amount) : '',
        background: project.background || '',
        import_time: project.import_time ? new Date(project.import_time).toISOString().slice(0, 7) : '',
      })
      setMilestones((project.milestones || []).map((milestone: any) => ({
        ...milestone,
        milestone_date: milestone.milestone_date ? new Date(milestone.milestone_date).toISOString().split('T')[0] : ''
      })))
      // 初始化产品数据
      setProducts(project.products?.map((product: any, index: number) => ({
        id: `existing-${index}`,
        product_name: product.product_name,
        product_amount: product.product_amount,
      })) || [])
      // 初始化角色成员数据
      setRoleMembers(project.role_assignments?.map((assignment: any, index: number) => ({
        id: `existing-${index}`,
        role: assignment.role_name,
        name: assignment.user_name || '未知用户',
        email: assignment.user_email || '',
        phone: assignment.user_phone || '',
        description: assignment.user_description || '',
      })) || [])
    } else {
      reset({
        name: '',
        project_type: '交付',
        location: '华北',
        contract_amount: '',
        background: '',
        import_time: '',
      })
      setMilestones([])
      setProducts([])
      setRoleMembers([])
    }
  }, [project, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const filteredProducts = products.filter(p => p.product_name && p.product_name.trim() !== '')
      const filteredRoleMembers = roleMembers.filter(member => member.role && member.name && member.name.trim() !== '')
      
      const formattedData: any = {
        name: data.name || '',
        project_type: data.project_type || '交付',
        location: data.location || '',
        contract_amount: data.contract_amount ? parseFloat(data.contract_amount) : null,
        background: data.background || null,
        import_time: data.import_time ? new Date(data.import_time + '-01T00:00:00Z').toISOString() : null,
        products: filteredProducts.map(p => ({
          product_name: p.product_name.trim(),
          product_amount: p.product_amount,
        })),
        milestones: milestones.map(m => ({
          milestone_date: m.milestone_date,
          description: m.description,
          status: m.status,
        })),
        role_assignments: filteredRoleMembers.map(member => ({
          role_name: member.role,
          user_name: member.name.trim(),
          user_email: member.email,
          user_phone: member.phone,
          user_description: member.description,
        })),
      }

      if (project) {
        // 更新项目
        await ProjectsService.updateProject({
          projectId: project.id,
          requestBody: formattedData,
        })
      } else {
        // 创建项目
        await ProjectsService.createProject({ requestBody: formattedData })
      }

      // 强制刷新所有相关缓存
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-statistics'] })
      // 强制重新获取统计数据
      await queryClient.refetchQueries({ queryKey: ['project-statistics'] })
      
      onSuccess()
      reset()
    } catch (err) {
      console.error('保存项目失败:', err)
      setError('保存项目失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{project ? '编辑项目' : '新建项目'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Controller
                name="name"
                control={control}
                rules={{ required: '项目名称不能为空' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="项目名称"
                    fullWidth
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message?.toString()}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="contract_amount"
                control={control}
                rules={{
                  validate: (value) => {
                    if (value && isNaN(parseFloat(value))) {
                      return '请输入有效的金额';
                    }
                    return true;
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={projectType === '机会点' ? '预算金额' : '合同金额'}
                    fullWidth
                    variant="outlined"
                    type="number"
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    error={!!errors.contract_amount}
                    helperText={errors.contract_amount?.message?.toString()}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="project_type"
                control={control}
                rules={{ required: '项目类型不能为空' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.project_type}>
                    <InputLabel id="project-type-label">项目类型</InputLabel>
                    <Select
                      {...field}
                      labelId="project-type-label"
                      label="项目类型"
                    >
                      {PROJECT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    {errors.project_type && (
                      <FormHelperText>{errors.project_type.message?.toString()}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                rules={{ required: '项目属地不能为空' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel id="location-label">项目属地</InputLabel>
                    <Select
                      {...field}
                      labelId="location-label"
                      label="项目属地"
                    >
                      {PROJECT_LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
                      ))}
                    </Select>
                    {errors.location && (
                      <FormHelperText>{errors.location.message?.toString()}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>



            <Grid item xs={12}>
              <ProductInput
                products={products}
                onChange={setProducts}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="import_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="项目导入时间"
                    fullWidth
                    variant="outlined"
                    type="month"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="选择项目的导入年月（可选）"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Controller
                name="background"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="项目背景信息"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="请输入项目背景信息..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <RoleMemberInput
                roleMembers={roleMembers}
                onChange={setRoleMembers}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <MilestoneInput
                milestones={milestones}
                onChange={setMilestones}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProjectForm
