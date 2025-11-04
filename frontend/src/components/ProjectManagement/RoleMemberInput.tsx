import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  GridLegacy as Grid,
  Paper,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'

// 角色选项
const ROLE_OPTIONS = [
  { value: '市场', label: '市场' },
  { value: '区解', label: '区解' },
  { value: '行解', label: '行解' },
  { value: '交付', label: '交付' },
  { value: '采购', label: '采购' },
  { value: '华为', label: '华为' },
  { value: '客户', label: '客户' },
]

interface RoleMember {
  id: string
  role: string
  name: string
  email: string
  phone: string
  description: string
}

interface RoleMemberInputProps {
  roleMembers: RoleMember[]
  onChange: (roleMembers: RoleMember[]) => void
}

const RoleMemberInput: React.FC<RoleMemberInputProps> = ({ roleMembers, onChange }) => {
  const [newMember, setNewMember] = useState<Partial<RoleMember>>({
    role: '',
    name: '',
    email: '',
    phone: '',
    description: '',
  })

  const handleAddMember = () => {
    if (!newMember.role) {
      alert('请选择角色')
      return
    }
    if (!newMember.name || newMember.name.trim() === '') {
      alert('请填写姓名')
      return
    }
    
    const member: RoleMember = {
      id: Date.now().toString(),
      role: newMember.role,
      name: newMember.name.trim(),
      email: newMember.email?.trim() || '',
      phone: newMember.phone?.trim() || '',
      description: newMember.description?.trim() || '',
    }
    onChange([...roleMembers, member])
    setNewMember({
      role: '',
      name: '',
      email: '',
      phone: '',
      description: '',
    })
  }

  const handleRemoveMember = (id: string) => {
    onChange(roleMembers.filter(member => member.id !== id))
  }


  // 按角色分组显示成员
  const groupedMembers = roleMembers.reduce((acc, member) => {
    if (member && member.role && member.role.trim() !== '') {
      if (!acc[member.role]) {
        acc[member.role] = []
      }
      acc[member.role].push(member)
    }
    return acc
  }, {} as Record<string, RoleMember[]>)

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 500 }}>
        项目角色成员
      </Typography>
      
      {/* 添加新成员表单 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" gutterBottom>
          添加角色成员
        </Typography>
        <Grid container spacing={1} alignItems="flex-start" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Grid item xs={6} sm={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>角色</InputLabel>
              <Select
                value={newMember.role}
                label="角色"
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                sx={{ minWidth: 100 }}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={1.5}>
            <TextField
              fullWidth
              size="small"
              label="姓名"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              error={!newMember.name && newMember.role ? true : false}
              helperText={!newMember.name && newMember.role ? '请填写此字段' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <TextField
              fullWidth
              size="small"
              label="邮箱"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} sm={1.5}>
            <TextField
              fullWidth
              size="small"
              label="电话"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="备注"
              value={newMember.description}
              onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
              placeholder="角色备注信息"
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMember}
              disabled={!newMember.role || !newMember.name}
              startIcon={<AddIcon />}
              size="small"
              sx={{ 
                height: '40px', 
                minWidth: '80px',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              添加
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 显示已添加的成员 */}
      {Object.keys(groupedMembers).length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            已添加的成员
          </Typography>
          {Object.entries(groupedMembers).map(([role, members]) => (
            <Box key={role} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={`${role} (${members.length}人)`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
              </Box>
              <Box sx={{ pl: 2 }}>
                {members.map((member) => (
                  <Paper 
                    key={member.id} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {member.email}
                        {member.phone && ` • ${member.phone}`}
                      </Typography>
                      {member.description && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                          {member.description}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {Object.keys(groupedMembers).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            暂无角色成员，请添加项目相关人员
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default RoleMemberInput
