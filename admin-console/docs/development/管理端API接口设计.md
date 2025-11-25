# 叨叨房车管理端API接口设计文档

**文档版本**: v1.0 | **创建时间**: 2024-11-24 | **更新时间**: 2024-11-24

---

## 1. API设计原则

### 1.1 RESTful设计规范

**URL命名规则**:
- 使用名词复数形式：`/api/v1/users`
- 使用小写字母和连字符：`/api/v1/user-profiles`
- 资源层级关系：`/api/v1/users/{userId}/orders`

**HTTP方法使用**:
- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 完整更新资源
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源

### 1.2 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number          // 响应码，0表示成功
  message: string       // 响应消息
  data: T              // 响应数据
  meta?: {             // 元数据
    timestamp: string   // 响应时间戳
    requestId: string   // 请求ID
    pagination?: {      // 分页信息
      page: number
      size: number
      total: number
      pages: number
    }
  }
}
```

### 1.3 错误码体系

| 错误码范围 | 错误类型 | 说明 |
|-----------|---------|------|
| 0 | 成功 | 请求成功处理 |
| 100000-199999 | 通用错误 | 参数错误、系统错误等 |
| 200000-299999 | 认证授权错误 | 登录失败、权限不足等 |
| 300000-399999 | 用户相关错误 | 用户不存在、状态异常等 |
| 400000-499999 | 业务逻辑错误 | 业务规则验证失败等 |

---

## 2. 认证和授权API

### 2.1 用户登录

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "1",
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "role": {
        "id": "1",
        "name": "平台管理员",
        "code": "platform_admin"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 900
  },
  "meta": {
    "timestamp": "2024-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

### 2.2 刷新Token

```http
POST /api/v1/auth/refresh
Authorization: Bearer {refreshToken}
```

### 2.3 用户登出

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

### 2.4 获取当前用户信息

```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

---

## 3. 用户管理API

### 3.1 获取用户列表

```http
GET /api/v1/users?page=1&size=20&keyword=admin&status=active&role=platform_admin
Authorization: Bearer {accessToken}
```

**查询参数**:
- `page`: 页码，默认1
- `size`: 每页数量，默认20
- `keyword`: 搜索关键词
- `status`: 用户状态：`active`、`inactive`、`locked`
- `role`: 角色代码
- `regionId`: 区域ID（区域经理及以上权限）
- `storeId`: 门店ID（门店经理及以上权限）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "status": "active",
      "role": {
        "id": "1",
        "name": "平台管理员",
        "code": "platform_admin"
      },
      "dataScope": {
        "type": "all"
      },
      "lastLoginAt": "2024-11-24T09:30:00+08:00",
      "createdAt": "2024-01-01T00:00:00+08:00"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 3.2 获取用户详情

```http
GET /api/v1/users/{userId}
Authorization: Bearer {accessToken}
```

### 3.3 创建用户

```http
POST /api/v1/users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "newuser",
  "name": "新用户",
  "email": "newuser@example.com",
  "phone": "13900139000",
  "password": "password123",
  "roleId": "2",
  "dataScope": {
    "type": "store",
    "storeIds": ["1", "2"]
  }
}
```

### 3.4 更新用户

```http
PUT /api/v1/users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "更新后的用户名",
  "email": "updated@example.com",
  "phone": "13800138001",
  "status": "active"
}
```

### 3.5 删除用户

```http
DELETE /api/v1/users/{userId}
Authorization: Bearer {accessToken}
```

### 3.6 重置用户密码

```http
POST /api/v1/users/{userId}/reset-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

---

## 4. 角色权限管理API

### 4.1 获取角色列表

```http
GET /api/v1/roles?page=1&size=20
Authorization: Bearer {accessToken}
```

### 4.2 获取所有权限

```http
GET /api/v1/permissions
Authorization: Bearer {accessToken}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "code": "user:view",
      "name": "查看用户",
      "type": "menu",
      "parentId": null,
      "path": "/users",
      "icon": "user",
      "sort": 1,
      "children": [
        {
          "id": "2",
          "code": "user:create",
          "name": "创建用户",
          "type": "button",
          "parentId": "1",
          "sort": 1
        }
      ]
    }
  ]
}
```

### 4.3 创建角色

```http
POST /api/v1/roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "门店经理",
  "code": "store_manager",
  "description": "门店管理角色",
  "permissions": ["user:view", "user:create", "vehicle:view"]
}
```

### 4.4 更新角色

```http
PUT /api/v1/roles/{roleId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "高级门店经理",
  "description": "高级门店管理角色",
  "permissions": ["user:view", "user:create", "user:edit", "vehicle:view"]
}
```

---

## 5. 车辆管理API

### 5.1 获取车辆列表

```http
GET /api/v1/vehicles?page=1&size=20&brand=奥迪&model=A6&status=available&storeId=1
Authorization: Bearer {accessToken}
```

**查询参数**:
- `brand`: 车辆品牌
- `model`: 车辆型号
- `status`: 车辆状态：`available`、`rented`、`maintenance`、`disabled`
- `storeId`: 门店ID
- `type`: 车辆类型：`crowdfunding`、`cooperative`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "plateNumber": "京A88888",
      "brand": "奥迪",
      "model": "A6L",
      "year": "2023",
      "type": "crowdfunding",
      "status": "available",
      "mileage": 15000,
      "location": {
        "storeId": "1",
        "storeName": "北京朝阳店",
        "address": "北京市朝阳区xxx街道"
      },
      "price": {
        "daily": 500,
        "weekly": 3000,
        "monthly": 10000
      },
      "images": [
        "https://example.com/vehicle1.jpg"
      ],
      "createdAt": "2024-01-01T00:00:00+08:00"
    }
  ]
}
```

### 5.2 获取车辆详情

```http
GET /api/v1/vehicles/{vehicleId}
Authorization: Bearer {accessToken}
```

### 5.3 创建车辆

```http
POST /api/v1/vehicles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "plateNumber": "京B66666",
  "brand": "宝马",
  "model": "X5",
  "year": "2023",
  "type": "cooperative",
  "storeId": "1",
  "mileage": 5000,
  "price": {
    "daily": 800,
    "weekly": 5000,
    "monthly": 15000
  },
  "specifications": {
    "seats": 5,
    "fuelType": "汽油",
    "transmission": "自动"
  },
  "images": [
    "https://example.com/bmw_x5_1.jpg",
    "https://example.com/bmw_x5_2.jpg"
  ]
}
```

### 5.4 更新车辆状态

```http
PATCH /api/v1/vehicles/{vehicleId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "maintenance",
  "reason": "定期保养"
}
```

---

## 6. 订单管理API

### 6.1 获取订单列表

```http
GET /api/v1/orders?page=1&size=20&status=active&userId=123&startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {accessToken}
```

**查询参数**:
- `status`: 订单状态：`pending`、`confirmed`、`active`、`completed`、`cancelled`
- `userId`: 用户ID
- `vehicleId`: 车辆ID
- `storeId`: 门店ID
- `startDate`: 开始日期
- `endDate`: 结束日期

### 6.2 获取订单详情

```http
GET /api/v1/orders/{orderId}
Authorization: Bearer {accessToken}
```

### 6.3 更新订单状态

```http
PATCH /api/v1/orders/{orderId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "confirmed",
  "remark": "确认订单"
}
```

---

## 7. 门店管理API

### 7.1 获取门店列表

```http
GET /api/v1/stores?page=1&size=20&region=华北&city=北京&type=direct
Authorization: Bearer {accessToken}
```

### 7.2 创建门店

```http
POST /api/v1/stores
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "北京海淀店",
  "type": "direct",
  "region": "华北",
  "city": "北京",
  "address": "北京市海淀区xxx街道",
  "phone": "010-12345678",
  "managerId": "123",
  "businessHours": {
    "open": "08:00",
    "close": "20:00"
  },
  "services": ["取车", "还车", "保养", "清洁"]
}
```

---

## 8. 众筹管理API

### 8.1 获取众筹项目列表

```http
GET /api/v1/crowdfunding/projects?page=1&size=20&status=fundraising
Authorization: Bearer {accessToken}
```

### 8.2 创建众筹项目

```http
POST /api/v1/crowdfunding/projects
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "奥迪A6L众筹项目",
  "description": "筹款购买奥迪A6L车辆",
  "targetAmount": 300000,
  "sharePrice": 1000,
  "totalShares": 300,
  "expectedReturn": 12,
  "duration": 24
}
```

### 8.3 获取项目份额列表

```http
GET /api/v1/crowdfunding/projects/{projectId}/shares
Authorization: Bearer {accessToken}
```

---

## 9. 营销管理API

### 9.1 优惠券管理

#### 获取优惠券列表
```http
GET /api/v1/coupons?page=1&size=20&status=active&type=discount
Authorization: Bearer {accessToken}
```

#### 创建优惠券
```http
POST /api/v1/coupons
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新用户专享券",
  "type": "discount",
  "value": 100,
  "minAmount": 1000,
  "quantity": 1000,
  "validFrom": "2024-11-24T00:00:00+08:00",
  "validTo": "2024-12-31T23:59:59+08:00",
  "rules": {
    "userType": "new",
    "vehicleTypes": ["all"],
    "storeIds": ["all"]
  }
}
```

### 9.2 价格策略管理

#### 获取价格策略列表
```http
GET /api/v1/pricing/strategies?page=1&size=20
Authorization: Bearer {accessToken}
```

#### 创建价格策略
```http
POST /api/v1/pricing/strategies
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "周末特惠价",
  "type": "weekend",
  "discount": 0.8,
  "applicableVehicles": ["all"],
  "applicableStores": ["1", "2"],
  "validFrom": "2024-11-24T00:00:00+08:00",
  "validTo": "2024-12-31T23:59:59+08:00"
}
```

---

## 10. 财务管理API

### 10.1 获取收入统计

```http
GET /api/v1/finance/revenue?startDate=2024-11-01&endDate=2024-11-30&groupBy=day
Authorization: Bearer {accessToken}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "totalRevenue": 1500000,
      "orderRevenue": 1200000,
      "serviceRevenue": 300000,
      "growth": 15.5
    },
    "details": [
      {
        "date": "2024-11-24",
        "revenue": 50000,
        "orders": 25
      }
    ]
  }
}
```

### 10.2 获取分润记录

```http
GET /api/v1/finance/profit-distributions?page=1&size=20&type=crowdfunding
Authorization: Bearer {accessToken}
```

---

## 11. 数据分析API

### 11.1 获取工作台数据

```http
GET /api/v1/dashboard/stats
Authorization: Bearer {accessToken}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "overview": {
      "totalUsers": 10000,
      "totalVehicles": 500,
      "activeOrders": 150,
      "todayRevenue": 50000
    },
    "trends": {
      "userGrowth": [
        {"date": "2024-11-24", "count": 100}
      ],
      "revenueGrowth": [
        {"date": "2024-11-24", "amount": 50000}
      ]
    },
    "alerts": [
      {
        "type": "warning",
        "message": "有3个订单需要处理",
        "count": 3
      }
    ]
  }
}
```

### 11.2 获取业务报表

```http
GET /api/v1/reports/business?startDate=2024-11-01&endDate=2024-11-30&reportType=monthly
Authorization: Bearer {accessToken}
```

---

## 12. 系统管理API

### 12.1 系统配置

#### 获取系统配置
```http
GET /api/v1/system/configs
Authorization: Bearer {accessToken}
```

#### 更新系统配置
```http
PUT /api/v1/system/configs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "siteName": "叨叨房车管理系统",
  "logo": "https://example.com/logo.png",
  "contact": {
    "phone": "400-123-4567",
    "email": "service@daodao.com"
  },
  "features": {
    "crowdfunding": true,
    "cooperative": true
  }
}
```

### 12.2 操作日志

#### 获取操作日志
```http
GET /api/v1/system/operation-logs?page=1&size=20&userId=123&action=login
Authorization: Bearer {accessToken}
```

---

## 13. 文件上传API

### 13.1 上传图片

```http
POST /api/v1/upload/images
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [image file]
type: avatar|vehicle|store
```

**响应示例**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/images/2024/11/24/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### 13.2 上传文件

```http
POST /api/v1/upload/files
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [file]
type: document|contract
```

---

## 14. WebSocket实时通信

### 14.1 连接WebSocket

```javascript
const ws = new WebSocket(`ws://localhost:3000/ws?token=${accessToken}`)

ws.onopen = () => {
  console.log('WebSocket连接已建立')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  handleRealtimeMessage(data)
}
```

### 14.2 消息格式

**订单状态更新**:
```json
{
  "type": "order.status.changed",
  "data": {
    "orderId": "123",
    "oldStatus": "pending",
    "newStatus": "confirmed",
    "timestamp": "2024-11-24T10:00:00+08:00"
  }
}
```

**系统通知**:
```json
{
  "type": "system.notification",
  "data": {
    "title": "系统维护通知",
    "content": "系统将于今晚22:00进行维护",
    "level": "info",
    "timestamp": "2024-11-24T10:00:00+08:00"
  }
}
```

---

## 15. API安全规范

### 15.1 认证机制

- **Bearer Token认证**: 使用JWT Token进行身份验证
- **Token有效期**: 访问令牌15分钟，刷新令牌7天
- **Token刷新**: Token过期前自动刷新

### 15.2 权限控制

- **基于角色的权限控制(RBAC)**: 根据用户角色控制API访问
- **数据权限控制**: 根据用户数据权限范围过滤数据
- **操作权限验证**: 每个API接口验证操作权限

### 15.3 安全防护

- **请求频率限制**: 防止API滥用
- **参数验证**: 严格的输入参数验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出内容转义

---

## 16. API版本管理

### 16.1 版本策略

- **URL版本控制**: `/api/v1/`, `/api/v2/`
- **向后兼容**: 保持旧版本API可用性
- **废弃通知**: 提前通知API废弃计划

### 16.2 版本更新流程

1. 新版本API开发完成
2. 更新API文档
3. 发布版本更新通知
4. 客户端迁移适配
5. 旧版本API废弃

---

## 17. API监控和日志

### 17.1 监控指标

- **请求量**: API调用量统计
- **响应时间**: 平均响应时间和P99响应时间
- **错误率**: API错误率监控
- **并发数**: 同时在线用户数

### 17.2 日志记录

- **请求日志**: 记录所有API请求信息
- **错误日志**: 记录API错误详情
- **性能日志**: 记录慢查询和性能问题
- **审计日志**: 记录敏感操作记录

---

## 18. API测试规范

### 18.1 测试环境

- **开发环境**: `http://dev-api.daodao.com`
- **测试环境**: `http://test-api.daodao.com`
- **生产环境**: `https://api.daodao.com`

### 18.2 测试用例

每个API接口需要包含以下测试用例：
- 正常场景测试
- 参数验证测试
- 权限控制测试
- 错误处理测试
- 边界条件测试

### 18.3 测试工具

- **Postman**: API接口测试工具
- **Swagger**: API文档和测试
- **自动化测试**: Jest + Supertest

---

## 19. 最佳实践

### 19.1 API设计

1. **RESTful设计**: 遵循REST设计原则
2. **幂等性**: GET、PUT、DELETE操作保持幂等
3. **状态码规范**: 使用正确的HTTP状态码
4. **分页支持**: 列表接口支持分页查询

### 19.2 错误处理

1. **统一错误格式**: 所有错误返回统一格式
2. **详细错误信息**: 提供清晰的错误描述
3. **错误码规范**: 使用预定义的错误码
4. **国际化支持**: 错误信息支持多语言

### 19.3 性能优化

1. **数据缓存**: 缓存频繁查询的数据
2. **分页查询**: 大数据量使用分页
3. **字段选择**: 支持返回字段选择
4. **压缩传输**: 启用gzip压缩

---

## 20. 技术支持

### 20.1 文档资源

- **API文档**: 在线API文档平台
- **开发指南**: 详细开发说明
- **错误码手册**: 完整错误码列表
- **SDK工具**: 各语言SDK

### 20.2 联系方式

- **技术支持邮箱**: tech-support@daodao.com
- **问题反馈**: GitHub Issues
- **开发交流**: 技术交流群

---

**注意**: 所有API接口都需要在请求头中包含有效的访问令牌（Bearer Token）。在生产环境中，请使用HTTPS协议进行通信。