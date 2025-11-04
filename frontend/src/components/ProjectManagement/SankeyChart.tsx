import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'

// 类型定义
interface SankeyNode {
  id: string
  name: string
  type: 'location' | 'product'
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}

interface SankeyLink {
  source: string | SankeyNode
  target: string | SankeyNode
  value: number
  width?: number
}

interface SankeyChartProps {
  data: Array<{
    location: string
    product: string
    count: number
  }>
}

const SankeyChart: React.FC<SankeyChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // 清除之前的内容

    const width = 800
    const height = 400
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    // 创建桑基图数据
    const nodes: SankeyNode[] = []
    const links: SankeyLink[] = []

    // 收集所有唯一的区域和产品
    const locations = [...new Set(data.map(d => d.location))]
    const products = [...new Set(data.map(d => d.product))]

    // 创建节点
    locations.forEach((location, i) => {
      nodes.push({
        id: `location-${i}`,
        name: location,
        type: 'location'
      })
    })

    products.forEach((product, i) => {
      nodes.push({
        id: `product-${i}`,
        name: product,
        type: 'product'
      })
    })

    // 创建连接
    data.forEach(d => {
      const sourceIndex = locations.indexOf(d.location)
      const targetIndex = products.indexOf(d.product)
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        links.push({
          source: `location-${sourceIndex}`,
          target: `product-${targetIndex}`,
          value: d.count
        })
      }
    })

    // 创建桑基图
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d: SankeyNode) => d.id)
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    })

    // 绘制节点
    const node = svg.append('g')
      .selectAll('.node')
      .data(sankeyNodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: SankeyNode) => `translate(${d.x0},${d.y0})`)

    node.append('rect')
      .attr('height', (d: SankeyNode) => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', (d: SankeyNode) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d: SankeyNode) => d.type === 'location' ? '#8884d8' : '#82ca9d')
      .attr('opacity', 0.8)

    // 添加节点标签
    node.append('text')
      .attr('x', (d: SankeyNode) => d.type === 'location' ? -6 : 6)
      .attr('y', (d: SankeyNode) => ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: SankeyNode) => d.type === 'location' ? 'end' : 'start')
      .text((d: SankeyNode) => d.name)
      .style('font-size', '12px')
      .style('fill', '#333')

    // 绘制连接
    const link = svg.append('g')
      .selectAll('.link')
      .data(sankeyLinks)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: SankeyLink) => Math.max(1, d.width || 1))
      .attr('fill', 'none')

    // 添加连接标签
    link.append('title')
      .text((d: SankeyLink) => {
        const source = typeof d.source === 'string' ? d.source : d.source.name
        const target = typeof d.target === 'string' ? d.target : d.target.name
        return `${source} → ${target}: ${d.value}`
      })

  }, [data])

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          暂无区域-产品关联数据
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
        区域-产品关联分析
      </Typography>
      <Box sx={{ width: '100%', height: 350, overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    </Paper>
  )
}

export default SankeyChart
