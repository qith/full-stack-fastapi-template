import { Box, Button as MUIButton, Card, CardContent, Typography, Grid, Divider } from '@mui/material'
import { Container, Heading, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react'
import { FiUsers, FiSettings, FiShield } from 'react-icons/fi'

const HybridExample = () => {
  return (
    <Container maxW="full" p={4}>
      <VStack gap={6} align="stretch">
        {/* Chakra UI 部分 */}
        <Box>
          <Heading size="lg" mb={4} color="blue.500">
            Chakra UI 组件
          </Heading>
          <HStack gap={4} flexWrap="wrap">
            <Badge colorScheme="green" fontSize="sm">
              绿色标签
            </Badge>
            <Badge colorScheme="blue" fontSize="sm">
              蓝色标签
            </Badge>
            <Badge colorScheme="purple" fontSize="sm">
              紫色标签
            </Badge>
          </HStack>
          <Text mt={4} color="gray.600">
            这是使用 Chakra UI 组件创建的文本内容。Chakra UI 提供了简洁的 API 和良好的默认样式。
          </Text>
        </Box>

        <Divider />

        {/* Material UI 部分 */}
        <Box>
          <Typography variant="h4" component="h2" gutterBottom color="primary">
            Material UI 组件
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    卡片标题
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    这是 Material UI 的卡片组件，具有丰富的样式选项和动画效果。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    另一个卡片
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Material UI 提供了完整的组件库，包括表单、导航、数据展示等。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    第三个卡片
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    两个 UI 库可以很好地共存，各自发挥优势。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* 混合使用示例 */}
        <Box>
          <Heading size="lg" mb={4} color="purple.500">
            混合使用示例
          </Heading>
          <Text mb={4} color="gray.600">
            在同一个页面中，我们可以同时使用 Chakra UI 和 Material UI 组件：
          </Text>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chakra UI 按钮 + Material UI 卡片
                  </Typography>
                  <VStack gap={3} align="stretch">
                    <Button colorScheme="blue" size="sm">
                      Chakra 按钮
                    </Button>
                    <Button colorScheme="green" size="md">
                      另一个 Chakra 按钮
                    </Button>
                  </VStack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Material UI 按钮 + Chakra UI 布局
                  </Typography>
                  <VStack gap={3} align="stretch">
                    <MUIButton variant="contained" color="primary" size="small">
                      Material 按钮
                    </MUIButton>
                    <MUIButton variant="outlined" color="secondary" size="medium">
                      另一个 Material 按钮
                    </MUIButton>
                  </VStack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 功能对比 */}
        <Box>
          <Heading size="lg" mb={4} color="orange.500">
            功能对比
          </Heading>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Chakra UI 优势
                  </Typography>
                  <VStack gap={2} align="stretch">
                    <HStack>
                      <FiUsers />
                      <Text>简洁的 API 设计</Text>
                    </HStack>
                    <HStack>
                      <FiSettings />
                      <Text>内置主题系统</Text>
                    </HStack>
                    <HStack>
                      <FiShield />
                      <Text>TypeScript 支持</Text>
                    </HStack>
                  </VStack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary">
                    Material UI 优势
                  </Typography>
                  <VStack gap={2} align="stretch">
                    <HStack>
                      <FiUsers />
                      <Text>丰富的组件库</Text>
                    </HStack>
                    <HStack>
                      <FiSettings />
                      <Text>强大的主题定制</Text>
                    </HStack>
                    <HStack>
                      <FiShield />
                      <Text>企业级应用支持</Text>
                    </HStack>
                  </VStack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </VStack>
    </Container>
  )
}

export default HybridExample
