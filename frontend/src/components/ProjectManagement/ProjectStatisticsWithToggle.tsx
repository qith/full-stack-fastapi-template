import React, { useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { BarChart, PieChart } from '@mui/icons-material'
import ProjectStatistics from './ProjectStatistics'
import ProjectStatisticsECharts from './ProjectStatisticsECharts'

const ProjectStatisticsWithToggle: React.FC = () => {
  const [chartType, setChartType] = useState<'recharts' | 'echarts'>('echarts')

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newChartType: 'recharts' | 'echarts' | null,
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType)
    }
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="图表类型选择"
          size="small"
        >
          <ToggleButton value="echarts" aria-label="ECharts">
            <BarChart sx={{ mr: 1 }} />
            ECharts
          </ToggleButton>
          <ToggleButton value="recharts" aria-label="Recharts">
            <PieChart sx={{ mr: 1 }} />
            Recharts
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {chartType === 'echarts' ? (
        <ProjectStatisticsECharts />
      ) : (
        <ProjectStatistics />
      )}
    </Box>
  )
}

export default ProjectStatisticsWithToggle
