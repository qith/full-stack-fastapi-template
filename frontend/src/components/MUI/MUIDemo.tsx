import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

const MUIDemo = () => {
  const [switchChecked, setSwitchChecked] = useState(false)
  const [progress, setProgress] = useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0
        }
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom color="primary">
        Material UI 组件演示
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        这是一个 Material UI 组件库的演示页面，展示了各种常用组件的使用方式。
        所有组件都使用了独立的作用域，不会与现有的 Chakra UI 样式产生冲突。
      </Typography>

      <Grid container spacing={3}>
        {/* 按钮组件 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                按钮组件
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button variant="contained" color="primary">
                  主要按钮
                </Button>
                <Button variant="outlined" color="secondary">
                  次要按钮
                </Button>
                <Button variant="text" color="primary">
                  文本按钮
                </Button>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}>
                  带图标
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 表单组件 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                表单组件
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="用户名"
                  variant="outlined"
                  fullWidth
                  placeholder="请输入用户名"
                />
                <TextField
                  label="密码"
                  type="password"
                  variant="outlined"
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={switchChecked}
                      onChange={(e) => setSwitchChecked(e.target.checked)}
                    />
                  }
                  label="记住我"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 数据展示组件 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                数据展示
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label="标签1" color="primary" />
                <Chip label="标签2" color="secondary" />
                <Chip label="可删除" onDelete={() => {}} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>B</Avatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>C</Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 进度指示器 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                进度指示器
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  线性进度条
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 操作按钮 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                操作按钮
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="添加">
                  <IconButton color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="编辑">
                  <IconButton color="secondary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="搜索">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="通知">
                  <IconButton>
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="设置">
                  <IconButton>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 提示信息 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                提示信息
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="success">
                  <AlertTitle>成功</AlertTitle>
                  操作已成功完成！
                </Alert>
                <Alert severity="info">
                  <AlertTitle>信息</AlertTitle>
                  这是一条信息提示。
                </Alert>
                <Alert severity="warning">
                  <AlertTitle>警告</AlertTitle>
                  请注意这个警告信息。
                </Alert>
                <Alert severity="error">
                  <AlertTitle>错误</AlertTitle>
                  发生了一个错误。
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 复杂卡片示例 */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                复杂卡片示例
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      1,234
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总用户数
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary">
                      567
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      活跃用户
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      89%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      完成率
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      待处理
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  这是一个包含多种组件的复杂卡片示例
                </Typography>
                <Button variant="contained" color="primary">
                  了解更多
                </Button>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small">取消</Button>
              <Button size="small" variant="contained">
                确认
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MUIDemo
