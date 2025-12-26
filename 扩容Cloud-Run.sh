#!/bin/bash

# Cloud Run 扩容脚本（内测/小范围 APK 定向测试配置）

set -e

SERVICE_NAME="xiaopei-core"
REGION="asia-east2"
PROJECT_ID="xiaopei-app"

echo "=========================================="
echo "🚀 Cloud Run 扩容配置"
echo "=========================================="
echo ""
echo "配置说明："
echo "  CPU: 1 vCPU（保持不变）"
echo "  内存: 2GiB（从 256Mi 扩容，支持 SSE 流式响应）"
echo "  超时: 600s（从 300s 增加，覆盖完整 LLM 流式输出 + 重试）"
echo "  并发: 10（从 30 降低，有 SSE 时建议偏低）"
echo "  Min instances: 0（允许冷启动，省钱）"
echo "  Max instances: 10（防止被刷把数据库打爆）"
echo "  数据库连接池: 15（通过环境变量设置）"
echo ""

echo "开始更新 Cloud Run 服务配置..."
echo ""
echo "步骤 1: 添加 Cloud SQL 连接..."
gcloud run services update "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --add-cloudsql-instances=xiaopei-app:asia-east2:xiaopei-db

echo ""
echo "步骤 2: 更新资源配置和数据库连接..."
gcloud run services update "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --memory=2Gi \
  --cpu=1 \
  --timeout=600 \
  --concurrency=10 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="MYSQL_CONNECTION_LIMIT=15,XIAOPEI_MYSQL_HOST=/cloudsql/xiaopei-app:asia-east2:xiaopei-db"

echo ""
echo "✅ Cloud Run 扩容完成！"
echo ""
echo "配置摘要："
echo "  服务名称: $SERVICE_NAME"
echo "  区域: $REGION"
echo "  项目 ID: $PROJECT_ID"
echo "  内存: 2GiB"
echo "  CPU: 1 vCPU"
echo "  超时: 600s"
echo "  并发: 10"
echo "  Min instances: 0"
echo "  Max instances: 10"
echo "  数据库连接池: 15"
echo ""
echo "你可以通过以下命令查看服务状态："
echo "gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"

