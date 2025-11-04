import React, { useState } from 'react'
import {Box,
  Button,
  TextField,
  IconButton,
  Typography,
  Card,
  CardContent,
  GridLegacy as Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material'

interface Milestone {
  milestone_date: string
  description: string
  status: string
}

interface MilestoneInputProps {
  milestones: Milestone[]
  onChange: (milestones: Milestone[]) => void
}

const MilestoneInput: React.FC<MilestoneInputProps> = ({ milestones, onChange }) => {
  const addMilestone = () => {
    const newMilestone: Milestone = {
      milestone_date: new Date().toISOString().split('T')[0],
      description: '',
      status: '正常',
    }
    onChange([...milestones, newMilestone])
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updatedMilestones = [...milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    }
    onChange(updatedMilestones)
  }

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index)
    onChange(updatedMilestones)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.125rem', fontWeight: 500 }}>
          <EventIcon />
          项目里程碑计划
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addMilestone}
          size="small"
        >
          添加里程碑
        </Button>
      </Box>

      {milestones.length === 0 ? (
        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              暂无里程碑，点击"添加里程碑"按钮创建
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {milestones.map((milestone, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="date"
                      label="完成时间"
                      value={milestone.milestone_date}
                      onChange={(e) => updateMilestone(index, 'milestone_date', e.target.value)}
                      required
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="里程碑名称"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      placeholder="例如：需求分析完成、系统设计完成等"
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>状态</InputLabel>
                      <Select
                        value={milestone.status}
                        label="状态"
                        onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                      >
                        <MenuItem value="正常">正常</MenuItem>
                        <MenuItem value="延期">延期</MenuItem>
                        <MenuItem value="完成">完成</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeMilestone(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default MilestoneInput

