#!/bin/bash

# 后端部署到 Cloud Run 脚本

set -e

echo "=========================================="
echo "部署后端到 Cloud Run"
echo "=========================================="
echo ""

cd "$(dirname "$0")/core"

echo "1️⃣ 构建 TypeScript..."
npm run build

echo ""
echo "2️⃣ 部署到 Cloud Run..."
echo "这可能需要几分钟时间..."
echo ""

gcloud run deploy xiaopei-core \
  --source . \
  --region=asia-east2 \
  --project=xiaopei-app \
  --allow-unauthenticated \
  --platform=managed

echo ""
echo "✅ 后端部署完成！"
echo ""

