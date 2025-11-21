#!/bin/bash

# PMinfo 系统 Docker 部署脚本（IP+端口访问）
# 使用方法: ./scripts/deploy-ip-port.sh

set -e

echo "=========================================="
echo "PMinfo 系统 Docker 部署脚本（IP+端口访问）"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    echo "请先安装 Docker，参考部署指南中的安装步骤"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 未找到 docker-compose.yml 文件${NC}"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否存在 docker-compose.ip.yml
if [ ! -f "docker-compose.ip.yml" ]; then
    echo -e "${RED}错误: 未找到 docker-compose.ip.yml 文件${NC}"
    exit 1
fi

# 获取服务器IP
echo -e "${YELLOW}正在检测服务器IP地址...${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(ip addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
fi

echo -e "${GREEN}检测到服务器IP: ${SERVER_IP}${NC}"
read -p "是否使用此IP? (y/n, 默认y): " use_detected_ip
use_detected_ip=${use_detected_ip:-y}

if [ "$use_detected_ip" != "y" ] && [ "$use_detected_ip" != "Y" ]; then
    read -p "请输入服务器IP地址: " SERVER_IP
fi

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env 文件不存在，正在创建...${NC}"
    
    # 生成密钥
    echo "正在生成安全密钥..."
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)
    DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)
    
    # 创建.env文件
    cat > .env << EOF
# 环境配置
ENVIRONMENT=production
DOMAIN=localhost
STACK_NAME=pminfo

# 项目配置
PROJECT_NAME=PMinfo
DOCKER_IMAGE_BACKEND=pminfo-backend
DOCKER_IMAGE_FRONTEND=pminfo-frontend
TAG=latest

# 服务器IP
PUBLIC_HOST=${SERVER_IP}

# 前端配置
FRONTEND_HOST=http://${SERVER_IP}:8880
BACKEND_CORS_ORIGINS=["http://${SERVER_IP}:8880"]

# 安全密钥
SECRET_KEY=${SECRET_KEY}

# 超级用户配置（第一个管理员账户）
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# 数据库配置
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=app
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=app

# 邮件配置（可选）
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
SMTP_PORT=587
SMTP_TLS=true
EMAILS_FROM_EMAIL=noreply@example.com

# Sentry配置（可选）
SENTRY_DSN=
EOF
    
    echo -e "${GREEN}.env 文件已创建${NC}"
    echo -e "${YELLOW}重要: 请编辑 .env 文件，修改以下内容：${NC}"
    echo "  - FIRST_SUPERUSER: 管理员邮箱"
    echo "  - FIRST_SUPERUSER_PASSWORD: 管理员密码"
    echo ""
    read -p "按 Enter 继续，或 Ctrl+C 取消以先编辑 .env 文件..."
else
    echo -e "${GREEN}找到 .env 文件${NC}"
    
    # 更新PUBLIC_HOST和FRONTEND_HOST
    if grep -q "PUBLIC_HOST=" .env; then
        sed -i "s|PUBLIC_HOST=.*|PUBLIC_HOST=${SERVER_IP}|" .env
    else
        echo "PUBLIC_HOST=${SERVER_IP}" >> .env
    fi
    
    if grep -q "FRONTEND_HOST=" .env; then
        sed -i "s|FRONTEND_HOST=.*|FRONTEND_HOST=http://${SERVER_IP}:8880|" .env
    else
        echo "FRONTEND_HOST=http://${SERVER_IP}:8880" >> .env
    fi
    
    if grep -q "BACKEND_CORS_ORIGINS=" .env; then
        sed -i "s|BACKEND_CORS_ORIGINS=.*|BACKEND_CORS_ORIGINS=[\"http://${SERVER_IP}:8880\"]|" .env
    else
        echo "BACKEND_CORS_ORIGINS=[\"http://${SERVER_IP}:8880\"]" >> .env
    fi
    
    echo -e "${GREEN}已更新 .env 文件中的IP配置${NC}"
fi

# 检查端口是否被占用
echo ""
echo -e "${YELLOW}检查端口占用情况...${NC}"
check_port() {
    if command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$1 " && return 0 || return 1
    elif command -v ss &> /dev/null; then
        ss -tuln | grep -q ":$1 " && return 0 || return 1
    else
        return 1
    fi
}

if check_port 8880; then
    echo -e "${RED}警告: 端口 8880 已被占用${NC}"
fi
if check_port 8881; then
    echo -e "${RED}警告: 端口 8881 已被占用${NC}"
fi
if check_port 8882; then
    echo -e "${RED}警告: 端口 8882 已被占用${NC}"
fi

# 构建镜像
echo ""
echo -e "${YELLOW}开始构建Docker镜像...${NC}"
docker compose -f docker-compose.yml -f docker-compose.ip.yml build

# 启动服务
echo ""
echo -e "${YELLOW}启动服务...${NC}"
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d

# 等待服务启动
echo ""
echo -e "${YELLOW}等待服务启动（这可能需要几分钟）...${NC}"
sleep 5

# 检查服务状态
echo ""
echo -e "${YELLOW}检查服务状态...${NC}"
docker compose -f docker-compose.yml -f docker-compose.ip.yml ps

# 显示访问信息
echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址："
echo -e "  前端界面: ${GREEN}http://${SERVER_IP}:8880${NC}"
echo -e "  API文档:  ${GREEN}http://${SERVER_IP}:8881/docs${NC}"
echo -e "  API地址:  ${GREEN}http://${SERVER_IP}:8881${NC}"
echo -e "  数据库管理: ${GREEN}http://${SERVER_IP}:8882${NC}"
echo ""
echo "登录信息："
echo "  请查看 .env 文件中的 FIRST_SUPERUSER 和 FIRST_SUPERUSER_PASSWORD"
echo ""
echo "常用命令："
echo "  查看日志: docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f"
echo "  查看状态: docker compose -f docker-compose.yml -f docker-compose.ip.yml ps"
echo "  停止服务: docker compose -f docker-compose.yml -f docker-compose.ip.yml down"
echo ""
echo -e "${YELLOW}提示: 如果无法访问，请检查防火墙设置${NC}"
echo "  Ubuntu/Debian: sudo ufw allow 8880/tcp && sudo ufw allow 8881/tcp && sudo ufw allow 8882/tcp"
echo "  CentOS/RHEL: sudo firewall-cmd --permanent --add-port=8880/tcp --add-port=8881/tcp --add-port=8882/tcp && sudo firewall-cmd --reload"
echo ""

