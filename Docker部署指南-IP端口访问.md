# PMinfo 系统 Docker 部署指南（IP+端口访问）

本指南将帮助您使用 Docker 快速部署 PMinfo 系统，通过 IP+端口直接访问，无需配置域名和反向代理。

## 📋 目录

1. [前置要求](#前置要求)
2. [快速部署](#快速部署)
3. [详细步骤](#详细步骤)
4. [访问应用](#访问应用)
5. [常用命令](#常用命令)
6. [常见问题](#常见问题)

---

## 前置要求

- 已安装 Docker 和 Docker Compose
- 服务器开放以下端口：
  - `8880` - 前端访问
  - `8881` - 后端API
  - `8882` - 数据库管理工具（可选）
  - `5432` - PostgreSQL数据库（仅内部使用）

---

## 快速部署

### 一键部署命令

```bash
# 1. 克隆或上传项目到服务器
cd /root/code
git clone your-repository-url pminfo
cd pminfo

# 2. 创建 .env 文件（见下方配置说明）
cat > .env << 'EOF'
# 环境配置
ENVIRONMENT=production
DOMAIN=localhost
STACK_NAME=pminfo

# 项目配置
PROJECT_NAME=PMinfo
DOCKER_IMAGE_BACKEND=pminfo-backend
DOCKER_IMAGE_FRONTEND=pminfo-frontend
TAG=latest

# 服务器IP（替换为您的实际IP）
PUBLIC_HOST=192.168.1.100

# 前端配置
FRONTEND_HOST=http://192.168.1.100:8880
BACKEND_CORS_ORIGINS=["http://192.168.1.100:8880"]

# 安全密钥（必须修改！）
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# 超级用户配置（第一个管理员账户）
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# 数据库配置
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=app
POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
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

# 3. 生成密钥并更新 .env 文件
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env

# 4. 修改 PUBLIC_HOST 为您的服务器IP
# 编辑 .env 文件，将 192.168.1.100 替换为您的实际IP
nano .env

# 5. 构建并启动服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml build
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d

# 6. 查看服务状态
docker compose -f docker-compose.yml -f docker-compose.ip.yml ps

# 7. 查看日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f
```

---

## 详细步骤

### 1. 安装 Docker（如果未安装）

#### Ubuntu/Debian

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
sudo docker --version
sudo docker compose version
```

#### CentOS/RHEL

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加Docker仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
sudo docker compose version
```

### 2. 准备项目文件

```bash
# 方法1: 使用Git克隆（推荐）
cd /root/code
git clone your-repository-url pminfo
cd pminfo

# 方法2: 使用scp上传项目
# 在本地执行：
# scp -r /path/to/full-stack-fastapi-template root@your-server-ip:/root/code/pminfo
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cd /root/code/pminfo
nano .env
```

在 `.env` 文件中配置以下内容（**重要：请修改所有默认值**）：

```env
# 环境配置
ENVIRONMENT=production
DOMAIN=localhost
STACK_NAME=pminfo

# 项目配置
PROJECT_NAME=PMinfo
DOCKER_IMAGE_BACKEND=pminfo-backend
DOCKER_IMAGE_FRONTEND=pminfo-frontend
TAG=latest

# 服务器IP（替换为您的实际服务器IP地址）
PUBLIC_HOST=192.168.1.100

# 前端配置
FRONTEND_HOST=http://192.168.1.100:8880
BACKEND_CORS_ORIGINS=["http://192.168.1.100:8880"]

# 安全密钥（必须修改！）
# 生成密钥命令: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-here

# 超级用户配置（第一个管理员账户）
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=your-secure-password-here

# 数据库配置
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=app
POSTGRES_PASSWORD=your-database-password-here
POSTGRES_DB=app

# 邮件配置（可选，用于密码重置等功能）
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
SMTP_PORT=587
SMTP_TLS=true
EMAILS_FROM_EMAIL=noreply@example.com

# Sentry配置（可选，用于错误监控）
SENTRY_DSN=
```

**重要提示**：

1. **修改 `PUBLIC_HOST`**：将 `192.168.1.100` 替换为您的实际服务器IP地址
   ```bash
   # 查看服务器IP
   ip addr show
   # 或
   hostname -I
   ```

2. **生成安全密钥**：
   ```bash
   # 生成SECRET_KEY
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # 生成数据库密码
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **修改管理员账户**：修改 `FIRST_SUPERUSER` 和 `FIRST_SUPERUSER_PASSWORD`

### 4. 构建和启动服务

```bash
cd /root/code/pminfo

# 构建Docker镜像
docker compose -f docker-compose.yml -f docker-compose.ip.yml build

# 启动所有服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d

# 查看服务状态
docker compose -f docker-compose.yml -f docker-compose.ip.yml ps
```

### 5. 等待服务启动

首次启动可能需要几分钟时间，因为需要：
- 下载Docker镜像
- 构建应用镜像
- 初始化数据库
- 运行数据库迁移

可以使用以下命令监控启动过程：

```bash
# 查看所有服务日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f

# 查看特定服务日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f frontend
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f db
```

---

## 访问应用

部署成功后，通过以下地址访问（将 `YOUR_SERVER_IP` 替换为您的实际IP）：

- **前端界面**: `http://YOUR_SERVER_IP:8880`
- **API文档**: `http://YOUR_SERVER_IP:8881/docs`
- **API基础URL**: `http://YOUR_SERVER_IP:8881`
- **数据库管理**: `http://YOUR_SERVER_IP:8882`（可选）

### 测试登录

使用 `.env` 文件中配置的 `FIRST_SUPERUSER` 和 `FIRST_SUPERUSER_PASSWORD` 登录系统。

---

## 常用命令

### 查看服务状态

```bash
docker compose -f docker-compose.yml -f docker-compose.ip.yml ps
```

### 查看日志

```bash
# 查看所有服务日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f

# 查看特定服务日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f frontend
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs -f db
```

### 重启服务

```bash
# 重启所有服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml restart

# 重启特定服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml restart backend
docker compose -f docker-compose.yml -f docker-compose.ip.yml restart frontend
```

### 停止服务

```bash
# 停止所有服务（保留数据）
docker compose -f docker-compose.yml -f docker-compose.ip.yml down

# 停止并删除所有数据（谨慎使用！）
docker compose -f docker-compose.yml -f docker-compose.ip.yml down -v
```

### 更新应用

```bash
cd /root/code/pminfo

# 拉取最新代码
git pull

# 重新构建并启动
docker compose -f docker-compose.yml -f docker-compose.ip.yml build
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d

# 运行数据库迁移（如果需要）
docker compose -f docker-compose.yml -f docker-compose.ip.yml exec backend uv run alembic upgrade head
```

### 进入容器

```bash
# 进入后端容器
docker compose -f docker-compose.yml -f docker-compose.ip.yml exec backend bash

# 进入数据库容器
docker compose -f docker-compose.yml -f docker-compose.ip.yml exec db psql -U app -d app
```

---

## 常见问题

### 问题1: 端口被占用

**错误信息**：`Bind for 0.0.0.0:8880 failed: port is already allocated`

**解决方案**：

```bash
# 检查端口占用
netstat -tulpn | grep -E ':(8880|8881|8882)'

# 或者修改 docker-compose.ip.yml 中的端口映射
# 例如将 8880:80 改为 9000:80
```

### 问题2: 前端无法连接后端

**检查步骤**：

```bash
# 检查后端服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs backend

# 检查CORS配置
# 确保 .env 中的 BACKEND_CORS_ORIGINS 包含前端URL
```

**解决方案**：

确保 `.env` 文件中的配置正确：
```env
PUBLIC_HOST=YOUR_SERVER_IP
FRONTEND_HOST=http://YOUR_SERVER_IP:8880
BACKEND_CORS_ORIGINS=["http://YOUR_SERVER_IP:8880"]
```

### 问题3: 数据库连接失败

**检查步骤**：

```bash
# 检查数据库服务
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs db

# 测试数据库连接
docker compose -f docker-compose.yml -f docker-compose.ip.yml exec db psql -U app -d app
```

**解决方案**：
- 确保 `.env` 中的数据库密码正确
- 等待数据库完全启动（首次启动可能需要30秒）

### 问题4: 防火墙阻止访问

**解决方案**：

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 8880/tcp
sudo ufw allow 8881/tcp
sudo ufw allow 8882/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8880/tcp
sudo firewall-cmd --permanent --add-port=8881/tcp
sudo firewall-cmd --permanent --add-port=8882/tcp
sudo firewall-cmd --reload
```

### 问题5: 服务无法启动

**检查步骤**：

```bash
# 查看所有服务状态
docker compose -f docker-compose.yml -f docker-compose.ip.yml ps

# 查看错误日志
docker compose -f docker-compose.yml -f docker-compose.ip.yml logs

# 检查环境变量
cat .env
```

**常见原因**：
- 环境变量未正确设置
- Docker网络问题
- 镜像构建失败

### 问题6: 修改端口映射

如果需要修改端口，编辑 `docker-compose.ip.yml` 文件：

```yaml
services:
  backend:
    ports:
      - "新端口:8000"  # 例如 "9001:8000"
  
  frontend:
    ports:
      - "新端口:80"    # 例如 "9000:80"
  
  adminer:
    ports:
      - "新端口:8080"  # 例如 "9002:8080"
```

然后更新 `.env` 文件中的 `FRONTEND_HOST` 和 `BACKEND_CORS_ORIGINS`，并重新构建启动。

---

## 端口说明

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| 前端 | 80 | 8880 | Web界面访问 |
| 后端API | 8000 | 8881 | API接口访问 |
| Adminer | 8080 | 8882 | 数据库管理工具（可选） |
| PostgreSQL | 5432 | - | 仅内部使用，不对外暴露 |

---

## 安全建议

1. **修改默认密码**: 确保所有默认密码都已更改
2. **使用强密钥**: 使用 `secrets.token_urlsafe(32)` 生成强密钥
3. **防火墙配置**: 只开放必要的端口
4. **定期更新**: 定期更新系统和Docker镜像
5. **备份数据**: 定期备份数据库

---

## 数据库备份

### 手动备份

```bash
cd /root/code/pminfo
docker compose -f docker-compose.yml -f docker-compose.ip.yml exec db pg_dump -U app app > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 自动备份（使用crontab）

```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * cd /root/code/pminfo && docker compose -f docker-compose.yml -f docker-compose.ip.yml exec -T db pg_dump -U app app > /root/backups/pminfo_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

---

## 获取帮助

如果遇到问题：

1. 查看日志：`docker compose -f docker-compose.yml -f docker-compose.ip.yml logs`
2. 检查服务状态：`docker compose -f docker-compose.yml -f docker-compose.ip.yml ps`
3. 检查环境变量：`cat .env`
4. 参考项目文档

---

祝您部署顺利！🎉

