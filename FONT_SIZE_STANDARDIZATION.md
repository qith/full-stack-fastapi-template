# 项目管理功能字体大小统一

## 📋 概述

根据用户要求，已将项目管理功能页面的字体大小统一调整为与其他功能页面（如 Items、RBAC 等）一致的标准。

## 🎯 统一标准

### Chakra UI 标准（参考页面）

其他功能页面使用 Chakra UI，字体标准为：
- **页面主标题**: `Heading size="lg"` ≈ `1.875rem` (30px)
- **区块标题**: `Heading size="md"` ≈ `1.125rem` (18px)
- **卡片标题**: `Text fontSize="lg"` ≈ `1.125rem` (18px)

### Material UI 适配标准

项目管理功能使用 Material UI，已调整为匹配 Chakra UI 的字体大小：

| 元素类型 | Material UI 变体 | 字体大小 | 字重 | 用途 |
|---------|-----------------|---------|------|------|
| 页面主标题 | `h5` | `1.875rem` | 600 | 顶级页面标题（如"项目管理"） |
| 大标题 | `h5` | `1.5rem` | 600 | 重要区块标题（如"项目统计分析"） |
| 区块标题 | `h6` | `1.125rem` | 500 | 区块标题（如"按区域统计"） |
| 卡片/项目标题 | `h6` | `1rem` | 600 | 列表项标题（如项目名称） |

## 📝 修改的文件

### 1. ProjectManagement.tsx
- **页面主标题**: "项目管理" - `h5`, `1.875rem`, `fontWeight: 600`
- **区块标题**: "项目统计"、"最近项目" - `h6`, `1.125rem`, `fontWeight: 500`
- **项目卡片标题**: 项目名称 - `h6`, `1rem`, `fontWeight: 600`

### 2. ProjectDetail.tsx
- **对话框标题**: 项目名称 - `h6`, `1.25rem`, `fontWeight: 600`
- **区块标题**: "项目基本信息"、"项目背景信息"、"角色分配"、"项目时间计划"、"项目进展记录" - `h6`, `1.125rem`, `fontWeight: 500`
- **里程碑标题**: 里程碑描述 - `h6`, `1rem`, `fontWeight: 600`

### 3. ProjectList.tsx
- **项目卡片标题**: 项目名称 - `h6`, `1rem`, `fontWeight: 600`

### 4. ProjectStatistics.tsx
- **页面标题**: "项目统计分析" - `h5`, `1.5rem`, `fontWeight: 600`
- **图表标题**: "按区域统计"、"按产品统计"、"按项目类型统计" - `h6`, `1.125rem`, `fontWeight: 500`

### 5. MilestoneInput.tsx
- **区块标题**: "项目里程碑计划" - `h6`, `1.125rem`, `fontWeight: 500`

### 6. MilestoneTimeline.tsx
- **里程碑标题**: 里程碑描述 - `h6`, `1rem`, `fontWeight: 600`

### 7. ProjectDetailDialog.tsx
- **对话框标题**: 项目名称 - `h5`, `1.5rem`, `fontWeight: 600`

## 🔄 修改前后对比

### 页面主标题
```typescript
// 修改前
<Typography variant="h4" component="h1" gutterBottom>
  项目管理
</Typography>

// 修改后
<Typography variant="h5" component="h1" gutterBottom sx={{ fontSize: '1.875rem', fontWeight: 600 }}>
  项目管理
</Typography>
```

### 区块标题
```typescript
// 修改前
<Typography variant="h6" gutterBottom>
  项目统计
</Typography>

// 修改后
<Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
  项目统计
</Typography>
```

### 项目卡片标题
```typescript
// 修改前
<Typography variant="h6" component="div" noWrap>
  {project.name}
</Typography>

// 修改后
<Typography variant="h6" component="div" noWrap sx={{ fontSize: '1rem', fontWeight: 600 }}>
  {project.name}
</Typography>
```

## 📊 字体大小对照表

| 字号 | rem | px | 用途 |
|------|-----|----|----|
| 1.875rem | 1.875rem | 30px | 页面主标题 |
| 1.5rem | 1.5rem | 24px | 大标题 |
| 1.25rem | 1.25rem | 20px | 对话框标题 |
| 1.125rem | 1.125rem | 18px | 区块标题 |
| 1rem | 1rem | 16px | 卡片/项目标题 |

## ✅ 验证结果

### 统一性检查
- [x] 页面主标题与 Items、RBAC 等页面一致
- [x] 区块标题字体大小统一
- [x] 卡片标题字体大小统一
- [x] 字重（fontWeight）合理分配
- [x] 所有文件 lint 检查通过

### 视觉对比
访问以下页面进行对比：
1. `http://localhost:5174/items` - Items 页面
2. `http://localhost:5174/rbac` - RBAC 页面
3. `http://localhost:5174/project-management` - 项目管理页面

**预期结果**：三个页面的标题字体大小应该一致，视觉效果统一。

## 🎨 设计原则

1. **层次清晰**：
   - 页面主标题最大（1.875rem）
   - 区块标题适中（1.125rem）
   - 卡片标题较小（1rem）

2. **字重搭配**：
   - 主标题：600（半粗体）
   - 区块标题：500（中等）
   - 卡片标题：600（半粗体）

3. **一致性**：
   - 相同层级的标题使用相同字体大小
   - 与 Chakra UI 页面保持视觉一致

## 📚 相关文档

- [Material UI Typography 文档](https://mui.com/material-ui/react-typography/)
- [Chakra UI Text 文档](https://v3.chakra-ui.com/docs/components/text)
- [Material UI 主题配置](./frontend/src/theme/mui-theme.ts)

## 🔧 如何修改

如果需要调整字体大小，请修改以下位置：

1. **全局主题**：
   ```typescript
   // frontend/src/theme/mui-theme.ts
   export const muiTheme = createTheme({
     typography: {
       h5: {
         fontSize: '1.875rem',
         fontWeight: 600,
       },
       h6: {
         fontSize: '1.125rem',
         fontWeight: 500,
       },
     },
   })
   ```

2. **组件内联样式**：
   ```typescript
   <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
     标题
   </Typography>
   ```

## 📌 注意事项

1. **保持一致性**：新增组件时请遵循相同的字体标准
2. **响应式**：Material UI Typography 默认支持响应式字体
3. **可访问性**：确保字体大小足够大，便于阅读
4. **跨浏览器**：使用 rem 单位保证跨浏览器一致性

## 🎉 总结

项目管理功能的字体大小已成功统一，现在与其他功能页面（Items、RBAC）保持一致的视觉风格。所有标题的层次清晰，字体大小合理，提升了整体用户体验。

