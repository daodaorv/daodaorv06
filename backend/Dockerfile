# 多阶段构建 Dockerfile
# 叨叨房车后端服务

# 基础镜像
FROM node:18.18.0-alpine AS base
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    bash \
    tzdata \
    && rm -rf /var/cache/apk/*

# 设置时区
ENV TZ=Asia/Shanghai

# 复制package文件
COPY package*.json ./
COPY tsconfig.json ./

# 开发阶段
FROM base AS development
RUN npm ci --only=development

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "run", "dev"]

# 构建阶段
FROM base AS build
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM node:18.18.0-alpine AS production
WORKDIR /app

# 安装生产依赖
COPY --from=build /app/node_modules ./node_modules

# 复制应用代码
COPY --from=development /app/src ./src
COPY --from=development /app/package*.json ./
COPY --from=development /app/tsconfig.json ./

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 创建必要目录并设置权限
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/index.js"]