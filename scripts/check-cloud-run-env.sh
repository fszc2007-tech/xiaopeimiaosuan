#!/bin/bash

# Cloud Run 环境变量检查脚本
# 用于快速诊断生产环境配置问题

set -e

SERVICE_NAME="xiaopei-core"
REGION="asia-east2"
PROJECT_ID="xiaopei-app"

echo "🔍 检查 Cloud Run 服务环境变量..."
echo "服务名称: $SERVICE_NAME"
echo "区域: $REGION"
echo "项目 ID: $PROJECT_ID"
echo ""

# 检查必需的环境变量
echo "📋 检查必需的环境变量："
echo ""

# 使用 gcloud 获取环境变量
ENV_JSON=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="json" 2>/dev/null)

# 检查 Google OAuth
echo "=== Google OAuth 配置 ==="
GOOGLE_CLIENT_IDS=$(echo "$ENV_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data.get('spec', {}).get('template', {}).get('spec', {}).get('containers', [{}])[0].get('env', []):
    if item.get('name') == 'GOOGLE_ALLOWED_CLIENT_IDS':
        if 'valueFrom' in item:
            print('✅ 已设置 (Secret: ' + item['valueFrom']['secretKeyRef']['name'] + ')')
        else:
            print('✅ 已设置 (直接值)')
        break
else:
    print('❌ 未设置')
" 2>/dev/null)

echo "  GOOGLE_ALLOWED_CLIENT_IDS: $GOOGLE_CLIENT_IDS"

# 验证 Secret 值
if echo "$GOOGLE_CLIENT_IDS" | grep -q "Secret"; then
  SECRET_NAME=$(echo "$GOOGLE_CLIENT_IDS" | grep -o "Secret: [^)]*" | cut -d' ' -f2)
  echo "  验证 Secret 值..."
  CLIENT_IDS_VALUE=$(gcloud secrets versions access latest --secret="$SECRET_NAME" --project=$PROJECT_ID 2>/dev/null || echo "")
  if [ -n "$CLIENT_IDS_VALUE" ]; then
    CLIENT_COUNT=$(echo "$CLIENT_IDS_VALUE" | tr ',' '\n' | grep -c "apps.googleusercontent.com" || echo "0")
    echo "  ✅ Secret 值存在，包含 $CLIENT_COUNT 个 Client ID"
    echo "  值预览: ${CLIENT_IDS_VALUE:0:80}..."
  else
    echo "  ⚠️ 无法读取 Secret 值（可能需要权限）"
  fi
fi

echo ""

# 检查 Tencent SMS
echo "=== Tencent SMS 配置 ==="

check_env_var() {
  local var_name=$1
  local desc=$2
  
  RESULT=$(echo "$ENV_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data.get('spec', {}).get('template', {}).get('spec', {}).get('containers', [{}])[0].get('env', []):
    if item.get('name') == '$var_name':
        if 'valueFrom' in item:
            print('✅ 已设置 (Secret: ' + item['valueFrom']['secretKeyRef']['name'] + ')')
        elif 'value' in item:
            print('✅ 已设置 (值: ' + item['value'] + ')')
        else:
            print('✅ 已设置')
        break
else:
    print('❌ 未设置')
" 2>/dev/null)
  
  echo "  $var_name ($desc): $RESULT"
}

check_env_var "XIAOPEI_TENCENT_SECRET_ID" "Tencent Secret ID"
check_env_var "XIAOPEI_TENCENT_SECRET_KEY" "Tencent Secret Key"
check_env_var "XIAOPEI_TENCENT_SMS_APP_ID" "Tencent SMS App ID"
check_env_var "XIAOPEI_TENCENT_SMS_TEMPLATE_ID" "Tencent SMS Template ID (默认: 2929187)"
check_env_var "XIAOPEI_TENCENT_SMS_REGION" "Tencent SMS Region (默认: ap-guangzhou)"

echo ""
echo "📊 查看最近的服务日志："
echo ""
echo "执行以下命令查看详细日志："
echo "  # Google 登录相关"
echo "  gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50 --format=json --filter=\"textPayload=~'SMS|Google|GOOGLE_ALLOWED_CLIENT_IDS'\" --project=$PROJECT_ID"
echo ""
echo "  # 短信发送相关"
echo "  gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50 --format=json --filter=\"textPayload=~'SMS|Tencent|验证码'\" --project=$PROJECT_ID"
echo ""

echo "🔧 如果需要设置环境变量，使用："
echo "  gcloud run services update $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --set-env-vars=\"KEY=value\""
echo ""
