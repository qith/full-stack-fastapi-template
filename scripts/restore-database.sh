#!/bin/bash

# PMinfo 数据库恢复脚本
# 使用方法: ./scripts/restore-database.sh <备份文件路径>

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 检查参数
if [ -z "$1" ]; then
    echo "错误: 请指定备份文件路径"
    echo "使用方法: ./scripts/restore-database.sh <备份文件路径>"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "错误: .env 文件不存在，请先创建.env文件"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

# 检查必要的环境变量
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_DB" ]; then
    echo "错误: .env 文件中缺少 POSTGRES_USER 或 POSTGRES_DB 配置"
    exit 1
fi

echo "=========================================="
echo "PMinfo 数据库恢复工具"
echo "=========================================="
echo "数据库: $POSTGRES_DB"
echo "用户: $POSTGRES_USER"
echo "备份文件: $BACKUP_FILE"
echo "=========================================="
echo ""

# 警告提示
echo "⚠️  警告: 此操作将覆盖现有数据库数据！"
read -p "是否继续？(yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

# 检查Docker Compose是否运行
if ! docker-compose ps db | grep -q "Up"; then
    echo "数据库服务未运行，正在启动..."
    docker-compose up -d db
    echo "等待数据库就绪..."
    sleep 10
fi

# 检查数据库是否就绪
echo "检查数据库连接..."
if ! docker-compose exec -T db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "错误: 无法连接到数据库，请检查数据库服务状态"
    exit 1
fi

# 将备份文件复制到容器
BACKUP_FILENAME=$(basename "$BACKUP_FILE")
echo "正在复制备份文件到容器..."
docker cp "$BACKUP_FILE" $(docker-compose ps -q db):/tmp/pminfo_backup.dump

# 执行恢复
echo "正在恢复数据库..."
echo "注意: 如果看到 '关系已存在' 的警告，这是正常的（-c 参数会先清理）"
docker-compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c -v /tmp/pminfo_backup.dump || {
    echo ""
    echo "警告: 恢复过程中可能有错误，但部分数据可能已恢复"
    echo "如果遇到 '关系已存在' 错误，这是正常的"
}

# 清理容器内的临时文件
docker-compose exec -T db rm /tmp/pminfo_backup.dump

echo ""
echo "✓ 数据库恢复完成！"
echo ""
echo "下一步:"
echo "1. 运行数据库迁移确保表结构最新:"
echo "   cd backend && docker-compose exec backend uv run alembic upgrade head"
echo ""
echo "2. 验证数据完整性:"
echo "   docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -c '\\dt'"
echo ""


