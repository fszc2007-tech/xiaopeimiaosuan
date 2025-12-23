#!/bin/bash

# 小佩 App API 测试脚本
# 使用方法：bash API测试命令.sh

API_URL="http://localhost:3000"
TOKEN=""

echo "================================"
echo "小佩 App API 测试"
echo "================================"
echo ""

# 1. 健康检查
echo "1. 测试健康检查..."
curl -s "$API_URL/health" | json_pp
echo ""
echo ""

# 2. 请求验证码
echo "2. 请求验证码（CN 区域）..."
PHONE="13800138000"
curl -s -X POST "$API_URL/api/v1/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"region\":\"cn\"}" | json_pp
echo ""
echo "请查看服务器控制台获取验证码"
echo ""

# 3. 等待用户输入验证码
read -p "请输入验证码: " CODE
echo ""

# 4. 登录/注册
echo "3. 登录/注册..."
RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login_or_register" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\",\"channel\":\"cn\"}")
echo $RESPONSE | json_pp

# 提取 token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Token: $TOKEN"
echo ""

if [ -z "$TOKEN" ]; then
  echo "登录失败，请检查验证码"
  exit 1
fi

# 5. 获取用户信息
echo "4. 获取用户信息..."
curl -s -X GET "$API_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# 6. 计算命盘
echo "5. 计算命盘..."
CHART_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/bazi/chart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "测试用户",
    "gender": "male",
    "birth": {
      "sex": "male",
      "calendar_type": "公历",
      "year": 1990,
      "month": 1,
      "day": 1,
      "hour": 12,
      "minute": 0,
      "tz": "Asia/Shanghai"
    }
  }')
echo $CHART_RESPONSE | json_pp | head -50
echo "... (结果已截断，完整结果请查看服务器响应)"
echo ""
echo ""

# 7. 获取命盘列表
echo "6. 获取命盘列表..."
curl -s -X GET "$API_URL/api/v1/bazi/charts?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

echo "================================"
echo "测试完成！"
echo "================================"
