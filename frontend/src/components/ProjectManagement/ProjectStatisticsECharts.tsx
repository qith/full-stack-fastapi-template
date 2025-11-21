import React from 'react'
import { Paper, Typography, Box } from '@mui/material'
import ReactECharts from 'echarts-for-react'
import { useQuery } from '@tanstack/react-query'
import { ProjectsService } from '@/client'

const ProjectStatisticsECharts: React.FC = () => {
  // 获取统计数据
  const { data: statistics, isLoading: isStatisticsLoading } = useQuery({
    queryKey: ['project-statistics'],
    queryFn: () => ProjectsService.getProjectStatistics(),
  })

  // 获取区域-产品关联数据
  const { data: relationshipData } = useQuery({
    queryKey: ['location-product-relationship'],
    queryFn: () => ProjectsService.getLocationProductRelationship(),
  })

  // 获取产品-项目类型统计数据
  const { data: productTypeData } = useQuery({
    queryKey: ['product-type-statistics'],
    queryFn: () => ProjectsService.getProductTypeStatistics(),
  })

  if (isStatisticsLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>加载中...</Typography>
      </Box>
    )
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>暂无统计数据</Typography>
      </Box>
    )
  }

  // 按区域统计的柱状图配置
  const regionBarOption = {
    title: {
      text: '按区域统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.by_location?.map(item => item.location) || [],
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '项目数量'
    },
    series: [
      {
        name: '项目数量',
        type: 'bar',
        data: statistics.by_location?.map(item => ({
          value: item.count,
          itemStyle: {
            color: getRegionColor(item.location)
          }
        })) || [],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  }

  // 按项目类型统计的柱状图配置
  const typeBarOption = {
    title: {
      text: '按项目类型统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.by_type?.map(item => item.project_type) || [],
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '项目数量'
    },
    series: [
      {
        name: '项目数量',
        type: 'bar',
        data: statistics.by_type?.map(item => ({
          value: item.count,
          itemStyle: {
            color: getProjectTypeColor(item.project_type)
          }
        })) || [],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  }

  // 按产品统计的饼图配置
  const productPieOption = {
    title: {
      text: '按产品统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}个项目 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      formatter: (name: string) => {
        // 确保显示产品名称，而不是数字
        const data = statistics.by_product?.find((item: any) => item.product === name)
        if (data && data.product) {
          return `${data.product} (${data.count || 0})`
        }
        return name
      }
    },
    series: [
      {
        name: '产品分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        data: statistics.by_product?.map(item => ({
          value: item.count || 0,
          name: item.product || ''
        })).filter(item => item.name && item.value > 0) || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}\n{c} ({d}%)',
          fontSize: 12,
          fontWeight: 500
        }
      }
    ]
  }

  // 区域-产品关联桑基图配置
  const sankeyOption = {
    title: {
      text: '区域-产品关联分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: function(params: any) {
        if (params.dataType === 'node') {
          return `${params.data.name}<br/>项目数量: ${params.data.value || 0}`
        } else if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>项目数量: ${params.data.value}`
        }
        return ''
      }
    },
    series: [
      {
        type: 'sankey',
        data: getSankeyNodes(relationshipData || []),
        links: getSankeyLinks(relationshipData || []),
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#aaa'
        },
        label: {
          fontSize: 12
        }
      }
    ]
  }

  // 产品-项目类型统计堆叠柱状图配置
  const productTypeBarOption = {
    title: {
      text: '产品-项目类型统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = `${params[0].name}<br/>`
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${item.value}个项目<br/>`
        })
        const total = params.reduce((sum: number, item: any) => sum + item.value, 0)
        result += `<b>总计: ${total}个项目</b>`
        return result
      }
    },
    legend: {
      data: ['机会点', '交付', 'PoC'],
      top: 30,
      left: 'center'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: productTypeData?.map((item: any) => item.product) || [],
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '项目数量'
    },
    series: [
      {
        name: '机会点',
        type: 'bar',
        stack: 'total',
        data: productTypeData?.map((item: any) => item['机会点'] || 0) || [],
        itemStyle: {
          color: getProjectTypeColor('机会点')
        },
        label: {
          show: true,
          position: 'inside'
        }
      },
      {
        name: '交付',
        type: 'bar',
        stack: 'total',
        data: productTypeData?.map((item: any) => item['交付'] || 0) || [],
        itemStyle: {
          color: getProjectTypeColor('交付')
        },
        label: {
          show: true,
          position: 'inside'
        }
      },
      {
        name: 'PoC',
        type: 'bar',
        stack: 'total',
        data: productTypeData?.map((item: any) => item['PoC'] || 0) || [],
        itemStyle: {
          color: getProjectTypeColor('PoC')
        },
        label: {
          show: true,
          position: 'inside'
        }
      }
    ]
  }

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
          <ReactECharts 
            option={regionBarOption} 
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </Paper>

        <Paper sx={{ p: 2, height: 400 }}>
          <ReactECharts 
            option={typeBarOption} 
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </Paper>
      </Box>

      {/* 第二行：按产品统计，单独一行 */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Paper sx={{ p: 2, height: 400 }}>
          <ReactECharts 
            option={productPieOption} 
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </Paper>
      </Box>

      {/* 第三行：产品-项目类型统计，独占一行 */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Paper sx={{ p: 2, height: 450 }}>
          {productTypeData && productTypeData.length > 0 ? (
            <ReactECharts 
              option={productTypeBarOption} 
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography variant="body1" color="text.secondary">
                暂无产品-项目类型统计数据
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* 第四行：桑基图占满整行 */}
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 2, height: 450 }}>
          {relationshipData && relationshipData.length > 0 ? (
            <ReactECharts 
              option={sankeyOption} 
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography variant="body1" color="text.secondary">
                暂无区域-产品关联数据
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

// 获取区域颜色
function getRegionColor(region: string): string {
  const colors: { [key: string]: string } = {
    '华北': '#1976d2',
    '华东': '#7b1fa2',
    '华中': '#388e3c',
    '华南': '#0288d1',
    '西南': '#f57c00',
    '西北': '#d32f2f',
    '非深非莞': '#616161',
    '澳门': '#5d4037',
    '香港': '#1976d2',
    '海外': '#7b1fa2'
  }
  return colors[region] || '#666666'
}

// 获取项目类型颜色
function getProjectTypeColor(type: string): string {
  const colors: { [key: string]: string } = {
    '交付': '#1976d2',
    'PoC': '#388e3c',
    '机会点': '#f57c00'
  }
  return colors[type] || '#666666'
}

// 生成桑基图节点数据
function getSankeyNodes(data: Array<{ location: string; product: string; count: number }>): any[] {
  const locations = [...new Set(data.map(d => d.location))]
  const products = [...new Set(data.map(d => d.product))]
  
  const nodes: any[] = []
  
  // 添加区域节点
  locations.forEach((location) => {
    nodes.push({
      name: location,
      itemStyle: {
        color: getRegionColor(location)
      }
    })
  })
  
  // 添加产品节点
  products.forEach((product) => {
    nodes.push({
      name: product,
      itemStyle: {
        color: '#82ca9d'
      }
    })
  })
  
  return nodes
}

// 生成桑基图连接数据
function getSankeyLinks(data: Array<{ location: string; product: string; count: number }>): any[] {
  return data.map(d => ({
    source: d.location,
    target: d.product,
    value: d.count
  }))
}

export default ProjectStatisticsECharts
