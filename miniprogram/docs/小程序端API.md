# 叨叨房车小程序端API需求文档

> **文件版本**: v1.0
> **创建时间**: 2025-11-26
> **维护者**: 小程序端开发团队
> **后端对接**: 必须严格按照后端@api-specification.md总规范实现

## 📋 文档说明

本文档记录小程序端所需的所有API接口需求，作为前后端对接的契约文档。后端开发人员必须严格按照此文档和后端API总规范实现接口。

---

## 📚 API开发状态说明

**开发状态标记**：
- `未开发` - API接口已定义，后端未开始开发
- `待后端开发` - 前端已完成Mock开发，等待后端实现
- `已开发` - 后端API已实现，具备基础功能
- `待联调` - 前后端API均已完成，需要进行接口联调测试
- `联调成功` - API联调通过，功能正常，可投入使用
- `联调失败` - API联调发现问题，需要修复并重新联调

---

## 1. 用户认证模块 (auth)

### 1.1 发送验证码
**接口**: `POST /api/v1/auth/send-code`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:5`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- phone: string (必填) - 手机号
- type: string (可选) - 验证码类型：login/register/reset_password

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "codeId": "string",
    "expireIn": 300
  }
}
```

### 1.2 用户注册
**接口**: `POST /api/v1/auth/register`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:10`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- phone: string (必填) - 手机号
- code: string (必填) - 验证码
- password: string (可选) - 登录密码
- userInfo: object (可选) - 用户基本信息（昵称、头像等）

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "string",
      "phone": "string",
      "nickname": "string",
      "avatar": "string",
      "userType": "CUSTOMER"
    }
  }
}
```

### 1.3 用户登录
**接口**: `POST /api/v1/auth/login`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:15`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- phone: string (必填) - 手机号
- password: string (必填) - 登录密码

**响应格式**: 同注册接口

### 1.4 微信授权登录
**接口**: `POST /api/v1/auth/wechat-login`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:25`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- code: string (必填) - 微信授权码
- userInfo: object (可选) - 微信用户信息

**响应格式**: 同注册接口

### 1.5 刷新Token
**接口**: `POST /api/v1/auth/refresh-token`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:45`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- refreshToken: string (必填) - 刷新令牌

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### 1.6 获取用户信息
**接口**: `GET /api/v1/users/profile`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:55`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "phone": "string",
    "nickname": "string",
    "avatar": "string",
    "userType": "CUSTOMER",
    "memberLevel": "NORMAL",
    "walletBalance": 0,
    "integrals": 0,
    "profile": {
      "realName": "string",
      "idCard": "string",
      "driverLicense": "string"
    }
  }
}
```

---

## 2. 房车租赁模块 (vehicles)

### 2.1 查询可用房车
**接口**: `GET /api/v1/vehicles`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/vehicle.js:6`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- pickupCity: string (必填) - 取车城市
- pickupStoreId: string (必填) - 取车门店ID
- pickupDate: string (必填) - 取车时间 (ISO 8601)
- returnDate: string (必填) - 还车时间 (ISO 8601)
- returnCity: string (可选) - 还车城市
- returnStoreId: string (可选) - 还车门店ID
- page: number (可选) - 页码，默认1
- limit: number (可选) - 每页数量，默认20

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "year": "number",
        "seats": "number",
        "images": ["string"],
        "basePrice": 580,
        "store": {
          "id": "string",
          "name": "string",
          "address": "string",
          "distance": 5.2
        },
        "features": ["自动挡", "导航系统"],
        "available": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2.2 获取房车详情
**接口**: `GET /api/v1/vehicles/{id}`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/vehicle.js:24`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "brand": "string",
    "model": "string",
    "year": "number",
    "seats": "number",
    "sleepCapacity": "number",
    "images": ["string"],
    "gallery": ["string"],
    "basePrice": 580,
    "weeklyDiscount": 0.8,
    "monthlyDiscount": 0.7,
    "features": ["string"],
    "specifications": {
      "length": "7.5米",
      "width": "2.3米",
      "height": "3.2米",
      "fuelType": "汽油",
      "transmission": "自动挡",
      "mileage": 10000
    },
    "equipment": ["string"],
    "insurance": {
      "basic": 50,
      "standard": 80,
      "comprehensive": 120
    },
    "services": [
      {
        "id": "string",
        "name": "string",
        "price": 50,
        "description": "string"
      }
    ],
    "store": {
      "id": "string",
      "name": "string",
      "address": "string",
      "phone": "string",
      "businessHours": "string"
    },
    "rating": {
      "average": 4.8,
      "count": 156
    },
    "reviews": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "avatar": "string",
        "rating": 5,
        "content": "string",
        "images": ["string"],
        "createdAt": "2025-11-20T10:00:00+08:00"
      }
    ]
  }
}
```

### 2.3 收藏房车
**接口**: `POST /api/v1/vehicles/{id}/favorite`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/vehicle.js:44`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "code": 0,
  "message": "收藏成功",
  "data": {
    "favorited": true
  }
}
```

### 2.4 获取收藏列表
**接口**: `GET /api/v1/vehicles/favorites`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/vehicle.js:54`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
- page: number (可选) - 页码，默认1
- limit: number (可选) - 每页数量，默认20

**响应格式**: 类似车辆列表，但包含收藏时间。

---

## 3. 订单管理模块 (orders)

### 3.1 创建订单
**接口**: `POST /api/v1/orders`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/order.js:5`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "vehicleId": "string",
  "pickupStoreId": "string",
  "pickupDate": "2025-12-01T10:00:00+08:00",
  "returnStoreId": "string",
  "returnDate": "2025-12-03T18:00:00+08:00",
  "insuranceType": "standard",
  "selectedServices": ["string"],
  "couponCode": "string",
  "useWalletBalance": false,
  "contactInfo": {
    "name": "string",
    "phone": "string",
    "idCard": "string",
    "driverLicense": "string"
  }
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "orderId": "string",
    "orderNo": "DD202511260001",
    "status": "PENDING_PAYMENT",
    "amount": {
      "vehicleFee": 1160,
      "insuranceFee": 160,
      "serviceFee": 100,
      "discount": 100,
      "totalAmount": 1320
    },
    "expireTime": "2025-11-26T10:15:00+08:00"
  }
}
```

### 3.2 计算订单价格
**接口**: `POST /api/v1/orders/calculate-price`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/order.js:25`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**: 与创建订单相同的参数，但不实际创建订单。

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "vehicleFee": 1160,
    "insuranceFee": 160,
    "serviceFee": 100,
    "discount": 100,
    "totalAmount": 1320,
    "breakdown": [
      {
        "name": "基础租金",
        "amount": 1160,
        "description": "2天 x 580元/天"
      }
    ]
  }
}
```

### 3.3 获取用户订单列表
**接口**: `GET /api/v1/orders`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/order.js:10`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
- status: string (可选) - 订单状态筛选
- page: number (可选) - 页码，默认1
- limit: number (可选) - 每页数量，默认20

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "orderId": "string",
        "orderNo": "string",
        "status": "PENDING_PAYMENT",
        "vehicle": {
          "id": "string",
          "name": "string",
          "image": "string"
        },
        "pickupInfo": {
          "storeName": "string",
          "date": "2025-12-01T10:00:00+08:00"
        },
        "returnInfo": {
          "storeName": "string",
          "date": "2025-12-03T18:00:00+08:00"
        },
        "totalAmount": 1320,
        "createdAt": "2025-11-26T10:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 3.4 获取订单详情
**接口**: `GET /api/v1/orders/{orderId}`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/order.js:15`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <token>`

**响应格式**: 包含订单的完整信息，包括车辆信息、价格明细、状态日志等。

### 3.5 取消订单
**接口**: `POST /api/v1/orders/{orderId}/cancel`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/order.js:20`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
- reason: string (必填) - 取消原因

---

## 4. 支付模块 (payments)

### 4.1 创建支付订单
**接口**: `POST /api/v1/payments`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/payment.js:10`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "orderId": "string",
  "paymentMethod": "wechat",
  "amount": 1320,
  "splitPayment": [
    {
      "method": "wallet",
      "amount": 320
    },
    {
      "method": "wechat",
      "amount": 1000
    }
  ]
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "paymentNo": "string",
    "paymentParams": {
      "appId": "string",
      "timeStamp": "string",
      "nonceStr": "string",
      "package": "string",
      "signType": "MD5",
      "paySign": "string"
    }
  }
}
```

### 4.2 查询支付状态
**接口**: `GET /api/v1/payments/{paymentNo}/status`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/payment.js:15`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "SUCCESS",
    "paidAt": "2025-11-26T10:05:00+08:00",
    "amount": 1320,
    "method": "wechat"
  }
}
```

---

## 5. 众筹模块 (crowdfunding)

### 5.1 获取众筹项目列表
**接口**: `GET /api/v1/crowdfunding/projects`

**开发状态**: 待后端开发

**前端Mock位置**: 需要重建 - 删除现有错误实现

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- status: string (可选) - 项目状态：active/completed/failed
- riskLevel: string (可选) - 风险等级：low/medium/high
- page: number (可选) - 页码，默认1
- limit: number (可选) - 每页数量，默认20

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "image": "string",
        "targetAmount": 1000000,
        "raisedAmount": 800000,
        "progress": 80,
        "returnRate": "8-12",
        "riskLevel": "high",
        "status": "active",
        "daysLeft": 15,
        "minInvestment": 10000,
        "maxInvestment": 1000000,
        "investors": 156,
        "createdAt": "2025-11-01T00:00:00+08:00",
        "endTime": "2025-12-20T23:59:59+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### 5.2 获取众筹项目详情
**接口**: `GET /api/v1/crowdfunding/projects/{id}`

**开发状态**: 待后端开发

**前端Mock位置**: 需要重建 - 删除现有错误实现

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**: 包含项目的完整信息，包括车辆详情、风险说明、投资协议等。

### 5.3 购买众筹份额
**接口**: `POST /api/v1/crowdfunding/orders`

**开发状态**: 待后端开发

**前端Mock位置**: 需要重建 - 删除现有错误实现

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "projectId": "string",
  "amount": 50000,
  "shares": 5,
  "agreeTerms": true
}
```

### 5.4 获取交易市场行情
**接口**: `GET /api/v1/crowdfunding/market`

**开发状态**: 待后端开发

**前端Mock位置**: 需要重建 - 删除现有错误实现

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "currentPrice": 125.80,
    "changePercent": 2.3,
    "changeAmount": 2.82,
    "volume": 1250,
    "turnover": 157250,
    "highestPrice": 128.50,
    "lowestPrice": 123.20,
    "marketStatus": "open",
    "userInfo": {
      "holdings": 50,
      "todayProfit": 128.50,
      "totalProfit": 1258.30
    }
  }
}
```

---

## 6. 优惠券模块 (coupons)

### 6.1 获取可用优惠券
**接口**: `GET /api/v1/coupons/available`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/coupon.js:12`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- orderAmount: number (必填) - 订单金额
- vehicleId: string (可选) - 车辆ID
- category: string (可选) - 车辆分类

### 6.2 领取优惠券
**接口**: `POST /api/v1/coupons/{id}/claim`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/coupon.js:33`

**后端实现位置**: 待开发

**联调结果**: 待测试

---

## 7. 门店模块 (stores)

### 7.1 获取城市列表
**接口**: `GET /api/v1/stores/cities`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/store.js`

**后端实现位置**: 待开发

**联调结果**: 待测试

### 7.2 获取门店列表
**接口**: `GET /api/v1/stores`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/store.js`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- cityId: string (必填) - 城市ID

---

## 8. 用户中心模块

### 8.1 更新用户资料
**接口**: `PUT /api/v1/users/profile`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/auth.js:60`

**后端实现位置**: 待开发

**联调结果**: 待测试

### 8.2 获取用户钱包余额
**接口**: `GET /api/v1/users/wallet`

**开发状态**: 待后端开发

**前端Mock位置**: `miniprogram/api/payment.js:55`

**后端实现位置**: 待开发

**联调结果**: 待测试

### 8.3 获取用户众筹资产
**接口**: `GET /api/v1/users/crowdfunding/assets`

**开发状态**: 待后端开发

**前端Mock位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

---

## 🔧 重要技术要求

### API路径规范
- **所有接口必须使用**: `/api/v1/{模块}/{资源}` 格式
- **禁止使用**: 硬编码域名或自定义路径
- **RESTful设计**: 严格遵循GET、POST、PUT、DELETE语义

### 认证机制
- **统一认证**: 使用JWT Bearer Token
- **Token刷新**: Access Token 15分钟，Refresh Token 7天
- **权限控制**: 基于用户类型的API访问控制

### 响应格式
- **统一格式**: 必须符合后端API总规范
- **错误处理**: 统一错误码和错误消息
- **分页格式**: 标准分页响应结构

### 联调流程
1. **前端Mock完成** - 标记状态为"待后端开发"
2. **后端API实现** - 标记状态为"已开发"
3. **前后端联调** - 标记状态为"待联调"
4. **联调测试通过** - 标记状态为"联调成功"
5. **问题修复** - 标记状态为"联调失败"并重新联调

---

**特别注意**:
- **必须删除现有错误的众筹API实现** (`miniprogram/api/crowdfunding.js`)
- **必须按照后端总规范重新实现**所有API接口
- **严禁直接返回Mock数据**，必须连接真实后端服务
- **所有API调用必须通过统一request工具**，包含认证和错误处理

**文档维护**:
- 每次API开发完成后，必须及时更新开发状态
- 联调过程中发现问题，必须记录在联调结果中
- 最终完成后，所有API状态都应为"联调成功"