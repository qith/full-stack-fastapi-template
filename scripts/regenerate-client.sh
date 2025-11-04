#!/bin/bash

# 脚本：重新生成前端 API 客户端
# 用途：当后端 API 发生变化时，重新生成前端的 TypeScript 客户端代码

set -e

echo "🔄 重新生成前端 API 客户端..."

# 进入前端目录
cd "$(dirname "$0")/../frontend"

# 检查后端服务是否运行
if ! curl -s http://localhost:8000/api/v1/openapi.json > /dev/null; then
    echo "❌ 错误: 后端服务未运行，请先启动后端服务"
    echo "   运行命令: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
    exit 1
fi

echo "✅ 后端服务正在运行"

# 删除旧的 openapi.json
if [ -f "openapi.json" ]; then
    echo "🗑️  删除旧的 openapi.json"
    rm -f openapi.json
fi

# 从后端下载最新的 OpenAPI 规范
echo "📥 下载最新的 OpenAPI 规范..."
curl -s http://localhost:8000/api/v1/openapi.json -o openapi.json

# 检查下载是否成功
if [ ! -f "openapi.json" ]; then
    echo "❌ 错误: 下载 OpenAPI 规范失败"
    exit 1
fi

echo "✅ OpenAPI 规范下载成功"

# 生成客户端代码
echo "⚙️  生成客户端代码..."
npm run generate-client

# 触发 Vite HMR
echo "🔄 触发 Vite 热更新..."
touch src/main.tsx

echo "✅ 客户端代码生成完成！"
echo "📝 提示: 如果浏览器仍然显示错误，请刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）"
