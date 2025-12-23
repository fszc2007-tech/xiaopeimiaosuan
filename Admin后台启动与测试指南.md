# Admin 后台启动与测试指南

**更新时间**: 2024-11-18  
**状态**: Admin 后台已完成，可以启动测试

---

## 🚀 启动 Admin 后台

### 前置条件
1. ✅ MySQL 已启动（端口 3306）
2. ✅ Core 后端已启动（端口 3000）
3. ✅ 数据库已初始化（12张表）

### Step 1: 启动 Core 后端

```bash
# 1. 进入 core 目录
cd /Users/gaoxuxu/Desktop/小佩APP/core

# 2. 确认环境变量已配置
cat .env
# 应该包含:
# XIAOPEI_MYSQL_HOST=localhost
# XIAOPEI_MYSQL_USER=root
# XIAOPEI_MYSQL_PASSWORD=your_password
# XIAOPEI_MYSQL_DATABASE=xiaopei
# XIAOPEI_JWT_SECRET=your_secret
# ENCRYPTION_KEY=your_32_char_key  # Admin API Key 加密用

# 3. 启动服务
npm run dev

# ✅ 启动成功会显示:
# Server is running on http://localhost:3000
```

### Step 2: 启动 Admin 前端

```bash
# 1. 新开一个终端，进入 admin 目录
cd /Users/gaoxuxu/Desktop/小佩APP/admin

# 2. 安装依赖（首次）
npm install

# 3. 创建环境变量文件
cat > .env << EOF
VITE_API_URL=http://localhost:3000
EOF

# 4. 启动开发服务器
npm run dev

# ✅ 启动成功会显示:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Step 3: 访问 Admin 后台

1. 打开浏览器访问: `http://localhost:5173`
2. 使用 Admin 账号登录

---

## 🔑 Admin 账号管理

### 创建第一个 Admin 账号

Core 后端启动时会自动创建默认 Admin 账号（如果不存在）:

**默认账号** (开发环境):
- 用户名: `admin`
- 密码: `admin123`
- 邮箱: `admin@xiaopei.com`

**生产环境**: 需要手动创建

### 创建 Cursor 测试账号

通过 Admin 后台或 API 创建固定测试账号:

**Cursor 测试账号**:
- 账号: `cursor_test@xiaopei.com`
- 密码: 自动生成（在 Admin 后台显示）
- 默认 Pro: ✅ 是
- 用途: 自动化测试

---

## 📋 Admin 后台功能测试清单

### 1. 用户管理 ✅

#### 1.1 用户列表
- [ ] 访问"用户管理"页面
- [ ] 验证用户列表显示正常
- [ ] 测试搜索功能（手机号/邮箱/昵称）
- [ ] 测试筛选功能（Pro/普通用户）
- [ ] 测试分页功能
- [ ] 测试排序功能（注册时间/最后登录）

#### 1.2 用户详情
- [ ] 点击"查看详情"按钮
- [ ] 验证基本信息显示
- [ ] 验证订阅信息显示
- [ ] 验证命盘档案显示（如果有）
- [ ] 验证使用统计显示

#### 1.3 注册测试用户
- [ ] 点击"注册用户"按钮
- [ ] 填写手机号/邮箱
- [ ] 填写密码
- [ ] 选择应用区域（CN/HK）
- [ ] 设置是否 Pro 用户
- [ ] 提交表单
- [ ] 验证注册成功
- [ ] 复制用户信息

#### 1.4 Cursor 测试账号
- [ ] 访问"Cursor 测试账号"页面
- [ ] 点击"创建/获取测试账号"
- [ ] 验证账号信息显示
- [ ] 复制账号密码
- [ ] 测试重置密码功能

---

### 2. 大模型 API 配置 ✅

#### 2.1 DeepSeek 配置
- [ ] 访问"LLM 配置"页面
- [ ] 点击"DeepSeek"卡片
- [ ] 填写 API Key
- [ ] 配置 Base URL（可选）
- [ ] 配置模型名称（可选）
- [ ] 启用流式响应（开关）
- [ ] **启用思考模式**（开关，DeepSeek 专用）
- [ ] 设置温度（Temperature）
- [ ] 设置最大 Token 数
- [ ] 点击"保存配置"
- [ ] 点击"测试连接"
- [ ] 验证测试结果

#### 2.2 ChatGPT 配置
- [ ] 点击"ChatGPT"卡片
- [ ] 填写 API Key
- [ ] 配置 Base URL（可选）
- [ ] 选择模型（gpt-4 / gpt-3.5-turbo）
- [ ] 启用流式响应（开关）
- [ ] 设置温度和最大 Token
- [ ] 保存并测试连接

#### 2.3 Qwen 配置
- [ ] 点击"Qwen"卡片
- [ ] 填写 API Key
- [ ] 配置 Base URL（可选）
- [ ] 选择模型（qwen-turbo / qwen-plus / qwen-max）
- [ ] 启用流式响应（开关）
- [ ] 设置温度和最大 Token
- [ ] 保存并测试连接

#### 2.4 模型选择策略
- [ ] 设置默认模型（下拉选择）
- [ ] 设置备用模型（多选，拖拽排序）
- [ ] 保存策略

#### 2.5 API Key 安全
- [ ] 验证 API Key 显示为掩码（`************abcd`）
- [ ] 点击"查看 API Key"
- [ ] 输入管理员密码（二次验证）
- [ ] 验证显示真实 API Key
- [ ] 验证复制功能

---

## 🧪 API 测试（使用 curl）

### 1. Admin 登录

```bash
curl -X POST http://localhost:3000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "adminId": "uuid",
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

### 2. 获取用户列表

```bash
# 使用上一步获取的 token
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. 注册测试用户

```bash
curl -X POST http://localhost:3000/api/v1/admin/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "phone": "13900000001",
    "password": "test123",
    "nickname": "测试用户",
    "appRegion": "CN",
    "isPro": false
  }'
```

### 4. 获取 Cursor 测试账号

```bash
curl -X GET http://localhost:3000/api/v1/admin/users/cursor-test-account \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. 配置 DeepSeek

```bash
curl -X PUT http://localhost:3000/api/v1/admin/llm-configs/deepseek \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "apiKey": "sk-xxxxxxxxxxxxxx",
    "baseUrl": "https://api.deepseek.com",
    "modelName": "deepseek-chat",
    "enableStream": true,
    "enableThinking": true,
    "temperature": 0.7,
    "maxTokens": 4096,
    "isEnabled": true
  }'
```

### 6. 测试 LLM 连接

```bash
curl -X POST http://localhost:3000/api/v1/admin/llm-configs/deepseek/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🎯 核心测试流程

### 流程 1: Admin 登录 → 创建测试用户
1. 启动 Core 后端
2. 启动 Admin 前端
3. 登录 Admin 后台（admin / admin123）
4. 进入"用户管理"
5. 点击"注册测试用户"
6. 填写表单并提交
7. 复制用户信息
8. ✅ 成功创建测试用户

### 流程 2: 配置 DeepSeek → 测试连接
1. 进入"LLM 配置"页面
2. 点击"DeepSeek"卡片
3. 填写 API Key（如果有）
4. **启用思考模式**（重要）
5. 点击"保存配置"
6. 点击"测试连接"
7. ✅ 验证连接成功

### 流程 3: 创建 Cursor 测试账号 → 在 App 中登录
1. 进入"Cursor 测试账号"页面
2. 点击"创建测试账号"
3. 复制账号和密码
4. 打开小佩 App
5. 使用复制的账号登录
6. ✅ 验证登录成功且为 Pro 用户

---

## 🔒 安全注意事项

### 1. API Key 安全
- ✅ API Key 在数据库中**加密存储**（AES-256-GCM）
- ✅ API 响应中只返回**掩码**（`************abcd`）
- ✅ 查看真实 API Key 需要**管理员密码二次验证**
- ✅ 前端显示后立即清除内存

### 2. Admin 权限
- ✅ 只有超级管理员可以访问
- ✅ 所有操作记录日志（待实现）
- ✅ 生产环境需要强密码

### 3. Cursor 测试账号
- ✅ 仅在开发/测试环境使用
- ✅ 生产环境可以禁用或限制

---

## ⚠️ 常见问题

### 1. Admin 后台无法访问
```bash
# 检查 Admin 服务是否启动
lsof -i :5173

# 重新启动
cd admin
npm run dev
```

### 2. 登录失败
```bash
# 检查 Core 后端是否启动
curl http://localhost:3000/api/v1/health

# 检查默认 Admin 账号是否创建
# 查看数据库
mysql -u root -p xiaopei
SELECT * FROM admin_users;
```

### 3. LLM 配置保存失败
```bash
# 检查环境变量 ENCRYPTION_KEY 是否配置
cd core
cat .env | grep ENCRYPTION_KEY

# 如果没有，生成一个 32 字符的密钥
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 添加到 .env
echo "ENCRYPTION_KEY=your_generated_key" >> .env

# 重启 Core 后端
```

### 4. Cursor 测试账号创建失败
```bash
# 检查数据库中是否已存在
mysql -u root -p xiaopei
SELECT * FROM users WHERE email = 'cursor_test@xiaopei.com';

# 如果存在旧数据，删除后重新创建
DELETE FROM users WHERE email = 'cursor_test@xiaopei.com';
```

---

## 📊 测试完成标准

### ✅ Admin 后台测试通过标准
- [ ] 登录成功
- [ ] 用户列表显示正常
- [ ] 用户详情显示正常
- [ ] 可以注册测试用户
- [ ] Cursor 测试账号创建成功
- [ ] 三个 LLM 配置保存成功
- [ ] LLM 连接测试通过（至少一个）
- [ ] API Key 加密存储验证
- [ ] API Key 掩码显示验证
- [ ] 查看 API Key 需要二次验证

---

## 🎉 测试完成后

1. **记录 Cursor 测试账号信息**（用于 App 测试）
2. **记录默认 Admin 账号信息**（用于日常管理）
3. **配置至少一个 LLM**（DeepSeek 优先）
4. **准备进入 App 测试**

---

**祝测试顺利！** 🚀

**报告生成时间**: 2024-11-18  
**报告生成者**: Cursor AI Assistant

