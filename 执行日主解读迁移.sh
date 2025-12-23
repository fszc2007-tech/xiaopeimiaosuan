#!/bin/bash

# 日主解读数据库迁移脚本

echo "开始执行日主解读表迁移..."

# 从环境变量获取数据库配置
DB_HOST=${XIAOPEI_MYSQL_HOST:-localhost}
DB_PORT=${XIAOPEI_MYSQL_PORT:-3306}
DB_USER=${XIAOPEI_MYSQL_USER:-root}
DB_PASSWORD=${XIAOPEI_MYSQL_PASSWORD}
DB_NAME=${XIAOPEI_MYSQL_DATABASE:-xiaopei}

# 检查是否设置了密码
if [ -z "$DB_PASSWORD" ]; then
  echo "错误：未设置 XIAOPEI_MYSQL_PASSWORD 环境变量"
  echo "请先设置：export XIAOPEI_MYSQL_PASSWORD=your_password"
  exit 1
fi

# 执行迁移
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < core/src/database/migrations/009_create_day_stem_readings.sql

if [ $? -eq 0 ]; then
  echo "✅ 迁移执行成功！"
  echo ""
  echo "验证数据："
  mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT stem, title FROM day_stem_readings ORDER BY FIELD(stem, '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸');"
else
  echo "❌ 迁移执行失败"
  exit 1
fi

