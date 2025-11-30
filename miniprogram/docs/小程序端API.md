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

## 4. 特惠租车模块 (special-offers)

### 4.1 获取特惠套餐列表
**接口**: `GET /api/v1/special-offers`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/special-offer/list.vue:236`

**前端API位置**: `miniprogram/api/special-offer.ts:13`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- route: string (可选) - 路线筛选（如：hangzhou, shanghai）
- priceRange: string (可选) - 价格区间（如：0-1000, 1000-1500）
- sortBy: string (可选) - 排序方式（price-asc, price-desc, quota）
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
        "route": {
          "from": "杭州",
          "to": "千岛湖"
        },
        "vehicle": {
          "name": "依维柯欧胜C型房车",
          "image": "string",
          "features": ["自动挡", "4-6人", "独立卫浴"]
        },
        "packagePrice": 1280,
        "originalPrice": 1680,
        "rentalDays": 3,
        "availableTimeRange": {
          "start": "2025-12-01",
          "end": "2025-12-31"
        },
        "remainingQuota": 3,
        "totalQuota": 10
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

### 4.2 获取特惠套餐详情
**接口**: `GET /api/v1/special-offers/{id}`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/special-offer/detail.vue:95`

**前端API位置**: `miniprogram/api/special-offer.ts:34`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "route": {
      "from": "杭州",
      "to": "千岛湖"
    },
    "vehicle": {
      "name": "依维柯欧胜C型房车",
      "images": ["string"],
      "specifications": [
        { "label": "车型", "value": "C型房车" },
        { "label": "座位数", "value": "4-6座" }
      ],
      "features": ["独立卫浴", "太阳能系统"]
    },
    "packagePrice": 1280,
    "originalPrice": 1680,
    "rentalDays": 3,
    "remainingQuota": 3,
    "totalQuota": 10,
    "pickupStore": {
      "name": "杭州西湖门店",
      "address": "浙江省杭州市西湖区文三路123号"
    },
    "returnStore": {
      "name": "千岛湖景区门店",
      "address": "浙江省杭州市淳安县千岛湖镇环湖路88号"
    },
    "availableTimeRange": {
      "start": "2025-12-01",
      "end": "2025-12-31"
    },
    "packageIncludes": [
      { "name": "车辆租金", "description": "3天2晚固定租期" },
      { "name": "基础保险", "description": "第三者责任险" }
    ],
    "bookingNotices": ["string"],
    "cancellationPolicy": [
      { "condition": "出发前7天以上取消", "result": "全额退款" }
    ]
  }
}
```

### 4.3 创建特惠套餐订单
**接口**: `POST /api/v1/special-offers/orders`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/special-offer.ts:47`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "offerId": "string",
  "pickupDate": "2025-12-05T10:00:00+08:00",
  "insuranceType": "standard",
  "selectedServices": ["string"],
  "couponCode": "string",
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
    "orderNo": "DD202512050001",
    "status": "PENDING_PAYMENT",
    "amount": {
      "packageFee": 1280,
      "insuranceFee": 80,
      "serviceFee": 50,
      "discount": 100,
      "totalAmount": 1310
    },
    "returnTime": "2025-12-08T10:00:00+08:00",
    "expireTime": "2025-12-05T10:15:00+08:00"
  }
}
```

### 4.4 计算特惠套餐价格
**接口**: `POST /api/v1/special-offers/calculate-price`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/special-offer.ts:71`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**: 与创建订单相同的参数，但不实际创建订单。

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "packageFee": 1280,
    "insuranceFee": 80,
    "serviceFee": 50,
    "discount": 100,
    "totalAmount": 1310,
    "breakdown": [
      {
        "name": "套餐费用",
        "amount": 1280,
        "description": "杭州→千岛湖 3天2晚"
      },
      {
        "name": "保险费用",
        "amount": 80,
        "description": "标准险"
      }
    ]
  }
}
```

### 4.5 检查套餐可用性
**接口**: `GET /api/v1/special-offers/{id}/availability`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/special-offer.ts:87`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- pickupDate: string (必填) - 取车日期

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "available": true,
    "remainingQuota": 3,
    "message": "该日期可预订"
  }
}
```

---

## 5. 营地预订模块 (campsites)

### 5.1 获取营地列表
**接口**: `GET /api/v1/campsites`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/campsite/list.vue:167`

**前端API位置**: `miniprogram/api/campsite.ts:95`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- page: number (可选) - 页码，默认1
- pageSize: number (可选) - 每页数量，默认20
- distance: string (可选) - 距离筛选（如：0-5, 5-10, 10-20, 20-）
- price: string (可选) - 价格筛选（如：0-200, 200-300, 300-400, 400-）
- type: string (可选) - 类型筛选（lake, mountain, sea, forest）
- keyword: string (可选) - 搜索关键词
- latitude: number (可选) - 用户纬度
- longitude: number (可选) - 用户经度

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "name": "千岛湖房车营地",
        "image": "string",
        "images": ["string"],
        "tags": ["湖景", "烧烤", "WiFi"],
        "rating": 4.8,
        "reviewCount": 156,
        "distance": 5.2,
        "price": 280,
        "availableSites": 8,
        "isHot": true,
        "address": "浙江省杭州市淳安县千岛湖镇环湖路88号"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 5.2 获取营地详情
**接口**: `GET /api/v1/campsites/{id}`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/campsite/detail.vue:236`

**前端API位置**: `miniprogram/api/campsite.ts:108`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "name": "千岛湖房车营地",
    "images": ["string"],
    "rating": 4.8,
    "reviewCount": 156,
    "address": "浙江省杭州市淳安县千岛湖镇环湖路88号",
    "distance": 5.2,
    "minPrice": 280,
    "isHot": true,
    "features": ["湖景", "烧烤区", "WiFi覆盖", "24小时热水"],
    "facilities": [
      {
        "name": "淋浴间",
        "icon": "fire"
      },
      {
        "name": "卫生间",
        "icon": "home"
      }
    ],
    "siteTypes": [
      {
        "id": "string",
        "name": "标准营位",
        "description": "适合小型房车或帐篷，配备基础设施",
        "area": 50,
        "capacity": 4,
        "price": 280,
        "available": 8
      }
    ],
    "description": "营地详细介绍...",
    "checkInNotices": ["入住时间：14:00后，退房时间：12:00前"],
    "cancellationPolicy": [
      {
        "condition": "入住前3天以上取消",
        "result": "全额退款"
      }
    ],
    "reviews": [
      {
        "id": "string",
        "userName": "房车旅行家",
        "userAvatar": "string",
        "rating": 5,
        "content": "营地环境非常好...",
        "images": ["string"],
        "createdAt": "2025-11-25"
      }
    ]
  }
}
```

### 5.3 创建营地预订订单
**接口**: `POST /api/v1/campsites/bookings`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/campsite/booking.vue:329`

**前端API位置**: `miniprogram/api/campsite.ts:121`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "campsiteId": "string",
  "siteTypeId": "string",
  "checkInDate": "2025-12-05",
  "checkOutDate": "2025-12-07",
  "guests": 2,
  "contactName": "张三",
  "contactPhone": "13800138000",
  "remark": "需要靠近湖边的位置"
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "预订成功",
  "data": {
    "orderId": "string",
    "orderNo": "CS202512050001",
    "status": "PENDING_PAYMENT",
    "totalPrice": 610,
    "paymentDeadline": "2025-12-05T10:15:00+08:00"
  }
}
```

### 5.4 计算营地预订价格
**接口**: `POST /api/v1/campsites/calculate-price`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/campsite.ts:135`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "campsiteId": "string",
  "siteTypeId": "string",
  "checkInDate": "2025-12-05",
  "checkOutDate": "2025-12-07",
  "guests": 2
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "siteFee": 560,
    "cleaningFee": 50,
    "serviceFee": 0,
    "totalPrice": 610,
    "nights": 2
  }
}
```

### 5.5 检查营位可用性
**接口**: `POST /api/v1/campsites/check-availability`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/campsite.ts:149`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "campsiteId": "string",
  "siteTypeId": "string",
  "checkInDate": "2025-12-05",
  "checkOutDate": "2025-12-07"
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "available": true,
    "remainingCount": 8,
    "message": "该时间段可预订"
  }
}
```

### 5.6 获取营地评价列表
**接口**: `GET /api/v1/campsites/{id}/reviews`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/campsite.ts:163`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- page: number (可选) - 页码，默认1
- pageSize: number (可选) - 每页数量，默认10

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "userName": "房车旅行家",
        "userAvatar": "string",
        "rating": 5,
        "content": "营地环境非常好...",
        "images": ["string"],
        "createdAt": "2025-11-25"
      }
    ],
    "total": 156,
    "hasMore": true
  }
}
```

### 5.7 获取附近营地
**接口**: `GET /api/v1/campsites/nearby`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/campsite.ts:179`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- latitude: number (必填) - 纬度
- longitude: number (必填) - 经度
- radius: number (可选) - 半径（公里），默认50
- limit: number (可选) - 返回数量，默认10

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "name": "千岛湖房车营地",
      "image": "string",
      "rating": 4.8,
      "reviewCount": 156,
      "distance": 5.2,
      "price": 280,
      "availableSites": 8,
      "isHot": true
    }
  ]
}
```

### 5.8 获取热门营地
**接口**: `GET /api/v1/campsites/hot`

**开发状态**: 🔴 未开发

**前端API位置**: `miniprogram/api/campsite.ts:195`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- limit: number (可选) - 返回数量，默认10

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "name": "千岛湖房车营地",
      "image": "string",
      "rating": 4.8,
      "reviewCount": 156,
      "distance": 5.2,
      "price": 280,
      "availableSites": 8,
      "isHot": true
    }
  ]
}
```

---

## 6. 房车旅游模块 (tours)

### 6.1 获取旅游线路列表
**接口**: `GET /api/v1/tours`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/tour/list.vue:157`

**前端API位置**: `miniprogram/api/tour.ts:95`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- page: number (可选) - 页码，默认1
- pageSize: number (可选) - 每页数量，默认20
- duration: string (可选) - 行程天数筛选（如：3-5, 6-8, 9-）
- price: string (可选) - 价格筛选（如：0-3000, 3000-5000, 5000-7000, 7000-）
- status: string (可选) - 状态筛选（recruiting, confirmed, departed）
- keyword: string (可选) - 搜索关键词

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "title": "川西秘境·稻城亚丁房车深度游",
        "image": "string",
        "tags": ["高原风光", "摄影天堂", "藏族文化"],
        "days": 7,
        "minPeople": 5,
        "maxPeople": 12,
        "currentPeople": 8,
        "price": 4980,
        "childPrice": 2490,
        "status": "recruiting",
        "isHot": true,
        "available": 4
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 6.2 获取旅游线路详情
**接口**: `GET /api/v1/tours/{id}`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/tour/detail.vue:236`

**前端API位置**: `miniprogram/api/tour.ts:109`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "川西秘境·稻城亚丁房车深度游",
    "images": ["string"],
    "tags": ["高原风光", "摄影天堂", "藏族文化"],
    "duration": 7,
    "minPeople": 5,
    "maxPeople": 12,
    "destination": "四川·稻城亚丁",
    "pricePerPerson": 4980,
    "childPrice": 2490,
    "isHot": true,
    "batches": [
      {
        "id": "string",
        "departureDate": "2025-12-15",
        "status": "recruiting",
        "currentPeople": 8,
        "maxPeople": 12
      }
    ],
    "itinerary": [
      {
        "title": "成都集合",
        "content": "全天成都集合，入住酒店...",
        "highlights": ["成都美食", "自由活动"]
      }
    ],
    "priceIncludes": ["全程房车使用费", "6晚住宿"],
    "priceExcludes": ["往返成都大交通", "午餐和晚餐"],
    "bookingNotices": ["本线路为成团产品..."],
    "cancellationPolicy": [
      {
        "condition": "出发前7天以上取消",
        "result": "全额退款"
      }
    ]
  }
}
```

### 6.3 创建旅游预订订单
**接口**: `POST /api/v1/tours/bookings`

**开发状态**: 🟡 已开发（前端Mock完成）

**前端Mock位置**: `miniprogram/pages/tour/booking.vue:329`

**前端API位置**: `miniprogram/api/tour.ts:122`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "tourId": "string",
  "batchId": "string",
  "adults": 2,
  "children": 1,
  "contactName": "张三",
  "contactPhone": "13800138000",
  "idCard": "330106199001011234",
  "emergencyContact": "李四",
  "emergencyPhone": "13900139000",
  "remark": "有高原反应史，需要特别关注"
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "预订成功",
  "data": {
    "orderId": "string",
    "orderNo": "TR202512050001",
    "status": "PENDING_PAYMENT",
    "totalPrice": 12450,
    "paymentDeadline": "2025-12-05T10:15:00+08:00"
  }
}
```

### 6.4 计算旅游预订价格
**接口**: `POST /api/v1/tours/calculate-price`

**开发状态**: 🟡 已开发（前端API完成）

**前端API位置**: `miniprogram/api/tour.ts:136`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "tourId": "string",
  "batchId": "string",
  "adults": 2,
  "children": 1
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "adultFee": 9960,
    "childFee": 2490,
    "insuranceFee": 150,
    "totalPrice": 12600,
    "breakdown": [
      {
        "name": "成人费用",
        "amount": 9960,
        "description": "¥4980 × 2人"
      },
      {
        "name": "儿童费用",
        "amount": 2490,
        "description": "¥2490 × 1人"
      },
      {
        "name": "保险费用",
        "amount": 150,
        "description": "¥50 × 3人"
      }
    ]
  }
}
```

### 6.5 检查批次可用性
**接口**: `POST /api/v1/tours/check-availability`

**开发状态**: 🟡 已开发（前端API完成）

**前端API位置**: `miniprogram/api/tour.ts:150`

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "tourId": "string",
  "batchId": "string",
  "people": 3
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "available": true,
    "remainingSeats": 4,
    "message": "该批次还有4个名额"
  }
}
```

### 6.6 获取热门旅游线路
**接口**: `GET /api/v1/tours/hot`

**开发状态**: 🟡 已开发（前端API完成）

**前端API位置**: `miniprogram/api/tour.ts:164`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- limit: number (可选) - 返回数量，默认10

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "title": "川西秘境·稻城亚丁房车深度游",
      "image": "string",
      "tags": ["高原风光", "摄影天堂"],
      "days": 7,
      "price": 4980,
      "status": "recruiting",
      "isHot": true
    }
  ]
}
```

### 6.7 获取推荐旅游线路
**接口**: `GET /api/v1/tours/recommended`

**开发状态**: 🟡 已开发（前端API完成）

**前端API位置**: `miniprogram/api/tour.ts:178`

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- limit: number (可选) - 返回数量，默认10

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "title": "云南秘境·香格里拉梅里雪山行",
      "image": "string",
      "tags": ["雪山风光", "藏区文化"],
      "days": 6,
      "price": 4280,
      "status": "recruiting"
    }
  ]
}
```

### 6.8 获取批次列表
**接口**: `GET /api/v1/tours/{id}/batches`

**开发状态**: 🟡 已开发（前端API完成）

**前端API位置**: `miniprogram/api/tour.ts:192`

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "string",
      "departureDate": "2025-12-15",
      "status": "recruiting",
      "currentPeople": 8,
      "maxPeople": 12
    }
  ]
}
```

---

## 7. 支付模块 (payments)

### 7.1 创建支付订单
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