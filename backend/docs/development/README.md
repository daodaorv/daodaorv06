# 后端开发环境搭建指南

本文档指导开发者快速搭建叨叨房车后端服务的开发环境。

## 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: 18.18.0 LTS 或更高版本
- **MySQL**: 8.0+ (通过Docker提供)
- **Redis**: 7.2+ (通过Docker提供)
- **Docker**: 20.10+ (用于数据库服务)
- **Git**: 2.20+

## 快速开始

### 1. 获取代码

```bash
git clone <repository-url>
cd daodao/backend
```

### 2. 启动数据库服务

```bash
# 在项目根目录执行
cd shared/tools/docker
cp .env.example .env
docker-compose up -d
```

### 3. 安装依赖

```bash
cd backend
npm install
```

### 4. 环境配置

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

**必须配置的环境变量：**
```env
# 数据库连接
DATABASE_URL=mysql://daodao_dev:daodao_dev_2024@localhost:3306/daodao
REDIS_URL=redis://localhost:6379

# JWT密钥 (生产环境必须修改)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 服务配置
NODE_ENV=development
PORT=3000
```

### 5. 数据库初始化

```bash
# 创建数据库表结构
npm run db:migrate

# 插入初始数据
npm run db:seed

# 创建管理员用户
node create-admin-user.js
```

### 6. 启动开发服务

```bash
# 开发模式启动
npm run dev

# 或者使用调试模式
npm run debug
```

服务启动后访问：http://localhost:3000

## 开发工作流

### 数据库操作

```bash
# 生成新的迁移文件
npm run db:generate --filename create_new_table

# 执行迁移
npm run db:migrate

# 回滚迁移
npm run db:rollback

# 重置数据库
npm run db:reset
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 代码质量

```bash
# 代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## 开发工具配置

### VSCode

推荐安装以下扩展：
- TypeScript Importer
- ESLint
- Prettier
- Thunder Client (API测试)
- Docker

**项目配置文件：**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

## API文档

启动服务后，可以通过以下地址访问API文档：
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## 常见问题

### Q: 数据库连接失败
A: 检查以下几点：
1. Docker服务是否正在运行：`docker ps`
2. 数据库配置是否正确：检查 `.env` 文件
3. 网络连接是否正常：`telnet localhost 3306`

### Q: Redis连接失败
A: 检查Redis服务：
```bash
# 检查Redis容器状态
docker-compose ps redis

# 查看Redis日志
docker-compose logs redis
```

### Q: 端口被占用
A: 修改端口配置：
```env
# .env文件中修改端口
PORT=3001
```

### Q: 依赖安装失败
A: 清理缓存重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 函数命名使用camelCase
- 常量使用SCREAMING_SNAKE_CASE
- 文件名使用kebab-case

### 提交规范
```bash
# 提交前必须通过检查
npm run pre-commit

# 提交格式
git commit -m "feat(api): 新增用户注册接口"
```

### 分支策略
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支
- `main`: 生产分支

## 性能优化

### 开发环境优化
1. 使用热重启：`npm run dev`
2. 数据库连接池：默认最大连接数10
3. Redis缓存：缓存热点数据
4. 日志级别：开发环境使用debug

### 监控和调试
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 监控内存使用
npm run monitor:memory
```

## 部署准备

### 构建项目
```bash
# 生产构建
npm run build

# 检查构建产物
ls -la dist/
```

### 环境变量检查
确保生产环境的以下变量已正确配置：
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `NODE_ENV=production`

## 获取帮助

- **项目文档**: `../../shared/docs/`
- **API文档**: http://localhost:3000/api-docs
- **问题反馈**: 提交Issue到项目仓库
- **技术支持**: 联系项目维护者

---

**提示**: 首次搭建环境建议完整阅读此文档，遇到问题请查看常见问题部分。