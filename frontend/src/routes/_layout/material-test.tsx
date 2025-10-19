import { createFileRoute } from "@tanstack/react-router"
import { MUIThemeProvider } from "@/components/MUI/MUIThemeProvider"
import { Button, Card, CardContent, Typography, Box } from '@mui/material'

export const Route = createFileRoute("/_layout/material-test")({
  component: MaterialTestPage,
})

function MaterialTestPage() {
  return (
    <MUIThemeProvider>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Material UI 测试页面
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              这是一个简单的 Material UI 测试页面
            </Typography>
            <Button variant="contained" color="primary">
              测试按钮
            </Button>
          </CardContent>
        </Card>
      </Box>
    </MUIThemeProvider>
  )
}