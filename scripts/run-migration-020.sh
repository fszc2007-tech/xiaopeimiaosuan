#!/bin/bash

# 执行数据库迁移 020: 插入福星贵人的解读内容
# 
# 使用方法：
# chmod +x scripts/run-migration-020.sh
# ./scripts/run-migration-020.sh

set -e

echo "=========================================="
echo "执行数据库迁移: 020_insert_fuxing_guiren_readings.sql"
echo "=========================================="
echo ""

# 检查迁移文件是否存在
MIGRATION_FILE="core/src/database/migrations/020_insert_fuxing_guiren_readings.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ 错误: 迁移文件不存在: $MIGRATION_FILE"
  exit 1
fi

echo "📄 迁移文件: $MIGRATION_FILE"
echo ""

# 读取数据库配置（从环境变量或 .env 文件）
if [ -f "core/.env" ]; then
  # 从 .env 文件读取配置（使用 source 方式）
  set -a
  source core/.env
  set +a
fi

DB_HOST="${XIAOPEI_MYSQL_HOST:-localhost}"
DB_PORT="${XIAOPEI_MYSQL_PORT:-3306}"
DB_USER="${XIAOPEI_MYSQL_USER:-root}"
DB_PASSWORD="${XIAOPEI_MYSQL_PASSWORD:-}"
DB_NAME="${XIAOPEI_MYSQL_DATABASE:-xiaopei}"

echo "📊 数据库配置:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# 执行迁移
echo "🚀 开始执行迁移..."
echo ""

# 如果有密码，使用密码执行；否则提示输入
if [ -n "$DB_PASSWORD" ]; then
  mysql -h "$DB_HOST" --default-character-set=utf8mb4 --default-character-set=utf8mb4 -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" --default-character-set=utf8mb4 < "$MIGRATION_FILE"
else
  mysql -h "$DB_HOST" --default-character-set=utf8mb4 --default-character-set=utf8mb4 -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" --default-character-set=utf8mb4 < "$MIGRATION_FILE"
fi

echo ""
echo "✅ 迁移完成！"
echo ""
echo "验证: 检查 shensha_readings 表中是否有福星贵人的解读记录"
echo ""

