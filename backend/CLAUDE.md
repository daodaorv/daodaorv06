[根目录](../../CLAUDE.md) > **backend**

# Backend 模块文档

## 📋 模块概述

Backend模块是叨叨房车租赁管理平台的核心API服务，基于Node.js + Express + TypeScript构建，提供完整的RESTful API支持。

## 🏗️ 技术架构

### 技术栈
- **运行时**: Node.js 18.18.0
- **框架**: Express.js 4.18.2
- **语言**: TypeScript 5.1.6
- **数据库**: MySQL 8.0.35 (Sequelize ORM 6.32.1)
- **缓存**: Redis 7.2.3
- **认证**: JWT + bcryptjs

### 开发状态
- **整体完成度**: 70%
- **API路由**: 7% (1/14 激活)
- **控制器**: 30% (需完善业务逻辑)
- **数据模型**: 90% (6/11 完成)

## 📁 目录结构

```
backend/
├── src/
│   ├── controllers/          # 控制器层 (11个控制器)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── vehicle.controller.ts
│   │   └── ...
│   ├── routes/               # 路由层 (14个路由文件)
│   │   ├── auth.routes.ts    # ✅ 已激活
│   │   ├── vehicles.ts       # ❌ 待激活
│   │   ├── orders.ts         # ❌ 待激活
│   │   ├── payments.ts       # ❌ 待激活
│   │   ├── coupons.ts        # ❌ 待激活
│   │   └── ...
│   ├── models/               # 数据模型 (11个模型)
│   │   ├── User.ts           # ✅ 完成
│   │   ├── UserProfile.ts    # ✅ 完成
│   │   ├── VerificationCode.ts # ✅ 完成
│   │   └── diy.models.ts     # ✅ 完成 (DIY相关6个模型)
│   ├── middleware/           # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── services/             # 业务服务层
│   ├── utils/                # 工具函数
│   ├── config/               # 配置文件
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── jwt.ts
│   └── types/                # TypeScript类型定义
├── tests/                    # 测试文件
├── docs/                     # API文档
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 入口与启动

### 主入口文件
- **文件**: `src/index.ts`
- **端口**: 3000 (基础) / 3001 (开发)
- **启动命令**: `npm run dev`

### 关键路由状态
```typescript
// ✅ 已激活路由
app.use('/api/v1/auth', authRoutes);

// ❌ 待激活路由 (需要取消注释并导入)
// app.use('/api/v1/vehicles', vehicleRoutes);
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/coupons', couponRoutes);
// app.use('/api/v1/ratings', ratingRoutes);
// app.use('/api/v1/favorites', favoriteRoutes);
// app.use('/api/v1/help', helpRoutes);
// app.use('/api/v1/users', userRoutes);
// DIY相关路由 (4个文件)
```

## 🔧 核心依赖与配置

### 主要依赖包
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "mysql2": "^3.6.5",
    "redis": "^4.6.12",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "winston": "^3.11.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

### 环境配置
```bash
# 数据库配置
DATABASE_URL=mysql://daodao_dev:daodao_dev_2024@localhost:3306/daodao

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m

# Redis配置
REDIS_URL=redis://localhost:6379

# 服务端口
PORT=3001
```

## 📊 数据模型架构

### 用户相关模型
- **User**: 用户基础信息 (id, username, phone, email, password_hash, user_type, status)
- **UserProfile**: 用户档案 (user_id, gender, birthday, address, preferences)
- **UserLoginLog**: 登录日志 (user_id, login_time, ip_address, user_agent)
- **VerificationCode**: 验证码 (phone, code, type, expires_at)

### DIY相关模型
- **DiyPage**: DIY页面 (id, title, content, status, created_by)
- **DiyComponent**: DIY组件 (id, name, type, config, template_id)
- **DiyTemplate**: DIY模板 (id, name, description, components)
- **DiyPagePublication**: 页面发布 (id, page_id, version, published_at)
- **DiyOperationLog**: 操作日志 (id, user_id, action, resource_type, resource_id)
- **DiyMediaResource**: 媒体资源 (id, type, url, size, created_by)

### 待实现模型
根据数据库设计文档，还需实现：
- Vehicle, VehicleBrand, VehicleModel
- Store, Order, Payment
- Coupon, UserCoupon
- Role, UserRole
- SystemConfig, OperationLog

## 🛠️ 测试与质量

### 测试配置
- **测试框架**: Jest 29.7.0
- **测试命令**: `npm test`
- **覆盖率**: `npm run test:coverage`

### 代码质量工具
- **ESLint**: `@typescript-eslint/eslint-plugin`
- **代码格式化**: Prettier
- **类型检查**: TypeScript strict mode

## 🚨 紧急任务清单

### 最高优先级 (本周完成)
1. **激活API路由**
   ```typescript
   // 在 src/index.ts 中激活以下路由：
   import vehiclesRoutes from '@/routes/vehicles';
   import ordersRoutes from '@/routes/orders';
   import paymentsRoutes from '@/routes/payments';
   // ... 其他11个路由文件
   ```

2. **完善控制器实现**
   - 实现 `vehicle.controller.ts` 业务逻辑
   - 实现 `order.controller.ts` 业务逻辑
   - 实现 `payment.controller.ts` 业务逻辑
   - 完善其他8个控制器

3. **补充数据模型**
   - 实现 `Vehicle.ts` 车辆模型
   - 实现 `Order.ts` 订单模型
   - 实现 `Payment.ts` 支付模型
   - 实现其他8个业务模型

### 次要任务 (下周完成)
1. API接口测试和文档
2. 错误处理完善
3. 性能优化和缓存策略
4. 单元测试覆盖

## 🔍 API接口概览

### 已实现接口
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/login-with-code` - 验证码登录
- `GET /health` - 健康检查
- `GET /api/v1/test` - API测试

### 待激活接口 (估计150+个)
- **车辆管理**: 品牌管理、型号管理、车辆CRUD、状态管理
- **订单管理**: 订单流程、状态跟踪、统计报表
- **支付管理**: 支付接口、退款处理、押金管理
- **用户管理**: 用户CRUD、权限管理、档案管理
- **营销管理**: 优惠券、评价、收藏功能
- **帮助中心**: FAQ、客服、反馈
- **DIY管理**: 页面编辑、模板管理、组件库

## 📝 开发指南

### 添加新API标准流程
1. 在 `src/models/` 定义数据模型
2. 在 `src/controllers/` 实现控制器逻辑
3. 在 `src/routes/` 定义路由规则
4. 在 `src/validators/` 添加数据验证
5. 在 `src/index.ts` 注册路由
6. 编写单元测试
7. 更新API文档

### 代码规范
- 使用TypeScript严格模式
- 遵循RESTful API设计规范
- 统一的错误处理格式
- 完整的JSDoc注释
- 必须包含输入验证和授权检查

## 🔗 相关文档链接

- [数据库设计文档](../shared/docs/database/数据库设计.md)
- [API接口规范文档](../shared/docs/api/)
- [PC管理端文档](../admin-console/CLAUDE.md)
- [根目录配置文档](../../CLAUDE.md)

## 📞 技术支持

### 常用命令
```bash
# 开发服务器
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 数据库操作
npm run db:migrate   # 运行数据库迁移
npm run db:seed      # 填充测试数据

# 代码质量
npm run lint         # ESLint检查
npm run lint:fix     # 自动修复ESLint问题
npm run type-check   # TypeScript类型检查

# 测试
npm test             # 运行测试
npm run test:watch   # 监听模式测试
npm run test:coverage # 测试覆盖率
```

---

**模块维护者**: Backend开发团队
**最后更新**: 2025-11-26 22:15
**下次审核**: 2025-12-03