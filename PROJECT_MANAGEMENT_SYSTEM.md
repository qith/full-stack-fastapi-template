# 项目管理系统设计文档

## 一、系统概述

本系统是一个基于 FastAPI + React + Material UI 的项目管理系统，主要功能包括项目信息录入、项目跟踪、项目统计等。

## 二、技术栈

### 后端
- **FastAPI**: Python Web 框架
- **SQLModel**: ORM 框架
- **PostgreSQL**: 关系型数据库
- **Alembic**: 数据库迁移工具

### 前端
- **React**: 前端框架
- **Material UI**: UI 组件库
- **TanStack Query**: 数据获取和缓存
- **TanStack Router**: 路由管理
- **Recharts**: 图表库

## 三、功能模块

### 1. 项目信息管理

#### 数据模型
- **项目类型**: 交付、PoC、机会点
- **项目名称**: 项目的标识名称
- **项目属地**: 项目所在地区
- **合同金额**: 
  - 交付项目或PoC项目：合同金额
  - 机会点：预算金额
- **角色分配**: 行解、区解、市场等角色，一个角色可对应多位人员
- **项目背景信息**: 项目的详细背景描述
- **产品名称**: 项目相关的产品

#### 功能特性
- ✅ 新增项目
- ✅ 查询项目（支持按名称、属地、产品搜索）
- ✅ 编辑项目
- ✅ 删除项目（级联删除关联的里程碑和进展）

### 2. 时间计划管理

#### 数据模型
- **里程碑日期**: 计划的时间节点
- **里程碑描述**: 该时间节点的目标或任务
- **状态**: 正常、延期、完成

#### 功能特性
- ✅ 添加多个时间节点和里程碑
- ✅ 时间轴可视化展示
- ✅ 显示当前时间和当前计划节点状态
- ✅ 里程碑状态管理（正常、延期、完成）
- ✅ 单个节点时显示为单点时间轴
- ✅ 编辑和删除里程碑

### 3. 项目进展管理

#### 数据模型
- **进展描述**: 详细的进展内容
- **进展类型**: 日进展、周进展
- **进展日期**: 默认为当前时间，可修改
- **进展跟踪人**: 记录进展的人员

#### 功能特性
- ✅ 新增日进展或周进展
- ✅ 查询项目所有进展记录
- ✅ 编辑进展内容和时间
- ✅ 删除进展记录
- ✅ 按时间倒序显示进展

### 4. 项目统计

#### 统计维度
- ✅ 按区域统计项目数量（柱状图）
- ✅ 按产品统计项目数量（饼图）
- ✅ 按项目类型统计项目数量（柱状图）
- ✅ 总项目数统计
- ✅ 合同总金额统计

#### 可视化展示
- 使用 Recharts 库展示统计图表
- 柱状图、饼图等多种图表类型
- 响应式设计，支持各种屏幕尺寸

## 四、页面设计

### 1. 项目概览页（默认页）

**布局结构**:
- 顶部：统计卡片（总项目数、合同总金额、交付项目数、机会点数）
- 中部：最近项目卡片展示（最多显示 4 个）
- 底部：快速操作按钮

**交互特性**:
- 项目卡片悬停效果
- 点击卡片可查看详情
- "新建项目" 按钮打开创建对话框

### 2. 项目列表页

**功能**:
- 搜索框：支持按项目名称、属地、产品搜索
- 筛选按钮：未来可扩展的筛选功能
- 项目卡片网格展示
- 每个卡片包含：
  - 项目名称
  - 项目属地
  - 项目类型标签（带颜色区分）
  - 产品标签
  - 合同金额
  - 创建时间
  - 操作按钮（查看、编辑、删除）

**交互特性**:
- 实时搜索过滤
- 卡片悬停动画效果
- 确认删除对话框

### 3. 统计分析页

**图表展示**:
- 按区域统计（柱状图）
- 按产品统计（饼图）
- 按项目类型统计（柱状图）

**特性**:
- 响应式布局
- 图表交互提示
- 数据实时更新

### 4. 项目详情对话框

**Tab 标签页**:
1. **基本信息 Tab**
   - 项目基本信息展示
   - 项目背景信息
   - 角色分配管理

2. **时间计划 Tab**
   - 时间轴可视化
   - 里程碑列表
   - 添加/编辑/删除里程碑
   - 状态标识（正常/延期/完成）

3. **项目进展 Tab**
   - 进展记录列表（按时间倒序）
   - 添加日进展/周进展
   - 编辑/删除进展记录
   - 显示跟踪人信息

## 五、API 接口

### 项目管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/projects/ | 获取项目列表 |
| POST | /api/v1/projects/ | 创建新项目 |
| GET | /api/v1/projects/{project_id} | 获取项目详情 |
| PUT | /api/v1/projects/{project_id} | 更新项目信息 |
| DELETE | /api/v1/projects/{project_id} | 删除项目 |
| GET | /api/v1/projects/statistics | 获取项目统计信息 |

### 里程碑管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/projects/{project_id}/milestones | 添加里程碑 |
| PUT | /api/v1/projects/{project_id}/milestones/{milestone_id} | 更新里程碑 |
| DELETE | /api/v1/projects/{project_id}/milestones/{milestone_id} | 删除里程碑 |

### 进展管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/projects/{project_id}/progresses | 添加进展 |
| PUT | /api/v1/projects/{project_id}/progresses/{progress_id} | 更新进展 |
| DELETE | /api/v1/projects/{project_id}/progresses/{progress_id} | 删除进展 |

### 角色分配

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/projects/{project_id}/roles | 添加角色分配 |
| DELETE | /api/v1/projects/{project_id}/roles/{role_id} | 删除角色分配 |

## 六、数据库模型

### Project（项目表）
```python
- id: UUID (主键)
- name: str (项目名称)
- project_type: ProjectType (项目类型: 交付/PoC/机会点)
- location: str (项目属地)
- contract_amount: Optional[float] (合同金额/预算金额)
- background: Optional[str] (项目背景)
- product: str (产品名称)
- created_at: datetime
- updated_at: datetime
```

### Milestone（里程碑表）
```python
- id: UUID (主键)
- project_id: UUID (外键)
- milestone_date: datetime (里程碑日期)
- description: str (描述)
- status: MilestoneStatus (状态: 正常/延期/完成)
- created_at: datetime
- updated_at: datetime
```

### Progress（进展表）
```python
- id: UUID (主键)
- project_id: UUID (外键)
- description: str (进展描述)
- progress_type: ProgressType (进展类型: 日进展/周进展)
- tracking_user_id: UUID (跟踪人外键)
- progress_date: datetime (进展日期)
- created_at: datetime
- updated_at: datetime
```

### RoleAssignment（角色分配表）
```python
- id: UUID (主键)
- project_id: UUID (外键)
- role_name: str (角色名称)
- user_id: UUID (用户外键)
- created_at: datetime
```

## 七、使用说明

### 访问项目管理系统

1. 启动后端服务
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. 启动前端服务
```bash
cd frontend
npm run dev
```

3. 访问 `http://localhost:5173/project-management`

### 操作流程

1. **创建项目**
   - 点击页面顶部 "新建项目" 按钮
   - 填写项目基本信息
   - 根据项目类型填写合同金额或预算金额
   - 保存项目

2. **查看项目**
   - 在项目列表页查看所有项目
   - 点击项目卡片查看详细信息

3. **添加里程碑**
   - 进入项目详情对话框
   - 切换到 "时间计划" Tab
   - 点击 "添加里程碑" 按钮
   - 填写里程碑信息并保存

4. **记录进展**
   - 进入项目详情对话框
   - 切换到 "项目进展" Tab
   - 点击 "添加进展" 按钮
   - 选择进展类型（日进展/周进展）
   - 填写进展内容并保存

5. **查看统计**
   - 在项目管理页切换到 "统计分析" Tab
   - 查看各种维度的统计图表

## 八、特色功能

1. **Material UI 设计风格**
   - 现代化的界面设计
   - 流畅的动画效果
   - 响应式布局

2. **实时数据更新**
   - 使用 TanStack Query 进行数据缓存和自动更新
   - 操作后自动刷新相关数据

3. **时间轴可视化**
   - 使用 Material UI Timeline 组件
   - 直观展示项目计划
   - 状态颜色标识

4. **丰富的图表展示**
   - 柱状图、饼图等多种图表类型
   - 交互式数据提示
   - 响应式设计

5. **友好的用户体验**
   - 搜索和筛选功能
   - 确认对话框防止误操作
   - 加载状态提示
   - 错误处理和提示

## 九、后续扩展建议

1. **权限管理**: 集成 RBAC 系统，实现细粒度权限控制
2. **文件上传**: 支持上传项目相关文档
3. **通知系统**: 里程碑到期提醒、进展更新通知
4. **导出功能**: 导出项目报告、统计报表
5. **批量操作**: 批量导入项目、批量更新状态
6. **高级筛选**: 按时间范围、金额范围等条件筛选
7. **项目模板**: 创建项目模板，快速创建相似项目
8. **协作功能**: 项目成员评论、讨论功能

## 十、技术亮点

1. ✅ 完整的前后端分离架构
2. ✅ RESTful API 设计
3. ✅ TypeScript 类型安全
4. ✅ 自动生成 API 客户端
5. ✅ 数据库迁移管理
6. ✅ 响应式设计
7. ✅ Material UI 最佳实践
8. ✅ 代码可维护性强
9. ✅ 组件化开发
10. ✅ 状态管理优化
