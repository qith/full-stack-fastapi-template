# 前端项目创建功能修复

## 问题描述

前端提交项目创建请求时，后端返回 422 Unprocessable Entity 错误。

## 问题分析

通过 curl 测试发现后端 API 本身工作正常，问题出在前端发送的数据格式：

1. **API 调用格式不正确**: 前端直接展开数据对象，但生成的 API 客户端期望数据在 `requestBody` 参数中
2. **空字符串处理**: 某些字段可能发送了空字符串而不是 null

## 修复方案

### 更新 API 调用格式

```typescript
// 修复前
await ProjectsService.createProject(formattedData)
await ProjectsService.updateProject({
  projectId: project.id,
  ...formattedData,
})

// 修复后
await ProjectsService.createProject({ requestBody: formattedData })
await ProjectsService.updateProject({
  projectId: project.id,
  requestBody: formattedData,
})
```

### 规范化数据格式

```typescript
const formattedData: any = {
  name: data.name || '',
  project_type: data.project_type || '交付',
  location: data.location || '',
  product: data.product || '',
  contract_amount: data.contract_amount ? parseFloat(data.contract_amount) : null,
  background: data.background || null,
}
```

## 修改文件

- `/frontend/src/components/ProjectManagement/ProjectForm.tsx`

## 测试步骤

1. 访问 `http://localhost:5174/project-management`
2. 点击"添加项目"按钮
3. 填写项目信息：
   - 项目名称：必填
   - 项目类型：选择"交付"、"PoC"或"机会点"
   - 项目属地：选择地区
   - 产品名称：必填
   - 合同金额：选填
   - 项目背景：选填
4. 点击"保存"按钮
5. 验证项目是否成功创建并显示在列表中

## 预期结果

- ✅ 项目创建成功
- ✅ 页面自动刷新显示新项目
- ✅ 统计数据正确更新
- ✅ 可以查看项目详情

## 注意事项

1. **必填字段**: 项目名称、项目类型、项目属地、产品名称
2. **选填字段**: 合同金额、项目背景
3. **默认值**: 项目类型默认为"交付"
