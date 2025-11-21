#!/bin/bash

# PMinfo 数据库备份脚本
# 使用方法: ./scripts/backup-database.sh [备份文件名]

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

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

# 检查Docker Compose是否运行
if ! docker-compose ps db | grep -q "Up"; then
    echo "错误: 数据库服务未运行，请先启动: docker-compose up -d db"
    exit 1
fi

# 生成备份文件名
if [ -z "$1" ]; then
    BACKUP_FILE="pminfo_backup_$(date +%Y%m%d_%H%M%S).dump"
else
    BACKUP_FILE="$1"
fi

BACKUP_PATH="$PROJECT_ROOT/$BACKUP_FILE"

echo "=========================================="
echo "PMinfo 数据库备份工具"
echo "=========================================="
echo "数据库: $POSTGRES_DB"
echo "用户: $POSTGRES_USER"
echo "备份文件: $BACKUP_FILE"
echo "=========================================="
echo ""

# 执行备份
echo "正在备份数据库..."
docker-compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -f /tmp/pminfo_backup.dump

# 将备份文件复制到主机
echo "正在复制备份文件到主机..."
docker cp $(docker-compose ps -q db):/tmp/pminfo_backup.dump "$BACKUP_PATH"

# 清理容器内的临时文件
docker-compose exec -T db rm /tmp/pminfo_backup.dump

# 检查备份文件是否创建成功
if [ -f "$BACKUP_PATH" ]; then
    FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo ""
    echo "✓ 备份完成！"
    echo "  文件: $BACKUP_FILE"
    echo "  大小: $FILE_SIZE"
    echo "  位置: $BACKUP_PATH"
    echo ""
    echo "提示: 请将备份文件安全地传输到新电脑"
else
    echo "错误: 备份文件创建失败"
    exit 1
fi


