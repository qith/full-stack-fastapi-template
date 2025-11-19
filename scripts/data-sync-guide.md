# 数据同步方案指南

本文档提供了在不同电脑间同步PMinfo系统数据的几种方案，所有方案都不经过GitHub。

## 方案概览

1. **方案一：PostgreSQL数据库导出/导入（推荐）** - 最灵活，适合定期同步
2. **方案二：Docker卷备份** - 完整备份，适合一次性迁移
3. **方案三：仅迁移数据表（SQL导出）** - 轻量级，适合小数据量

---

## 方案一：PostgreSQL数据库导出/导入（推荐）

### 优点
- 跨平台兼容性好
- 可以选择性导出特定表
- 文件体积相对较小
- 支持增量同步

### 在源电脑（旧电脑）上操作

#### 1. 导出数据库

```bash
# 进入项目目录
cd /path/to/pminfo/full-stack-fastapi-template

# 方法1：使用Docker执行pg_dump（推荐）
docker-compose exec db pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F c -f /tmp/pminfo_backup.dump

# 将备份文件复制到当前目录
docker-compose exec db cat /tmp/pminfo_backup.dump > pminfo_backup_$(date +%Y%m%d_%H%M%S).dump

# 或者使用docker cp
docker cp $(docker-compose ps -q db):/tmp/pminfo_backup.dump ./pminfo_backup_$(date +%Y%m%d_%H%M%S).dump
```

#### 2. 使用提供的脚本（更简单）

```bash
# 使用提供的备份脚本
./scripts/backup-database.sh
```

### 在新电脑上操作

#### 1. 拉取代码并配置环境

```bash
# 拉取代码（不包含.env文件）
git clone <your-repo-url>
cd full-stack-fastapi-template

# 创建.env文件（从源电脑复制或手动配置）
cp .env.example .env
# 编辑.env文件，配置数据库连接信息
```

#### 2. 启动数据库（不启动应用）

```bash
# 只启动数据库服务
docker-compose up -d db

# 等待数据库就绪
sleep 10
```

#### 3. 导入数据库

```bash
# 将备份文件传输到新电脑（使用U盘、网络共享等方式）

# 方法1：使用Docker执行pg_restore
docker cp pminfo_backup_YYYYMMDD_HHMMSS.dump $(docker-compose ps -q db):/tmp/pminfo_backup.dump
docker-compose exec db pg_restore -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c -v /tmp/pminfo_backup.dump

# 或者使用提供的恢复脚本
./scripts/restore-database.sh pminfo_backup_YYYYMMDD_HHMMSS.dump
```

#### 4. 运行数据库迁移（确保表结构最新）

```bash
# 进入backend目录
cd backend

# 运行迁移
docker-compose exec backend uv run alembic upgrade head
```

#### 5. 启动完整服务

```bash
# 返回项目根目录
cd ..

# 启动所有服务
docker-compose up -d
```

---

## 方案二：Docker卷备份

### 优点
- 完整备份，包含所有数据库文件
- 操作简单

### 缺点
- 文件体积较大
- 跨平台可能有问题

### 在源电脑上操作

```bash
# 停止数据库服务
docker-compose stop db

# 备份Docker卷
docker run --rm -v pminfo_app-db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-volume-backup-$(date +%Y%m%d_%H%M%S).tar.gz /data

# 启动数据库服务
docker-compose start db
```

### 在新电脑上操作

```bash
# 1. 拉取代码并配置环境
git clone <your-repo-url>
cd full-stack-fastapi-template

# 2. 创建.env文件
cp .env.example .env

# 3. 启动数据库（创建卷）
docker-compose up -d db
docker-compose stop db

# 4. 恢复卷数据
docker run --rm -v pminfo_app-db-data:/data -v $(pwd):/backup alpine tar xzf /backup/db-volume-backup-YYYYMMDD_HHMMSS.tar.gz -C /

# 5. 启动服务
docker-compose up -d
```

---

## 方案三：仅迁移数据表（SQL导出）

### 适用场景
- 数据量较小
- 只需要迁移部分表
- 需要可读的SQL格式

### 在源电脑上操作

```bash
# 导出为SQL格式（可读）
docker-compose exec db pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F p > pminfo_data_$(date +%Y%m%d_%H%M%S).sql

# 或者只导出数据（不包含表结构）
docker-compose exec db pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F p --data-only > pminfo_data_only_$(date +%Y%m%d_%H%M%S).sql

# 或者只导出特定表
docker-compose exec db pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F p -t user -t project -t role > pminfo_selected_tables_$(date +%Y%m%d_%H%M%S).sql
```

### 在新电脑上操作

```bash
# 1. 启动数据库
docker-compose up -d db
sleep 10

# 2. 运行迁移（创建表结构）
cd backend
docker-compose exec backend uv run alembic upgrade head
cd ..

# 3. 导入数据
docker-compose exec -T db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < pminfo_data_YYYYMMDD_HHMMSS.sql
```

---

## 数据同步检查清单

### 源电脑（导出前）
- [ ] 确认所有服务正常运行
- [ ] 确认数据是最新的
- [ ] 停止可能的数据写入操作（可选，避免数据不一致）
- [ ] 执行备份

### 新电脑（导入后）
- [ ] 确认.env文件配置正确
- [ ] 确认数据库服务启动成功
- [ ] 确认数据导入成功
- [ ] 运行数据库迁移
- [ ] 测试应用功能
- [ ] 验证数据完整性

---

## 安全建议

1. **备份文件加密**：如果备份文件包含敏感信息，建议加密
   ```bash
   # 使用gpg加密
   gpg -c pminfo_backup.dump
   ```

2. **传输安全**：使用安全的方式传输备份文件
   - USB设备
   - 加密的网络传输（SCP、SFTP）
   - 私有云存储

3. **备份文件清理**：导入成功后，及时删除备份文件

---

## 常见问题

### Q: 导入时提示"关系已存在"错误
A: 使用 `-c` 参数先清理现有数据：
```bash
pg_restore -c -U ${POSTGRES_USER} -d ${POSTGRES_DB} backup.dump
```

### Q: 如何验证数据完整性？
A: 在新电脑上检查：
```bash
# 连接数据库
docker-compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# 检查表数量
\dt

# 检查数据行数
SELECT 'user' as table_name, COUNT(*) FROM "user"
UNION ALL
SELECT 'project', COUNT(*) FROM project
UNION ALL
SELECT 'role', COUNT(*) FROM role;
```

### Q: 如何只同步特定表？
A: 使用pg_dump的-t参数：
```bash
docker-compose exec db pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F c -t user -t project -f /tmp/selected_tables.dump
```

---

## 自动化脚本

项目提供了自动化脚本，详见：
- `scripts/backup-database.sh` - 数据库备份脚本
- `scripts/restore-database.sh` - 数据库恢复脚本


