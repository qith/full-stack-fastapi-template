import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material'

interface DeleteProjectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
  loading?: boolean
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  open,
  onClose,
  onConfirm,
  projectName,
  loading = false,
}) => {
  const [inputName, setInputName] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value)
    setError('')
  }

  const handleConfirm = () => {
    if (inputName.trim() !== projectName) {
      setError('输入的项目名称与要删除的项目名称不一致')
      return
    }
    onConfirm()
  }

  const handleClose = () => {
    setInputName('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="error">
          确认删除项目
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            此操作不可撤销！删除项目将同时删除所有相关的进展记录、里程碑、产品信息和角色成员。
          </Alert>
          <Typography variant="body1" gutterBottom>
            要删除项目：<strong>{projectName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请输入项目名称以确认删除：
          </Typography>
        </Box>
        <TextField
          fullWidth
          label="项目名称"
          value={inputName}
          onChange={handleInputChange}
          error={!!error}
          helperText={error || '请输入完整的项目名称'}
          placeholder={projectName}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading || inputName.trim() !== projectName}
        >
          {loading ? '删除中...' : '确认删除'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteProjectDialog
