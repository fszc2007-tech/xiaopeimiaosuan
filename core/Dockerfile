# ===== 构建阶段 =====
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于编译 TypeScript）
RUN npm ci

# 复制源代码
COPY . .

# 编译 TypeScript
RUN npm run build

# ===== 运行阶段 =====
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制 package 文件
COPY package*.json ./

# 仅安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 复制 engine 目录（八字计算引擎）
COPY --from=builder /app/engine ./engine

# 复制 public 目录（静态文件：PDF 文档等）
COPY --from=builder /app/public ./public

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 暴露端口（Cloud Run 会使用 PORT 环境变量）
EXPOSE 8080

# 启动命令
CMD ["node", "dist/server.js"]

