import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  GridLegacy as Grid,
  Autocomplete,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { ProductDictService } from '@/client'

interface Product {
  id: string
  product_name: string
  product_amount: number | null
}

interface ProductInputProps {
  products: Product[]
  onChange: (products: Product[]) => void
}

const ProductInput: React.FC<ProductInputProps> = ({ products, onChange }) => {
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    product_name: '',
    product_amount: null,
  })

  // 获取产品字典列表
  const { data: productDictList, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['product-dict'],
    queryFn: () => ProductDictService.readProductDicts({ limit: 1000 }),
  })

  const productOptions = productDictList?.map((item: any) => item.name) || []

  const handleAddProduct = () => {
    if (newProduct.product_name && newProduct.product_name.trim() !== '') {
      // 检查产品是否已添加
      const isDuplicate = products.some(
        p => p.product_name === newProduct.product_name?.trim()
      )
      if (isDuplicate) {
        alert('该产品已添加，请勿重复添加')
        return
      }
      
      const product: Product = {
        id: Date.now().toString(),
        product_name: newProduct.product_name.trim(),
        product_amount: newProduct.product_amount || null,
      }
      onChange([...products, product])
      setNewProduct({
        product_name: '',
        product_amount: null,
      })
    }
  }

  const handleRemoveProduct = (id: string) => {
    onChange(products.filter(product => product.id !== id))
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
        项目产品
      </Typography>

      {/* 添加新产品表单 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" gutterBottom>
          添加产品
        </Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              size="small"
              options={productOptions}
              value={newProduct.product_name || null}
              onChange={(_, newValue) => setNewProduct({ ...newProduct, product_name: newValue || '' })}
              loading={isLoadingProducts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="产品名称"
                  placeholder="选择或输入产品名称"
                />
              )}
              freeSolo
              filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(params.inputValue.toLowerCase())
                )
                // 如果输入的值不在选项中，也添加到选项中
                if (params.inputValue && !options.includes(params.inputValue)) {
                  filtered.push(params.inputValue)
                }
                return filtered
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="产品金额"
              type="number"
              value={newProduct.product_amount || ''}
              onChange={(e) => setNewProduct({ 
                ...newProduct, 
                product_amount: e.target.value ? parseFloat(e.target.value) : null 
              })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProduct}
              disabled={!newProduct.product_name}
              startIcon={<AddIcon />}
              size="small"
              sx={{ 
                height: '40px', 
                minWidth: '80px',
                width: '100%'
              }}
            >
              添加
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 显示已添加的产品 */}
      {products.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            已添加产品
          </Typography>
          {products.map((product) => (
            <Paper
              key={product.id}
              sx={{
                p: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {product.product_name}
                </Typography>
                {product.product_amount && (
                  <Typography variant="caption" color="text.secondary">
                    金额: ¥{product.product_amount.toLocaleString()}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveProduct(product.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ProductInput
