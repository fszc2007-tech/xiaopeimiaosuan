# Cloud Run 服务信息

## ✅ 服务已部署

**服务名称**: `xiaopei-core`  
**区域**: `asia-east2` (香港)  
**项目 ID**: `xiaopei-app`  
**项目编号**: `343578696044`  
**最后部署时间**: 2025-12-25T04:15:48.128057Z  
**部署者**: fszc2007@gmail.com

## 🔗 访问地址

**服务 URL**: https://xiaopei-core-343578696044.asia-east2.run.app

**健康检查**: https://xiaopei-core-343578696044.asia-east2.run.app/health

## 📊 资源配置

- **内存**: 2GiB
- **CPU**: 1 vCPU
- **超时**: 600s
- **并发**: 10
- **Min instances**: 0
- **Max instances**: 10
- **数据库连接池**: 15

## 🔍 在 Google Cloud Console 中查找

### 方法 1: 直接链接
https://console.cloud.google.com/run/detail/asia-east2/xiaopei-core?project=xiaopei-app

### 方法 2: 手动查找
1. 打开 Google Cloud Console: https://console.cloud.google.com
2. **确保选择了正确的项目**: `xiaopei-app`
3. 导航到: **Cloud Run** → **服务**
4. **确保区域筛选器设置为**: `asia-east2` (或选择"所有区域")
5. 查找服务: `xiaopei-core`

### 方法 3: 命令行查看
```bash
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app
```

## ⚠️ 如果找不到服务

### 可能的原因：
1. **项目选择错误**
   - 当前选择的项目不是 `xiaopei-app`
   - 解决方法: 在控制台顶部切换项目

2. **区域筛选器设置错误**
   - 当前筛选的区域不包含 `asia-east2`
   - 解决方法: 将区域筛选器设置为"所有区域"或选择 `asia-east2`

3. **账号权限问题**
   - 当前登录的 Google 账号不是 `fszc2007@gmail.com`
   - 或者账号没有 Cloud Run 查看权限
   - 解决方法: 使用正确的账号登录，或联系项目管理员

4. **服务被删除（不太可能）**
   - 如果服务确实不存在，可以重新部署

## 📝 验证服务状态

```bash
# 检查服务列表
gcloud run services list --project=xiaopei-app --region=asia-east2

# 测试健康检查
curl https://xiaopei-core-343578696044.asia-east2.run.app/health

# 查看服务详情
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app
```

## 🔧 重新部署（如果需要）

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/core

gcloud run deploy xiaopei-core \
  --source . \
  --region=asia-east2 \
  --project=xiaopei-app \
  --allow-unauthenticated \
  --platform=managed \
  --add-cloudsql-instances=xiaopei-app:asia-east2:xiaopei-db \
  --set-env-vars="MYSQL_CONNECTION_LIMIT=15,XIAOPEI_MYSQL_HOST=/cloudsql/xiaopei-app:asia-east2:xiaopei-db,XIAOPEI_MYSQL_USER=xiaopei_prod" \
  --memory=2Gi \
  --cpu=1 \
  --timeout=600 \
  --concurrency=10 \
  --min-instances=0 \
  --max-instances=10
```

