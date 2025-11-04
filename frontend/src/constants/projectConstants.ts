// 项目相关常量定义

// 项目属地选项
export const PROJECT_LOCATIONS = [
  '华北',
  '华东',
  '华中', 
  '华南',
  '西南',
  '西北',
  '非深非广',
  '澳门',
  '香港',
  '海外'
] as const

// 项目属地颜色映射
export const LOCATION_COLORS = {
  '华北': 'primary' as const,
  '华东': 'secondary' as const,
  '华中': 'success' as const,
  '华南': 'info' as const,
  '西南': 'warning' as const,
  '西北': 'error' as const,
  '非深非广': 'default' as const,
  '澳门': 'inherit' as const,
  '香港': 'primary' as const,
  '海外': 'secondary' as const,
} as const

// 项目类型选项
export const PROJECT_TYPES = [
  '交付',
  'PoC',
  '机会点'
] as const

// 项目类型颜色映射
export const PROJECT_TYPE_COLORS = {
  '交付': 'success' as const,
  'PoC': 'primary' as const,
  '机会点': 'warning' as const,
} as const

// 里程碑状态选项
export const MILESTONE_STATUSES = [
  '正常',
  '延期',
  '完成'
] as const

// 里程碑状态颜色映射
export const MILESTONE_STATUS_COLORS = {
  '正常': 'primary' as const,
  '延期': 'error' as const,
  '完成': 'success' as const,
} as const

// 进展类型选项
export const PROGRESS_TYPES = [
  '日进展',
  '周进展'
] as const

// 进展类型颜色映射
export const PROGRESS_TYPE_COLORS = {
  '日进展': 'primary' as const,
  '周进展': 'secondary' as const,
} as const

// 获取属地颜色的辅助函数
export const getLocationColor = (location: string) => {
  return LOCATION_COLORS[location as keyof typeof LOCATION_COLORS] || 'default'
}

// 获取项目类型颜色的辅助函数
export const getProjectTypeColor = (type: string) => {
  return PROJECT_TYPE_COLORS[type as keyof typeof PROJECT_TYPE_COLORS] || 'default'
}

// 获取里程碑状态颜色的辅助函数
export const getMilestoneStatusColor = (status: string) => {
  return MILESTONE_STATUS_COLORS[status as keyof typeof MILESTONE_STATUS_COLORS] || 'default'
}

// 获取进展类型颜色的辅助函数
export const getProgressTypeColor = (type: string) => {
  return PROGRESS_TYPE_COLORS[type as keyof typeof PROGRESS_TYPE_COLORS] || 'default'
}
