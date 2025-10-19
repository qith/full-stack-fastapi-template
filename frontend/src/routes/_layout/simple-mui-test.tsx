import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/simple-mui-test")({
  component: SimpleMUITestPage,
})

function SimpleMUITestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Material UI 简单测试</h1>
      <p>如果你能看到这个页面，说明路由正常工作。</p>
      <div style={{ 
        padding: '16px', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        <h3>测试 Material UI 组件</h3>
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          模拟 Material UI 按钮
        </button>
      </div>
    </div>
  )
}