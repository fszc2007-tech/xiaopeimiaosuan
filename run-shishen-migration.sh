#!/bin/bash

# 十神解读数据库迁移脚本
# 使用方法: ./run-shishen-migration.sh [数据库密码]

set -e

# 数据库配置（从环境变量读取，或使用默认值）
DB_HOST="${XIAOPEI_MYSQL_HOST:-localhost}"
DB_PORT="${XIAOPEI_MYSQL_PORT:-3306}"
DB_USER="${XIAOPEI_MYSQL_USER:-root}"
DB_PASSWORD="${1:-${XIAOPEI_MYSQL_PASSWORD:-}}"
DB_NAME="${XIAOPEI_MYSQL_DATABASE:-xiaopei}"

echo "🚀 开始执行十神解读数据库迁移..."
echo "📊 数据库: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo "👤 用户: ${DB_USER}"
echo ""

# 如果密码为空，提示输入
if [ -z "$DB_PASSWORD" ]; then
  echo "⚠️  请输入数据库密码（如果 root 用户没有密码，直接按回车）:"
  read -s DB_PASSWORD
  echo ""
fi

# 构建 MySQL 命令
if [ -z "$DB_PASSWORD" ]; then
  MYSQL_CMD="mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_NAME}"
else
  MYSQL_CMD="mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}"
fi

# 步骤1: 创建表
echo "📝 步骤1: 创建 shishen_readings 表..."
if $MYSQL_CMD < core/src/database/migrations/033_create_shishen_readings.sql; then
  echo "✅ 表创建成功"
else
  echo "❌ 表创建失败"
  exit 1
fi

echo ""

# 步骤2: 插入数据
echo "📝 步骤2: 插入十神解读数据（40条记录）..."
if $MYSQL_CMD < core/src/database/migrations/034_insert_shishen_readings.sql; then
  echo "✅ 数据插入成功"
else
  echo "❌ 数据插入失败"
  exit 1
fi

echo ""

# 步骤3: 验证数据
echo "📊 步骤3: 验证数据..."
VERIFY_QUERY="SELECT 
  COUNT(*) as total_count,
  COUNT(DISTINCT shishen_code) as shishen_count,
  COUNT(DISTINCT pillar_type) as pillar_count
FROM shishen_readings 
WHERE is_active = TRUE;"

VERIFY_RESULT=$($MYSQL_CMD -e "$VERIFY_QUERY" 2>/dev/null || echo "验证失败")

if echo "$VERIFY_RESULT" | grep -q "40"; then
  echo "✅ 数据验证成功"
  echo "$VERIFY_RESULT"
else
  echo "⚠️  数据验证结果:"
  echo "$VERIFY_RESULT"
fi

echo ""
echo "🎉 迁移完成！"
echo ""
echo "📋 下一步："
echo "   1. 重启 Core 服务"
echo "   2. 在 App 中测试十神解读功能"


