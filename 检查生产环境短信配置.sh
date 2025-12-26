#!/bin/bash

# 检查生产环境短信配置

echo "=========================================="
echo "🔍 检查生产环境短信配置"
echo "=========================================="
echo ""

SERVICE_NAME="xiaopei-core"
REGION="asia-east2"
PROJECT_ID="xiaopei-app"

echo "1. 检查 Cloud Run 环境变量（短信相关）..."
echo ""

# 获取所有环境变量
ENV_VARS=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(spec.template.spec.containers[0].env)" 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ 无法获取 Cloud Run 配置"
  exit 1
fi

# 检查关键环境变量
echo "检查关键环境变量："
echo ""

# 检查腾讯云密钥
if echo "$ENV_VARS" | grep -q "XIAOPEI_TENCENT_SECRET_ID"; then
  echo "✅ XIAOPEI_TENCENT_SECRET_ID: 已配置（Secret Manager）"
else
  echo "❌ XIAOPEI_TENCENT_SECRET_ID: 未配置"
fi

if echo "$ENV_VARS" | grep -q "XIAOPEI_TENCENT_SECRET_KEY"; then
  echo "✅ XIAOPEI_TENCENT_SECRET_KEY: 已配置（Secret Manager）"
else
  echo "❌ XIAOPEI_TENCENT_SECRET_KEY: 未配置"
fi

if echo "$ENV_VARS" | grep -q "XIAOPEI_TENCENT_SMS_APP_ID"; then
  echo "✅ XIAOPEI_TENCENT_SMS_APP_ID: 已配置（Secret Manager）"
else
  echo "❌ XIAOPEI_TENCENT_SMS_APP_ID: 未配置"
fi

# 检查 Region 配置
if echo "$ENV_VARS" | grep -q "XIAOPEI_TENCENT_SMS_REGION"; then
  REGION_VALUE=$(echo "$ENV_VARS" | grep -o "XIAOPEI_TENCENT_SMS_REGION[^,}]*" | grep -o "value[^,}]*" | cut -d"'" -f2 || echo "未找到")
  echo "✅ XIAOPEI_TENCENT_SMS_REGION: $REGION_VALUE"
else
  echo "⚠️  XIAOPEI_TENCENT_SMS_REGION: 未配置（将使用默认值 ap-singapore）"
fi

# 检查模板 ID
if echo "$ENV_VARS" | grep -q "XIAOPEI_TENCENT_SMS_TEMPLATE_ID"; then
  echo "✅ XIAOPEI_TENCENT_SMS_TEMPLATE_ID: 已配置"
else
  echo "⚠️  XIAOPEI_TENCENT_SMS_TEMPLATE_ID: 未配置（将使用默认值 2929187）"
fi

echo ""
echo "2. 检查代码中的默认值..."
echo ""
echo "根据 core/src/config/sms.ts："
echo "  - 默认 Region: ap-singapore"
echo "  - 默认 Template ID: 2929187"
echo "  - 默认 App ID: 2400003800（硬编码）"
echo "  - Secret ID/Key: 有硬编码默认值（但生产环境应使用 Secret Manager）"
echo ""

echo "3. 可能的问题："
echo ""
echo "🔴 如果短信发送失败，可能的原因："
echo "  1. Secret Manager 中的密钥不正确或过期"
echo "  2. Region 配置错误（应该是 ap-singapore 用于国际短信）"
echo "  3. 腾讯云账户每日短信限额已用完"
echo "  4. 手机号格式不正确"
echo "  5. 限流服务阻止了请求"
echo ""

echo "4. 建议的修复步骤："
echo ""
echo "  步骤 1: 检查 Cloud Run 日志"
echo "    gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50 --project=$PROJECT_ID"
echo ""
echo "  步骤 2: 验证 Secret Manager 中的密钥"
echo "    gcloud secrets versions access latest --secret=xiaopei-tencent-secret-id --project=$PROJECT_ID"
echo ""
echo "  步骤 3: 确保 Region 配置正确"
echo "    gcloud run services update $SERVICE_NAME --set-env-vars=\"XIAOPEI_TENCENT_SMS_REGION=ap-singapore\" --region=$REGION --project=$PROJECT_ID"
echo ""

