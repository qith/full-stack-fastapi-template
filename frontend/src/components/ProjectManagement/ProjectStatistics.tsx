import React from 'react'
import { Box, Paper, Typography, GridLegacy as Grid } from '@mui/material'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { ProjectsService } from '@/client'
import SankeyChart from './SankeyChart'

// 导入自定义颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface ProjectStatisticsProps {
  statistics?: any
}

const ProjectStatistics: React.FC<ProjectStatisticsProps> = ({ statistics }) => {
  // 获取区域-产品关联数据
  const { data: relationshipData, isLoading: isRelationshipLoading } = useQuery({
    queryKey: ['location-product-relationship'],
    queryFn: () => ProjectsService.getLocationProductRelationship(),
  })

  if (!statistics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>暂无统计数据</Typography>
      </Box>
    )
  }

  // 准备按区域统计数据
  const locationData = statistics.by_location?.map((item: any) => ({
    name: item.location,
    value: item.count,
  })) || []

  // 准备按产品统计数据
  const productData = statistics.by_product?.map((item: any) => ({
    name: item.product || '',
    value: item.count || 0,
  })).filter(item => item.name && item.value > 0) || []

  // 准备按项目类型统计数据
  const typeData = statistics.by_type?.map((item: any) => ({
    name: item.project_type,
    value: item.count,
  })) || []

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3 }}>
        项目统计分析
      </Typography>

      {/* 第一行：按区域统计和按项目类型统计，两个图表均分宽度 */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2,
        '& > *': { flex: 1 }
      }}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            按区域统计
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={locationData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="项目数量" fill="#8884d8">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            按项目类型统计
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={typeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="项目数量" fill="#82ca9d">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* 第二行：按产品统计，单独一行 */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            按产品统计
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* 第三行：桑基图占满整行 */}
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 2, height: 450 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
            区域-产品关联分析
          </Typography>
          <Box sx={{ height: 350 }}>
            <SankeyChart data={relationshipData || []} />
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default ProjectStatistics
