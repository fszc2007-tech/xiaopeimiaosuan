# Cloud Run 资源分析报告

## 一、当前代码中的资源使用情况

### 1. 数据库连接池配置

**代码位置**: `core/src/database/connection.ts`

```typescript
// 生产环境默认只有 3 个连接！
const connectionLimit = parseInt(
  process.env.MYSQL_CONNECTION_LIMIT || 
  (process.env.NODE_ENV === 'production' ? '3' : '10')
);
```

**问题**：
- 🔴 **严重瓶颈**：生产环境只有 3 个数据库连接
- 如果同时有 3 个以上的请求需要数据库操作，后续请求会排队
- 短信发送需要多个数据库操作（查询、插入验证码、查询用户等）
- 高并发时会导致连接耗尽，请求超时，返回 502

### 2. SSE 流式响应（长时间连接）

**代码位置**: `core/src/routes/conversation.ts`

```typescript
// LLM 流式响应，可能持续 60 秒以上
res.setHeader('Content-Type', 'text/event-stream');
for await (const chunk of aiService.chatStreamWithQuota(...)) {
  res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk.content })}\n\n`);
}
```

**问题**：
- 🔴 **严重瓶颈**：SSE 流式响应可能持续 60 秒以上
- Cloud Run 默认超时是 300 秒（5分钟），但可能配置更短
- 长时间连接占用内存和 CPU
- 如果多个用户同时使用聊天功能，资源消耗会急剧增加

### 3. LLM API 调用超时

**代码位置**: `core/src/modules/ai/providers/*.ts`

```typescript
timeout: 60000, // 60 秒超时
```

**问题**：
- 🟡 **中等风险**：60 秒超时，如果 LLM API 响应慢，会占用连接很长时间
- 在等待 LLM 响应期间，数据库连接被占用
- 可能导致连接池耗尽

### 4. Redis 连接（已降级）

**代码位置**: `core/src/database/redis.ts`

```typescript
// Redis 不可用时降级处理
if (!redis) {
  return { allowed: true }; // 跳过限流
}
```

**当前状态**：
- ✅ 已降级处理，不会导致服务崩溃
- ⚠️ 但限流功能失效，可能导致数据库压力增加

## 二、Cloud Run 默认配置分析

### Cloud Run 默认资源限制

| 资源 | 默认值 | 可能的问题 |
|------|--------|------------|
| **内存** | 512MB | ⚠️ 可能不足（Node.js + 数据库连接 + SSE 流） |
| **CPU** | 1 vCPU | ⚠️ 单核，无法充分利用多核 |
| **超时** | 300 秒（5分钟） | ✅ 足够（LLM 60秒 + 缓冲） |
| **并发** | 80 个请求/实例 | 🔴 **严重瓶颈**：如果每个请求占用数据库连接，3个连接远远不够 |
| **最大实例数** | 1000 | ✅ 足够 |

### 资源瓶颈计算

**场景 1：短信发送（简单请求）**
- 数据库操作：3-5 次查询/插入
- 每个操作占用连接：~100-500ms
- 总耗时：~500ms - 2s
- **3 个连接可以支持**：约 6-18 QPS（每秒请求数）

**场景 2：聊天流式响应（复杂请求）**
- 数据库操作：5-10 次查询/插入
- LLM 调用：60 秒（占用连接）
- SSE 流式响应：60 秒（占用内存和 CPU）
- **3 个连接可以支持**：最多 3 个并发聊天请求

**场景 3：混合场景（短信 + 聊天）**
- 如果 2 个用户在聊天（占用 2 个连接）
- 只剩下 1 个连接给其他请求
- **其他请求会排队或超时**

## 三、502 错误的根本原因分析

### 最可能的原因

1. **数据库连接池耗尽**（最可能）
   - 只有 3 个连接
   - 多个请求同时需要数据库操作
   - 连接被占用，新请求排队
   - 排队时间过长，Cloud Run 超时，返回 502

2. **内存不足**
   - 默认 512MB 可能不足
   - SSE 流式响应占用内存
   - 多个并发请求导致内存耗尽
   - 服务崩溃，返回 502

3. **服务启动失败**
   - 数据库连接失败
   - 环境变量缺失
   - 代码运行时错误
   - 服务无法启动，返回 502

## 四、资源需求评估

### 当前需求（基于代码分析）

| 资源类型 | 当前配置 | 建议配置 | 原因 |
|---------|---------|---------|------|
| **数据库连接池** | 3 | **20-50** | 支持更多并发请求 |
| **内存** | 512MB（默认） | **1-2GB** | SSE 流式响应 + 数据库连接 |
| **CPU** | 1 vCPU（默认） | **2 vCPU** | 处理流式响应和数据库查询 |
| **超时** | 300 秒（默认） | **600 秒** | LLM 调用可能需要更长时间 |
| **并发** | 80（默认） | **100-200** | 提高吞吐量 |

### 关键问题

1. **数据库连接池太小**（3 个连接）
   - 这是最严重的瓶颈
   - 需要立即增加

2. **内存可能不足**（512MB）
   - SSE 流式响应占用内存
   - 多个并发请求可能导致内存不足

3. **没有 Redis**（限流失效）
   - 限流功能失效
   - 可能导致数据库压力增加

## 五、建议的修复方案

### 立即修复（P0）

1. **增加数据库连接池**
   ```typescript
   // 生产环境至少 20 个连接
   const connectionLimit = parseInt(
     process.env.MYSQL_CONNECTION_LIMIT || 
     (process.env.NODE_ENV === 'production' ? '20' : '10')
   );
   ```

2. **增加 Cloud Run 内存**
   ```bash
   gcloud run services update xiaopei-core \
     --memory=2Gi \
     --cpu=2 \
     --timeout=600 \
     --region=asia-east2 \
     --project=xiaopei-app
   ```

3. **配置环境变量**
   ```bash
   gcloud run services update xiaopei-core \
     --set-env-vars="MYSQL_CONNECTION_LIMIT=20" \
     --region=asia-east2 \
     --project=xiaopei-app
   ```

### 中期优化（P1）

1. **配置 Redis**（恢复限流功能）
2. **监控和告警**（及时发现资源问题）
3. **数据库连接池监控**（查看连接使用情况）

## 六、验证方法

### 检查当前 Cloud Run 配置

```bash
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --format="yaml" | grep -E "memory|cpu|timeout|concurrency"
```

### 检查数据库连接使用情况

```sql
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

### 监控 Cloud Run 指标

- CPU 使用率
- 内存使用率
- 请求延迟
- 错误率（502 错误）

