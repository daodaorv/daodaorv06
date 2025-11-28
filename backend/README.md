# 后端开发指南

基于实际代码状态的后端开发快速启动指南

## 🎯 当前状态
- **架构完整度**: 90% (目录结构、配置、中间件完备)
- **API实现度**: 7% (仅auth模块激活)
- **待激活路由**: 14个路由文件
- **待完善控制器**: 11个

## 🚀 立即开始：激活现有API路由

### 第一步：查看现有路由文件
```bash
cd backend/src/routes
ls -la
```

**现有路由文件** (14个):
- auth.routes.ts ✅ (已激活)
- vehicles.ts
- orders.ts
- payments.ts
- coupons.ts
- ratings.ts
- favorites.ts
- help.ts
- user.routes.ts
- DIY相关 (4个文件)

### 第二步：激活路由到主应用
编辑 `backend/src/index.ts`，添加路由导入：

```typescript
// 示例：激活vehicles路由
import vehicleRoutes from './routes/vehicles';

// 在app.use中添加
app.use('/api/v1/vehicles', vehicleRoutes);
```

### 第三步：完善控制器实现
每个路由文件都有对应的控制器，需要实现业务逻辑：

```bash
cd backend/src/controllers
# 查看11个控制器文件
ls -la
```

### 第四步：测试API接口
```bash
npm run dev
# 测试激活的接口
curl http://localhost:3000/api/v1/vehicles
```

## 📋 开发检查清单

### 环境检查
- [ ] Node.js 18.18.0+ 已安装
- [ ] Docker服务已启动
- [ ] MySQL + Redis容器运行中
- [ ] 数据库连接配置正确

### 代码质量
- [ ] TypeScript编译通过 (`npm run build`)
- [ ] ESLint检查通过 (`npm run lint`)
- [ ] API接口测试通过
- [ ] 数据库操作正常

## 🛠️ 开发规范

### API路径规范
```
GET    /api/v1/{module}           # 获取列表
POST   /api/v1/{module}           # 创建新资源
GET    /api/v1/{module}/{id}      # 获取详情
PUT    /api/v1/{module}/{id}      # 更新资源
DELETE /api/v1/{module}/{id}      # 删除资源
```

### 响应格式规范
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 错误处理规范
```typescript
// 使用统一的错误处理中间件
// HTTP状态码 + 错误码结构
400 - Bad Request (参数错误)
401 - Unauthorized (未授权)
403 - Forbidden (禁止访问)
404 - Not Found (资源不存在)
500 - Internal Server Error (服务器错误)
```

## 🔧 快速命令

```bash
# 开发服务器启动
npm run dev              # 端口3000/3001

# TypeScript编译
npm run build            # 编译到dist目录

# 代码检查
npm run lint             # ESLint检查
npm run lint:fix         # 自动修复

# 数据库操作
npm run migrate          # 运行迁移
npm run seed             # 填充测试数据

# 测试
npm test                 # 运行测试
npm run test:watch       # 监听模式
```

## 💡 重要提醒

1. **不要重构现有架构** - 基础架构已经非常完善
2. **优先激活现有路由** - 14个路由文件已经存在，只需要集成
3. **参考auth实现** - auth模块是完整的实现示例
4. **使用现有工具** - 所有中间件、配置、类型定义都已就绪

## 📞 需要帮助？

检查现有的实现：
- `backend/src/controllers/auth.controller.ts` - 完整的控制器示例
- `backend/src/middleware/` - 可用的中间件
- `backend/src/types/` - TypeScript类型定义
- `backend/src/config/` - 配置文件

---
**更新**: 2025-11-26 | **基于**: 实际代码分析