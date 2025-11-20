#!/bin/bash

# PMinfo 服务器部署脚本
# 使用方法: ./scripts/deploy-server.sh

set -e

echo "=========================================="
echo "PMinfo 系统服务器部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 已安装${NC}"

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}警告: .env 文件不存在${NC}"
    echo "请先创建 .env 文件并配置必要的环境变量"
    echo "参考: 服务器部署指南.md"
    exit 1
fi

echo -e "${GREEN}✓ .env 文件存在${NC}"

# 加载环境变量
set -a
source .env
set +a

# 检查必要的环境变量
REQUIRED_VARS=("DOMAIN" "STACK_NAME" "SECRET_KEY" "POSTGRES_PASSWORD" "FIRST_SUPERUSER" "FIRST_SUPERUSER_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}错误: 以下环境变量未设置:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "请在 .env 文件中设置这些变量"
    exit 1
fi

echo -e "${GREEN}✓ 必要的环境变量已设置${NC}"

# 检查Traefik网络
if ! docker network ls | grep -q "traefik-public"; then
    echo -e "${YELLOW}警告: traefik-public 网络不存在${NC}"
    echo "正在创建 traefik-public 网络..."
    docker network create traefik-public
    echo -e "${GREEN}✓ traefik-public 网络已创建${NC}"
else
    echo -e "${GREEN}✓ traefik-public 网络已存在${NC}"
fi

# 询问是否构建镜像
echo ""
read -p "是否重新构建Docker镜像? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在构建Docker镜像..."
    docker compose -f docker-compose.yml build
    echo -e "${GREEN}✓ 镜像构建完成${NC}"
fi

# 启动服务
echo ""
echo "正在启动服务..."
docker compose -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}✓ 服务启动完成${NC}"

# 等待服务就绪
echo ""
echo "等待服务就绪..."
sleep 10

# 检查服务状态
echo ""
echo "服务状态:"
docker compose ps

echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: https://dashboard.${DOMAIN}"
echo "  API文档: https://api.${DOMAIN}/docs"
echo "  数据库管理: https://adminer.${DOMAIN}"
echo ""
echo "查看日志: docker compose logs -f"
echo "查看状态: docker compose ps"
echo "停止服务: docker compose down"
echo ""

