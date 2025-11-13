import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductDictService } from '@/client'
import useCustomToast from '@/hooks/useCustomToast'

interface ProductDict {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at?: string
}

const ProductDictManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductDict | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const queryClient = useQueryClient()
  const toast = useCustomToast()

  const { data: productDicts, isLoading } = useQuery({
    queryKey: ['product-dict'],
    queryFn: () => ProductDictService.readProductDicts({ limit: 1000 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      ProductDictService.createProductDict({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-dict'] })
      handleCloseDialog()
    },
    onError: (err: any) => {
      setError(err?.body?.detail || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      ProductDictService.updateProductDict({ productDictId: id, requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-dict'] })
      handleCloseDialog()
    },
    onError: (err: any) => {
      setError(err?.body?.detail || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      ProductDictService.deleteProductDict({ productDictId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-dict'] })
    },
    onError: (err: any) => {
      setError(err?.body?.detail || '删除失败')
    },
  })

  const importMutation = useMutation({
    mutationFn: () => ProductDictService.importFromProjects(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-dict'] })
      setImportResult(data)
      let message = `导入完成！成功导入 ${data.imported} 个产品，跳过 ${data.skipped} 个已存在的产品`
      if (data.errors && data.errors.length > 0) {
        message += `，有 ${data.errors.length} 个产品导入时出错`
      }
      toast.showSuccessToast(message)
    },
    onError: (err: any) => {
      const errorMsg = err?.body?.detail || err?.message || '导入失败，请检查后端日志'
      console.error('导入失败:', err)
      toast.showErrorToast(errorMsg)
      setError(errorMsg)
    },
  })

  const handleOpenDialog = (product?: ProductDict) => {
    if (product) {
      setEditingProduct(product)
      setFormData({ name: product.name, description: product.description || '' })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '' })
    }
    setError(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({ name: '', description: '' })
    setError(null)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('产品名称不能为空')
      return
    }

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        },
      })
    } else {
      createMutation.mutate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该产品吗？')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          产品字典管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => {
              if (window.confirm('确定要从现有项目中导入产品名称吗？已存在的产品将被跳过。')) {
                importMutation.mutate()
              }
            }}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? '导入中...' : '从项目导入'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            添加产品
          </Button>
        </Box>
      </Box>

      {importResult && (
        <Alert 
          severity={importResult.errors && importResult.errors.length > 0 ? "warning" : "success"} 
          sx={{ mb: 2 }}
        >
          导入完成：成功导入 {importResult.imported} 个产品，跳过 {importResult.skipped} 个已存在的产品，共 {importResult.total} 个产品。
          {importResult.errors && importResult.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" component="div">
                部分错误：
              </Typography>
              {importResult.errors.slice(0, 3).map((err: string, idx: number) => (
                <Typography key={idx} variant="caption" component="div" sx={{ fontSize: '0.75rem' }}>
                  {err}
                </Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}

      {error && !importResult && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>产品名称</TableCell>
              <TableCell>产品描述</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : productDicts && productDicts.length > 0 ? (
              productDicts.map((product: ProductDict) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {product.description || (
                      <Typography variant="body2" color="text.secondary">
                        无描述
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  暂无产品数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? '编辑产品' : '添加产品'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="产品名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              error={!!error && !formData.name.trim()}
            />
            <TextField
              fullWidth
              label="产品描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              placeholder="可选，输入产品描述信息"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingProduct ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProductDictManagement

