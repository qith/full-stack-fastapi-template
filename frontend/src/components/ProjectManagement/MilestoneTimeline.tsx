import React from 'react'
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
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'

interface Milestone {
  id?: string
  milestone_date: string | Date
  description: string
  status?: 'NORMAL' | 'DELAYED' | 'COMPLETED' | '正常' | '延期' | '完成'
}

interface MilestoneTimelineProps {
  milestones: Milestone[]
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const getStatusIcon = (status?: string) => {
    const normalizedStatus = status?.toUpperCase()
    switch (normalizedStatus) {
      case 'COMPLETED':
      case '完成':
        return <CheckCircleIcon />
      case 'DELAYED':
      case '延期':
        return <ErrorIcon />
      default:
        return <ScheduleIcon />
    }
  }

  const getStatusColor = (status?: string): "success" | "error" | "primary" | "warning" => {
    const normalizedStatus = status?.toUpperCase()
    switch (normalizedStatus) {
      case 'COMPLETED':
      case '完成':
        return 'success'
      case 'DELAYED':
      case '延期':
        return 'error'
      default:
        return 'primary'
    }
  }

  const getStatusLabel = (status?: string) => {
    const normalizedStatus = status?.toUpperCase()
    switch (normalizedStatus) {
      case 'COMPLETED':
        return '完成'
      case 'DELAYED':
        return '延期'
      case 'NORMAL':
        return '正常'
      default:
        return status || '正常'
    }
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (!milestones || milestones.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无里程碑计划
        </Typography>
      </Box>
    )
  }

  // 按日期排序里程碑
  const sortedMilestones = [...milestones].sort((a, b) => {
    return new Date(a.milestone_date).getTime() - new Date(b.milestone_date).getTime()
  })

  return (
    <Timeline position="alternate">
      {sortedMilestones.map((milestone, index) => (
        <TimelineItem key={milestone.id || index}>
          <TimelineOppositeContent color="text.secondary">
            <Typography variant="body2">
              {formatDate(milestone.milestone_date)}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={getStatusColor(milestone.status)}>
              {getStatusIcon(milestone.status)}
            </TimelineDot>
            {index < sortedMilestones.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {milestone.description}
              </Typography>
              <Chip
                label={getStatusLabel(milestone.status)}
                size="small"
                color={getStatusColor(milestone.status)}
                sx={{ mt: 1 }}
              />
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export default MilestoneTimeline

