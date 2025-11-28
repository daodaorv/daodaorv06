# 叨叨房车后端API规范文档

> **文件版本**: v1.0
> **创建时间**: 2025-11-26
> **维护者**: 后端开发团队
> **适用范围**: 叨叨房车平台所有后端API服务

## 1. API设计总则

### 1.1 RESTful设计原则
- 使用名词而非动词：`/api/v1/users` 而非 `/api/v1/getUsers`
- 使用复数形式：`/api/v1/vehicles` 而非 `/api/v1/vehicle`
- 使用HTTP动词表示操作：GET、POST、PUT、PATCH、DELETE
- 使用HTTP状态码表示结果：200、201、400、401、403、404、422、500

### 1.2 统一URL结构
```
基础URL: /api/v1/{模块}/{资源}
版本控制: /api/v1/
模块划分: auth, users, vehicles, orders, payments, coupons, diy
资源标识: 使用UUID格式
```

**示例URL结构：**
```
GET    /api/v1/vehicles                 # 获取车辆列表
GET    /api/v1/vehicles/{id}            # 获取车辆详情
POST   /api/v1/vehicles                 # 创建车辆
PUT    /api/v1/vehicles/{id}            # 完整更新车辆
PATCH  /api/v1/vehicles/{id}            # 部分更新车辆
DELETE /api/v1/vehicles/{id}            # 删除车辆
```

## 2. 统一响应格式

### 2.1 成功响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 具体数据内容
  },
  "meta": {
    "timestamp": "2025-11-26T10:00:00+08:00",
    "requestId": "req_1732617600001_abc123",
    "version": "v1.0"
  }
}
```

### 2.2 分页响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2025-11-26T10:00:00+08:00",
    "requestId": "req_1732617600001_abc123",
    "version": "v1.0"
  }
}
```

### 2.3 错误响应格式
```json
{
  "code": 400001,
  "message": "请求参数错误",
  "data": {},
  "errors": [
    {
      "field": "phone",
      "message": "手机号格式不正确"
    }
  ],
  "meta": {
    "timestamp": "2025-11-26T10:00:00+08:00",
    "requestId": "req_1732617600001_abc123",
    "version": "v1.0"
  }
}
```

## 3. 错误码体系

### 3.1 错误码分配规则
- **10万-19万**: 通用系统错误
- **20万-29万**: 用户相关错误
- **30万-39万**: 订单相关错误
- **40万-49万**: 支付相关错误
- **50万-59万**: 车辆相关错误
- **60万-69万**: DIY系统错误
- **70万-79万**: 营销相关错误

### 3.2 常用错误码定义

| 错误码 | HTTP状态 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 100001 | 400 | 请求参数错误 | 参数格式不正确、缺少必填参数 |
| 100002 | 401 | 未认证访问 | 缺少Token或Token无效 |
| 100003 | 403 | 权限不足 | 用户角色无权限访问 |
| 100004 | 404 | 资源不存在 | 请求的资源未找到 |
| 100005 | 429 | 请求过于频繁 | 触发API限流 |
| 100006 | 500 | 服务器内部错误 | 数据库错误、外部服务异常 |

| 错误码 | HTTP状态 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 200001 | 400 | 用户名或密码错误 | 登录认证失败 |
| 200002 | 400 | 用户已存在 | 注册时用户名重复 |
| 200003 | 400 | 手机号格式错误 | 手机号验证失败 |
| 200004 | 400 | 验证码错误 | 验证码不匹配或已过期 |

| 错误码 | HTTP状态 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 300001 | 400 | 订单不存在 | 订单ID无效 |
| 300002 | 400 | 订单状态错误 | 当前状态不允许此操作 |
| 300003 | 400 | 车辆不可用 | 车辆已被预订或维护中 |

## 4. 认证与授权

### 4.1 JWT认证机制
```http
Authorization: Bearer <jwt_token>
```

**JWT Token结构：**
- **Access Token**: 15分钟有效期
- **Refresh Token**: 7天有效期
- **Token格式**: Header.Payload.Signature

### 4.2 用户类型权限
- **CUSTOMER**: 普通客户，只能访问C端API
- **STORE_MANAGER**: 门店管理员，可访问B端基础API
- **SYSTEM_ADMIN**: 系统管理员，可访问所有API
- **SUPER_ADMIN**: 超级管理员，拥有最高权限

### 4.3 API访问控制
```typescript
// API路径权限控制示例
/api/v1/auth/*           // 公开访问
/api/v1/vehicles         // 公开访问（只读）
/api/v1/users/profile    // 需要认证
/api/v1/admin/*          // 需要管理员权限
/api/v1/orders           // 需要认证（用户只能访问自己的订单）
```

## 5. 请求与响应规范

### 5.1 请求头规范
```http
Content-Type: application/json
Accept: application/json
User-Agent: Daodao-Client/1.0 (Platform)
X-Request-ID: req_1732617600001_abc123
Authorization: Bearer <jwt_token>
```

### 5.2 请求参数规范
- **查询参数**: 用于过滤、排序、分页
- **路径参数**: 用于资源标识（如ID）
- **请求体**: 用于创建和更新操作

### 5.3 参数验证
- **必填参数**: 必须验证存在性
- **格式验证**: 邮箱、手机号、日期等
- **范围验证**: 数值范围、字符串长度
- **业务验证**: 状态合法性、权限检查

## 6. 分页与排序

### 6.1 分页参数
```typescript
interface PaginationParams {
  page?: number;      // 页码，从1开始，默认1
  limit?: number;     // 每页数量，默认20，最大100
  sort?: string;      // 排序字段
  order?: 'asc' | 'desc';  // 排序方向，默认desc
}
```

### 6.2 排序字段规范
- **创建时间**: `createdAt`
- **更新时间**: `updatedAt`
- **名称**: `name`, `title`
- **价格**: `price`, `amount`

**示例请求：**
```
GET /api/v1/vehicles?page=2&limit=10&sort=price&order=asc
```

## 7. 数据库交互规范

### 7.1 ORM使用规范
- 使用Sequelize ORM进行数据库操作
- 所有模型必须定义字段类型和约束
- 使用事务处理复杂操作
- 数据库表名使用snake_case

### 7.2 查询优化
- 避免N+1查询，使用include预加载
- 合理使用索引，提高查询效率
- 分页查询必须添加limit
- 避免全表扫描

### 7.3 数据验证
- 模型层字段验证
- 控制器层业务验证
- 数据库层约束验证

## 8. 错误处理规范

### 8.1 错误处理中间件
```typescript
// 统一错误处理
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 记录错误日志
  logger.error('API Error', {
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.url,
    error: error instanceof Error ? error.message : 'Unknown error'
  });

  // 返回统一错误响应
  res.status(errorCode).json({
    code: errorCode,
    message: errorMessage,
    data: {},
    errors: validationErrors || [],
    meta: getMeta()
  });
};
```

### 8.2 日志记录规范
```typescript
// 日志级别
logger.error('错误日志', context);     // 系统错误
logger.warn('警告日志', context);      // 业务警告
logger.info('信息日志', context);      // 重要业务流程
logger.debug('调试日志', context);     // 调试信息（仅开发环境）
```

## 9. 安全规范

### 9.1 输入验证
- **永远不要信任客户端数据**
- 使用joi或express-validator进行参数验证
- 对所有用户输入进行清理和转义
- 防止SQL注入、XSS攻击

### 9.2 敏感数据处理
- **密码必须加密存储**（bcrypt）
- **API密钥使用环境变量**
- **用户手机号脱敏显示**
- **支付信息加密传输**

### 9.3 API限流
```typescript
// 限流配置
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分钟
  max: 100,                  // 最多100次请求
  message: {
    code: 100005,
    message: '请求过于频繁，请稍后再试',
    data: {},
    meta: getMeta()
  }
});
```

## 10. 缓存策略

### 10.1 Redis缓存规范
```typescript
// 缓存键命名规范
const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:{userId}',
  VEHICLE_LIST: 'vehicle:list:{page}:{filters}',
  ORDER_STATUS: 'order:status:{orderId}',
  CONFIG_DATA: 'config:{type}'
};

// 缓存时间
const CACHE_TTL = {
  SHORT: 5 * 60,      // 5分钟
  MEDIUM: 30 * 60,    // 30分钟
  LONG: 2 * 60 * 60,  // 2小时
  DAILY: 24 * 60 * 60 // 24小时
};
```

### 10.2 缓存更新策略
- **读取时缓存**: 首次读取时写入缓存
- **更新时清除**: 数据更新时清除相关缓存
- **定时刷新**: 配置数据定时刷新
- **缓存降级**: 缓存失败时直接查询数据库

## 11. 第三方服务集成

### 11.1 外部API调用规范
```typescript
// 统一外部服务调用
interface ExternalServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  code?: number;
}

// 重试机制
const callExternalAPI = async (url: string, options: RequestOptions) => {
  const maxRetries = 3;
  const timeout = 10000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 实现API调用
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
};
```

### 11.2 微信服务集成
- **小程序登录**: code2session接口
- **微信支付**: 统一下单、支付结果通知
- **模板消息**: 订单状态通知

## 12. 文档与测试

### 12.1 API文档规范
- 使用Swagger/OpenAPI 3.0规范
- 每个API必须包含请求/响应示例
- 错误码说明必须完整
- 更新API时必须同步更新文档

### 12.2 测试规范
```typescript
// 单元测试
describe('UserService', () => {
  test('should create user successfully', async () => {
    // 测试用例
  });
});

// 集成测试
describe('Auth API', () => {
  test('POST /api/v1/auth/login', async () => {
    // API测试
  });
});
```

## 13. 版本控制

### 13.1 API版本管理
- **URL版本控制**: `/api/v1/`, `/api/v2/`
- **向后兼容**: 新版本不破坏旧版本
- **废弃通知**: 提前3个月通知API废弃
- **版本标识**: 响应头包含版本信息

### 13.2 版本升级策略
- **渐进式升级**: 逐步迁移客户端
- **并行运行**: 新旧版本同时提供服务
- **监控指标**: 监控版本使用情况
- **安全下线**: 确认无使用后安全下线

## 14. 监控与日志

### 14.1 性能监控
```typescript
// 性能指标
const performanceMetrics = {
  responseTime: '<200ms',
  errorRate: '<0.1%',
  availability: '>99.9%',
  throughput: '1000 req/min'
};
```

### 14.2 业务监控
- **用户注册量**
- **订单创建量**
- **支付成功率**
- **API调用统计**

## 15. 开发环境配置

### 15.1 环境变量
```bash
# 数据库配置
DATABASE_URL=mysql://user:pass@localhost:3306/daodao
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 第三方服务
WECHAT_APP_ID=wx1234567890
WECHAT_APP_SECRET=your-wechat-secret
```

### 15.2 开发工具
- **热重载**: nodemon开发服务器
- **代码检查**: ESLint + Prettier
- **类型检查**: TypeScript严格模式
- **测试框架**: Jest + Supertest

---

**重要提示**:
1. 本文档为后端API的总规范，适用于所有后端API开发
2. 各端的具体API需求请参考各端的 `API.md` 文件
3. 开发新API前，请务必阅读各端 `API.md` 中的"待后端开发"项
4. API开发完成后，请及时更新各端 `API.md` 中的开发状态
5. 所有API必须通过完整的测试验证才能部署到生产环境

**文档维护**:
- 每次API变更时必须更新本文档
- 发现问题或有改进建议时，请及时反馈给后端团队
- 本文档的版本控制使用Git，所有修改都必须有明确的变更记录