#!/bin/bash

# 执行数据库迁移 012: 添加 quarterly 订阅方案支持
# 
# 使用方法：
# chmod +x scripts/run-migration-012.sh
# ./scripts/run-migration-012.sh

set -e

echo "=========================================="
echo "执行数据库迁移: 012_add_quarterly_plan.sql"
echo "=========================================="
echo ""

# 检查迁移文件是否存在
MIGRATION_FILE="core/src/database/migrations/012_add_quarterly_plan.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ 错误: 迁移文件不存在: $MIGRATION_FILE"
  exit 1
fi

echo "📄 迁移文件: $MIGRATION_FILE"
echo ""

# 读取数据库配置（从环境变量或使用默认值）
DB_HOST="${XIAOPEI_MYSQL_HOST:-localhost}"
DB_PORT="${XIAOPEI_MYSQL_PORT:-3306}"
DB_USER="${XIAOPEI_MYSQL_USER:-root}"
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

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "$MIGRATION_FILE"

echo ""
echo "✅ 迁移完成！"
echo ""
echo "验证: 检查 subscriptions 和 users 表的 plan 字段是否包含 'quarterly'"
echo ""


