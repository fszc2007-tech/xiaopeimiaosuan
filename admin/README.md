# Admin 管理后台

小佩命理的管理后台，用于管理用户、配置大模型 API 等。

## 技术栈

- **React**: UI 框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **React Router**: 路由管理

## 目录结构

```
admin/
├── src/
│   ├── pages/            # 页面组件
│   │   ├── Login/        # 管理员登录页
│   │   ├── Users/        # 用户管理页
│   │   ├── LLMConfig/    # 大模型配置页
│   │   └── Settings/     # 系统设置页
│   ├── components/       # UI 组件
│   ├── services/         # API 服务
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
├── public/               # 静态资源
└── package.json
```

## 核心功能

### 1. 管理员登录
- 管理员账号登录
- Session 管理

### 2. 用户管理
- 用户列表（支持搜索、筛选）
- 用户详情（基本信息、命盘档案、使用统计）
- 创建测试用户
- Cursor 测试账号管理

### 3. 大模型配置
- DeepSeek API 配置
- ChatGPT API 配置
- Qwen API 配置
- API Key 加密存储
- API Key 掩码显示

### 4. 系统设置
- 系统参数配置
- 日志查看

## 开发规范

### API 调用

所有 API 调用统一通过 Core 后端服务：
- 基础 URL：`http://localhost:3000`（可配置）
- 路径前缀：`/api/v1/admin/`
- 响应格式：`{ success: boolean, data?: T, error?: {...} }`

### 安全注意事项

- ✅ API Key 仅在必要时显示（掩码）
- ✅ 二次确认后才显示完整 API Key
- ✅ 所有敏感操作需要确认

详细规范请参考：`admin.doc/Admin后台最小需求功能文档.md`

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 环境配置

创建 `.env` 文件，配置 API 基础 URL：

```
VITE_API_URL=http://localhost:3000
```

## v1.0 最小需求

### 核心功能（必须）
1. 管理员登录
2. 用户列表与详情
3. 三个大模型 API 配置（DeepSeek、ChatGPT、Qwen）
4. Cursor 测试账号

### 可选依赖
- 用户统计（依赖业务数据表）
- 命盘档案（依赖 `bazi_charts` 表）

## 参考文档

- **功能需求**: `admin.doc/Admin后台最小需求功能文档.md`
- **API 规范**: `app.doc/API接口统一规范.md`

## 注意事项

1. **API Key 安全**：加密存储，掩码显示
2. **权限控制**：管理员才能访问
3. **操作确认**：敏感操作需要二次确认
4. **仅支持三个模型**：DeepSeek、ChatGPT、Qwen（没有其他）

---

更多信息请参考项目文档。
