# 叨叨房车移动管理端API需求文档

> **文件版本**: v1.0
> **创建时间**: 2025-11-26
> **维护者**: 移动管理端开发团队
> **后端对接**: 必须严格按照后端@api-specification.md总规范实现

## 📋 文档说明

本文档记录移动管理端所需的所有API接口需求，作为前后端对接的契约文档。后端开发人员必须严格按照此文档和后端API总规范实现接口。

**特别注意**：
- **现有移动管理端API实现不符合规范**，需要完全重建
- **API路径缺少统一前缀**，现有实现需要删除
- **缺少移动端专用的离线同步机制**

---

## 📚 API开发状态说明

**开发状态标记**：
- `未开发` - API接口已定义，后端未开始开发
- `待后端开发` - 前端已完成接口定义，等待后端实现
- `已开发` - 后端API已实现，具备基础功能
- `待联调` - 前后端API均已完成，需要进行接口联调测试
- `联调成功` - API联调通过，功能正常，可投入使用
- `联调失败` - API联调发现问题，需要修复并重新联调

---

## 🎯 移动端特性要求

### 离线数据支持
- **关键数据缓存**: 支持���线查看订单、车辆状态
- **本地操作存储**: 离线操作本地存储，网络恢复后同步
- **增量数据同步**: 支持增量数据更新，减少流量消耗

### 现场操作优化
- **照片上传集成**: 支持现场拍照、图片压缩上传
- **GPS定位服务**: 车辆位置定位、电子围栏功能
- **扫码识别功能**: 二维码扫描识别车辆、订单信息
- **语音输入支持**: 减少手动输入，提升现场效率

---

## 🔐 权限控制要求

### 移动端角色权限
- **STORE_MANAGER**: 门店经理 - 本门店完整管理权限
- **STORE_STAFF**: 门店员工 - 分配任务的执行权限
- **SERVICE_STAFF**: 客服人员 - 查询和基础操作权限

### 移动端安全要求
- **设备绑定**: 支持设备绑定，限制登录设备数量
- **操作记录**: 记录所有移动端操作的详细日志
- **敏感操作二次确认**: 重要操作需要二次确认

---

## 1. 移动端认证模块 (mobile/auth)

### 1.1 移动端登录
**接口**: `POST /api/v1/mobile/auth/login`

**开发状态**: 待后端开发

**前端API位置**: `mobile-admin/api/auth.js:14` (需要重建)

**后端实现位置**: 待开发 - 需要删除现有错误实现

**联调结果**: 待测试

**请求参数**:
```json
{
  "phone": "string",
  "password": "string",
  "loginDevice": "Mobile Admin",
  "loginPlatform": "mobile_admin",
  "deviceId": "string", // 设备唯一标识
  "deviceInfo": {
    "model": "string",
    "os": "string",
    "appVersion": "string"
  }
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "mobile_jwt_token",
    "refreshToken": "mobile_refresh_token",
    "expiresIn": 900, // 15分钟
    "staff": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "role": "STORE_MANAGER",
      "storeId": "string",
      "storeName": "string",
      "permissions": ["order:read", "order:update", "vehicle:read"],
      "lastLoginAt": "2025-11-26T10:00:00+08:00"
    }
  }
}
```

### 1.2 设备管理
**接口**: `POST /api/v1/mobile/auth/device/bind`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "deviceId": "string",
  "deviceName": "string",
  "deviceType": "android/ios",
  "pushToken": "string" // 推送token
}
```

### 1.3 离线数据同步
**接口**: `POST /api/v1/mobile/sync/upload`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "syncData": {
    "orders": [
      {
        "orderId": "string",
        "action": "status_update",
        "data": {...},
        "timestamp": "2025-11-26T10:00:00+08:00",
        "deviceId": "string"
      }
    ],
    "vehicles": [
      {
        "vehicleId": "string",
        "action": "check_record",
        "data": {...},
        "timestamp": "2025-11-26T10:00:00+08:00"
      }
    ]
  }
}
```

---

## 2. 工作台模块 (mobile/dashboard)

### 2.1 工作台数据概览
**接口**: `GET /api/v1/mobile/dashboard/overview`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <mobile_token>`

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "todayStats": {
      "newOrders": 12,
      "activeOrders": 25,
      "completedOrders": 8,
      "revenue": 9600,
      "vehicleUtilization": 85
    },
    "urgentTasks": [
      {
        "id": "string",
        "type": "order",
        "title": "紧急订单处理",
        "description": "客户等待取车",
        "priority": "high",
        "createdAt": "2025-11-26T09:30:00+08:00"
      }
    ],
    "recentActivities": [
      {
        "type": "order_completed",
        "message": "订单DD202511260001已完成",
        "timestamp": "2025-11-26T10:00:00+08:00"
      }
    ],
    "quickActions": [
      {
        "id": "scan_vehicle",
        "name": "扫码验车",
        "icon": "scan",
        "action": "camera/scan"
      },
      {
        "id": "new_order",
        "name": "新建订单",
        "icon": "add",
        "action": "/orders/create"
      }
    ]
  }
}
```

### 2.2 待办任务管理
**接口**: `GET /api/v1/mobile/dashboard/tasks`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- status: string (可选) - 任务状态：pending/in_progress/completed
- priority: string (可选) - 优先级：high/medium/low
- page: number (可选) - 页码
- limit: number (可选) - 每页数量

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "type": "vehicle_check",
        "title": "车辆A12345检查",
        "description": "客户还车检查",
        "priority": "high",
        "status": "pending",
        "assignee": {
          "id": "string",
          "name": "张三"
        },
        "deadline": "2025-11-26T18:00:00+08:00",
        "createdAt": "2025-11-26T09:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## 3. 订单管理模块 (mobile/orders)

### 3.1 获取订单列表
**接口**: `GET /api/v1/mobile/orders`

**开发状态**: 待后端开发

**前端API位置**: `mobile-admin/api/order.js:18` (需要重建)

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求头**: `Authorization: Bearer <mobile_token>`

**查询参数**:
- status: string (可选) - 订单状态筛选
- priority: string (可选) - 紧急程度筛选
- dateRange: string (可选) - 日期范围筛选
- page: number (可选) - 页码
- limit: number (可选) - 每页数量

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "orderNo": "DD202511260001",
        "status": "confirmed",
        "priority": "normal",
        "urgencyLevel": "medium",
        "customer": {
          "id": "string",
          "name": "李四",
          "phone": "138****1234",
          "avatar": "string"
        },
        "vehicle": {
          "id": "string",
          "name": "豪华房车A型",
          "plateNumber": "京A12345",
          "images": ["string"]
        },
        "pickupInfo": {
          "storeName": "北京朝阳店",
          "dateTime": "2025-11-26T14:00:00+08:00",
          "address": "朝阳区xxx路xxx号"
        },
        "returnInfo": {
          "storeName": "北京朝阳店",
          "dateTime": "2025-11-28T18:00:00+08:00",
          "address": "朝阳区xxx路xxx号"
        },
        "totalAmount": 1740,
        "timeRemaining": 7200, // 秒
        "actions": ["confirm", "contact", "notes"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5
    }
  }
}
```

### 3.2 订单详情（移动端优化）
**接口**: `GET /api/v1/mobile/orders/{orderNo}`

**开发状态**: 待后端开发

**前端API位置**: `mobile-admin/api/order.js:27` (需要重建)

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderInfo": {
      "orderNo": "string",
      "status": "confirmed",
      "createdAt": "2025-11-26T10:00:00+08:00",
      "totalAmount": 1740
    },
    "customer": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "avatar": "string",
      "memberLevel": "PLUS",
      "orderHistory": 5
    },
    "vehicle": {
      "id": "string",
      "name": "string",
      "plateNumber": "string",
      "images": ["string"],
      "features": ["自动挡", "导航"],
      "lastMaintenance": "2025-10-15T00:00:00+08:00"
    },
    "checklist": {
      "pickup": [
        {
          "id": "fuel_level",
          "title": "油量检查",
          "type": "photo_required",
          "status": "pending",
          "photos": []
        },
        {
          "id": "exterior_damage",
          "title": "外观检查",
          "type": "photo_required",
          "status": "pending",
          "photos": []
        }
      ],
      "return": [
        {
          "id": "interior_cleanliness",
          "title": "内部清洁",
          "type": "checkbox",
          "status": "pending",
          "checked": false
        }
      ]
    },
    "timeline": [
      {
        "status": "confirmed",
        "timestamp": "2025-11-26T10:00:00+08:00",
        "operator": "系统",
        "notes": "订单已确认"
      }
    ],
    "quickActions": [
      {
        "action": "contact_customer",
        "label": "联系客户",
        "type": "phone"
      },
      {
        "action": "start_pickup_check",
        "label": "开始取车检查",
        "type": "camera"
      }
    ]
  }
}
```

### 3.3 订单状态更新
**接口**: `PUT /api/v1/mobile/orders/{orderNo}/status`

**开发状态**: 待后端开发

**前端API位置**: `mobile-admin/api/order.js:38` (需要重建)

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "action": "confirm_pickup", // confirm_pickup, confirm_return, complete, cancel
  "status": "vehicle_ready",
  "notes": "string",
  "photos": ["string"], // 现场照片URLs
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "address": "string"
  },
  "checklist": {
    "fuel_level": {
      "status": "completed",
      "value": 75,
      "photos": ["string"]
    }
  },
  "timestamp": "2025-11-26T10:00:00+08:00",
  "deviceId": "string"
}
```

### 3.4 现场照片上传
**接口**: `POST /api/v1/mobile/orders/{orderNo}/photos`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "photos": [
    {
      "type": "pickup_check", // pickup_check, return_check, damage
      "category": "exterior", // exterior, interior, fuel, documents
      "description": "车辆外观检查",
      "imageData": "base64_string", // 压缩后的base64图片
      "metadata": {
        "fileName": "string",
        "fileSize": 1024000,
        "resolution": "1920x1080",
        "timestamp": "2025-11-26T10:00:00+08:00",
        "location": {
          "latitude": 39.9042,
          "longitude": 116.4074
        }
      }
    }
  ]
}
```

---

## 4. 车辆管理模块 (mobile/vehicles)

### 4.1 获取车辆列表
**接口**: `GET /api/v1/mobile/vehicles`

**开发状态**: 待后端开发

**前端API位置**: `mobile-admin/api/vehicle.js` (需要重建)

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- status: string (可选) - 车辆状态筛选
- location: string (可选) - 位置筛选
- page: number (可选) - 页码
- limit: number (可选) - 每页数量

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "plateNumber": "京A12345",
        "name": "豪华房车A型",
        "status": "available",
        "location": {
          "storeName": "北京朝阳店",
          "parkingSpot": "A区15号",
          "lastUpdate": "2025-11-26T09:00:00+08:00",
          "gps": {
            "latitude": 39.9042,
            "longitude": 116.4074
          }
        },
        "health": {
          "fuelLevel": 85,
          "batteryLevel": 95,
          "mileage": 15420,
          "lastMaintenance": "2025-10-15T00:00:00+08:00"
        },
        "currentOrder": {
          "orderNo": "string",
          "customerName": "string",
          "pickupTime": "2025-11-26T14:00:00+08:00"
        },
        "qrCode": "string", // 扫码用的二维码数据
        "actions": ["locate", "check", "maintenance"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### 4.2 车辆详情
**接口**: `GET /api/v1/mobile/vehicles/{vehicleId}`

**开发状态**: 待后端开发

**前端API位置**: 需要重建

**后端实现位置**: 待开发

**联调结果**: 待测试

### 4.3 车辆检查记录
**接口**: `POST /api/v1/mobile/vehicles/{vehicleId}/check`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "checkType": "pickup", // pickup, return, maintenance
  "checklist": [
    {
      "item": "exterior_condition",
      "status": "good", // good, fair, poor, damage
      "notes": "车身右侧有轻微划痕",
      "photos": ["string"]
    },
    {
      "item": "interior_cleanliness",
      "status": "excellent",
      "notes": "内部清洁良好",
      "photos": ["string"]
    }
  ],
  "overallCondition": "good",
  "recommendations": ["建议补充洗车服务"],
  "inspector": {
    "id": "string",
    "name": "张三"
  },
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "address": "北京市朝阳区xxx路xxx号"
  },
  "timestamp": "2025-11-26T10:00:00+08:00",
  "deviceId": "string"
}
```

### 4.4 车辆定位更新
**接口**: `POST /api/v1/mobile/vehicles/{vehicleId}/location`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "accuracy": 10, // GPS精度（米）
    "address": "string"
  },
  "timestamp": "2025-11-26T10:00:00+08:00",
  "deviceId": "string"
}
```

---

## 5. 扫码识别模块 (mobile/scan)

### 5.1 扫码识别车辆
**接口**: `POST /api/v1/mobile/scan/vehicle`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "qrCode": "string", // 扫描结果
  "scanLocation": {
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "timestamp": "2025-11-26T10:00:00+08:00"
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "vehicle": {
      "id": "string",
      "plateNumber": "京A12345",
      "name": "豪华房车A型",
      "status": "available",
      "location": "A区15号"
    },
    "quickActions": [
      {
        "action": "start_check",
        "label": "开始检查",
        "type": "camera"
      },
      {
        "action": "view_orders",
        "label": "查看订单",
        "type": "navigate"
      }
    ]
  }
}
```

### 5.2 扫码识别订单
**接口**: `POST /api/v1/mobile/scan/order`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

---

## 6. 消息通知模块 (mobile/notifications)

### 6.1 获取消息列表
**接口**: `GET /api/v1/mobile/notifications`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "type": "order_reminder", // order_reminder, urgent_task, system_alert
        "priority": "high",
        "title": "取车提醒",
        "message": "客户李四即将到店取车",
        "data": {
          "orderNo": "DD202511260001",
          "customerName": "李四",
          "pickupTime": "2025-11-26T14:00:00+08:00"
        },
        "read": false,
        "timestamp": "2025-11-26T13:30:00+08:00",
        "actions": ["view_order", "contact_customer"]
      }
    ],
    "unreadCount": 5
  }
}
```

### 6.2 推送Token更新
**接口**: `PUT /api/v1/mobile/notifications/push-token`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "pushToken": "string",
  "platform": "ios/android"
}
```

---

## 7. 离线同步模块 (mobile/offline)

### 7.1 获取离线数据
**接口**: `GET /api/v1/mobile/offline/data`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**查询参数**:
- lastSyncTime: string (可选) - 上次同步时间
- dataTypes: string (可选) - 需要的数据类型

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orders": [
      {
        "orderNo": "string",
        "status": "confirmed",
        "customer": {...},
        "vehicle": {...},
        "lastModified": "2025-11-26T10:00:00+08:00"
      }
    ],
    "vehicles": [
      {
        "id": "string",
        "plateNumber": "string",
        "status": "available",
        "location": {...},
        "lastModified": "2025-11-26T09:00:00+08:00"
      }
    ],
    "syncTime": "2025-11-26T10:30:00+08:00"
  }
}
```

### 7.2 上传离线操作
**接口**: `POST /api/v1/mobile/offline/sync`

**开发状态**: 待后端开发

**前端API位置**: 需要新建

**后端实现位置**: 待开发

**联调结果**: 待测试

**请求参数**:
```json
{
  "operations": [
    {
      "id": "string",
      "type": "order_status_update",
      "entityId": "DD202511260001",
      "data": {
        "status": "vehicle_ready",
        "notes": "车辆已准备完毕"
      },
      "timestamp": "2025-11-26T10:00:00+08:00",
      "deviceId": "string"
    }
  ]
}
```

---

## 🔧 重要技术要求

### API路径规范
- **移动端专用前缀**: `/api/v1/mobile/{模块}/{资源}`
- **严格遵循**: 后端API总规范的所有要求
- **必须删除**: 现有移动端的错误路径实现

### 移动端特性要求
- **离线支持**: 关键数据的离线缓存和同步机制
- **照片处理**: 支持现场拍照、压缩、批量上传
- **位置服务**: GPS定位、地理围栏、位置历史记录
- **扫码识别**: QR码扫描、车辆信息快速识别
- **推送通知**: 本地推送、远程推送、离线消息处理

### 数据同步策略
- **实时同步**: 关键业务数据实时同步
- **延迟同步**: 非关键数据延迟同步，减少流量
- **增量更新**: 只同步变化的数据，提高效率
- **冲突处理**: 处理离线操作与在线操作的冲突

### 安全要求
- **设备绑定**: 限制登录设备数量，防止账号滥用
- **操作审计**: 记录所有移动端操作的详细日志
- **敏感操作**: 重要操作需要二次确认
- **数据保护**: 敏感数据在移动端的安全存储和传输

### 现有错误处理要求
- **必须删除**: `mobile-admin/api/` 目录下所有现有错误实现
- **必须重建**: 所有不符合规范的API接口
- **路径修复**: 统一添加 `/api/v1/mobile` 前缀
- **移动端特性**: 添加离线同步、拍照上传等移动端专用功能

---

**特别注意**:
- **现有移动端API实现完全错误**，必须全部删除重建
- **缺少移动端专用的离线同步机制**，需要重新设计
- **API路径不符合统一规范**，需要修复所有路径
- **缺少现场操作优化功能**，需要添加拍照、扫码等功能

**文档维护**:
- 每次API开发完成后，必须及时更新开发状态
- 联调过程中发现问题，必须记录在联调结果中
- 最终完成后，所有API状态都应为"联调成功"