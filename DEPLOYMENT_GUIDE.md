# PMinfo 系统部署指南

本指南帮助您在新电脑上部署PMinfo系统并同步数据。

## 前置要求

- Docker 和 Docker Compose 已安装
- Git 已安装
- 从源电脑获取的数据库备份文件

---

## 快速部署步骤

### 第一步：在新电脑上准备环境

```bash
# 1. 克隆代码（或通过其他方式获取代码）
git clone <your-repo-url>
cd full-stack-fastapi-template

# 2. 创建.env文件
cp .env.example .env

# 3. 编辑.env文件，配置数据库和其他环境变量
# 注意：数据库配置需要与源电脑保持一致，或者使用新的配置
nano .env  # 或使用其他编辑器
```

### 第二步：从源电脑获取数据备份

在源电脑上执行：

```bash
# 进入项目目录
cd /path/to/pminfo/full-stack-fastapi-template

# 执行备份
./scripts/backup-database.sh

# 备份文件会生成在项目根目录，文件名类似: pminfo_backup_20241109_143022.dump
```

然后将备份文件传输到新电脑（使用U盘、网络共享等方式）。

### 第三步：在新电脑上恢复数据

```bash
# 1. 将备份文件放到项目根目录

# 2. 启动数据库服务（不启动应用）
docker-compose up -d db

# 3. 等待数据库就绪（约10秒）
sleep 10

# 4. 恢复数据库
./scripts/restore-database.sh pminfo_backup_YYYYMMDD_HHMMSS.dump

# 5. 运行数据库迁移（确保表结构最新）
cd backend
docker-compose exec backend uv run alembic upgrade head
cd ..
```

### 第四步：启动完整服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 第五步：验证部署

1. 检查服务是否正常运行
2. 访问前端界面
3. 登录系统验证数据完整性
4. 测试主要功能

---

## 详细配置说明

### .env 文件配置

关键配置项：

```env
# 数据库配置
POSTGRES_USER=app
POSTGRES_PASSWORD=changethis
POSTGRES_DB=app
POSTGRES_PORT=5432

# 应用配置
SECRET_KEY=changethis  # 生产环境请使用强密钥
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# 前端配置
FRONTEND_HOST=http://localhost:5173
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:8000"]

# 环境
ENVIRONMENT=local
```

### 数据库配置注意事项

- **如果使用相同的数据库配置**：直接恢复备份即可
- **如果使用新的数据库配置**：需要确保新配置与备份时的配置兼容

---

## 常见问题排查

### 问题1：数据库连接失败

```bash
# 检查数据库服务状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 测试数据库连接
docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### 问题2：恢复时提示"关系已存在"

这是正常现象，脚本使用了 `-c` 参数会自动清理。如果仍有问题：

```bash
# 手动清理并恢复
docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./scripts/restore-database.sh backup.dump
```

### 问题3：迁移失败

```bash
# 查看迁移历史
cd backend
docker-compose exec backend uv run alembic current

# 查看迁移文件
docker-compose exec backend uv run alembic history

# 强制升级到最新
docker-compose exec backend uv run alembic upgrade head
```

### 问题4：前端无法连接后端

检查：
1. 后端服务是否运行：`docker-compose ps backend`
2. 后端日志：`docker-compose logs backend`
3. CORS配置是否正确
4. 网络连接是否正常

---

## 数据验证

恢复后验证数据完整性：

```bash
# 连接数据库
docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB

# 检查表
\dt

# 检查数据行数
SELECT 
    'user' as table_name, COUNT(*) as row_count FROM "user"
UNION ALL
SELECT 'project', COUNT(*) FROM project
UNION ALL
SELECT 'role', COUNT(*) FROM role
UNION ALL
SELECT 'permission', COUNT(*) FROM permission;
```

---

## 定期备份建议

建议定期备份数据库：

```bash
# 添加到crontab（每天凌晨2点备份）
0 2 * * * cd /path/to/pminfo/full-stack-fastapi-template && ./scripts/backup-database.sh >> /var/log/pminfo-backup.log 2>&1
```

---

## 安全建议

1. **备份文件加密**：如果包含敏感数据，建议加密备份
2. **传输安全**：使用安全方式传输备份文件
3. **权限控制**：确保备份文件权限适当
4. **定期清理**：删除旧的备份文件

---

## 获取帮助

如果遇到问题：
1. 查看日志：`docker-compose logs`
2. 检查服务状态：`docker-compose ps`
3. 参考详细文档：`scripts/data-sync-guide.md`


