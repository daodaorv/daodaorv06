# 叨叨房车管理端API文档

**文档版本**: v2.0.0 | **创建时间**: 2025-11-28 | **维护者**: 后端开发团队

**文档类型**: API接口文档 | **适用范围**: 管理端前端开发、后端API开发

---

## 📋 文档说明

本文档为叨叨房车管理端的完整API接口文档，涵盖所有25个功能模块的接口定义。所有接口均处于**待开发**状态，需要根据产品需求文档进行完整实现。

**架构说明**: 基于前后端分离架构，管理端前端通过HTTP接口调用后端API服务，所有接口需要管理员权限验证。

---

## 📋 目录

1. [API基础规范](#1-api基础规范)
2. [管理端权限角色](#2-管理端权限角色)
3. [认证授权接口](#3-认证授权接口)
4. [核心业务接口](#4-核心业务接口)
5. [营销运营接口](#5-营销运营接口)
6. [系统管理接口](#6-系统管理接口)
7. [数据分析接口](#7-数据分析接口)
8. [错误码说明](#8-错误码说明)

---

## 1. API基础规范

### 1.1 基础配置

**基础URL**: `/api/v1/admin/{模块}/{资源}`
**版本控制**: `/api/v1/`
**接口前缀**: `admin`
**权限验证**: 所有接口需要JWT Token
**响应格式**: 统一JSON格式
**状态码**: 遵循HTTP标准状态码

### 1.2 通用请求头

```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
X-Request-ID: <request_id>
```

### 1.3 统一响应格式

**成功响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": "2025-11-28T10:00:00+08:00"
}
```

**分页响应**:
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
      "totalPages": 5
    }
  }
}
```

**错误响应**:
```json
{
  "code": 40001,
  "message": "参数验证失败",
  "error": "参数错误详情",
  "timestamp": "2025-11-28T10:00:00+08:00"
}
```

---

## 2. 管理端权限角色

### 2.1 角色类型

- **SYSTEM_ADMIN**: 系统管理员 - 拥有所有权限的管理员
- **REGION_MANAGER**: 区域经理 - 管理指定区域的管理员
- **STORE_MANAGER**: 门店经理 - 管理指定门店的管理员
- **STORE_STAFF**: 门店员工 - 门店操作人员

### 2.2 权限控制说明

- **所有接口需要JWT Token认证**
- **需要管理员角色验证**
- **需要相应的资源权限**
- **数据权限基于角色自动过滤**

---

## 3. 认证授权接口

### 3.1 管理员认证

#### 3.1.1 管理员登录
**接口**: `POST /api/v1/admin/auth/login`
**权限**: 无需认证
**状态**: 待开发

**请求参数**:
```json
{
  "phone": "string",
  "password": "string",
  "loginType": "password",
  "platform": "web"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "admin_jwt_token",
    "refreshToken": "admin_refresh_token",
    "admin": {
      "id": "string",
      "phone": "string",
      "nickname": "string",
      "avatar": "string",
      "role": "SYSTEM_ADMIN",
      "permissions": ["user:read", "user:write"],
      "storeId": "string",
      "regionId": "string"
    }
  }
}
```

#### 3.1.2 获取当前管理员信息
**接口**: `GET /api/v1/admin/auth/current-user`
**权限**: 需要认证
**状态**: 待开发

#### 3.1.3 管理员登出
**接口**: `POST /api/v1/admin/auth/logout`
**权限**: 需要认证
**状态**: 待开发

#### 3.1.4 刷新Token
**接口**: `POST /api/v1/admin/auth/refresh-token`
**权限**: 需要认证
**状态**: 待开发

---

## 4. 核心业务接口

### 4.1 用户管理

#### 4.1.1 获取用户列表
**接口**: `GET /api/v1/admin/users`
**权限**: user:read
**状态**: 待开发

**查询参数**:
- page: number - 页码
- limit: number - 每页数量
- keyword: string - 搜索关键词
- userType: string - 用户类型
- memberLevel: string - 会员等级
- status: string - 用户状态
- registrationDate: string - 注册日期范围

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "phone": "string",
        "nickname": "string",
        "avatar": "string",
        "userType": "CUSTOMER",
        "memberLevel": "PLUS",
        "registrationDate": "2025-11-01T10:00:00+08:00",
        "lastLoginAt": "2025-11-26T09:00:00+08:00",
        "orderCount": 5,
        "totalSpent": 5800,
        "status": "active",
        "creditScore": 750,
        "tags": ["VIP用户", "老用户"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    }
  }
}
```

#### 4.1.2 获取用户详情
**接口**: `GET /api/v1/admin/users/{userId}`
**权限**: user:read
**状态**: 待开发

#### 4.1.3 更新用户状态
**接口**: `PUT /api/v1/admin/users/{userId}/status`
**权限**: user:write
**状态**: 待开发

#### 4.1.4 用户标签管理
**接口**: `POST /api/v1/admin/users/{userId}/tags`
**权限**: user:write
**状态**: 待开发

#### 4.1.5 拉黑管理
**接口**: `POST /api/v1/admin/users/{userId}/blacklist`
**权限**: user:write
**状态**: 待开发

#### 4.1.6 用户数据导出
**接口**: `GET /api/v1/admin/users/export`
**权限**: user:export
**状态**: 待开发

### 4.2 车辆管理

#### 4.2.1 车型库管理

##### 获取车型列表
**接口**: `GET /api/v1/admin/vehicle-models`
**权限**: vehicle:read
**状态**: 待开发

##### 创建车型
**接口**: `POST /api/v1/admin/vehicle-models`
**权限**: vehicle:write
**状态**: 待开发

##### 更新车型
**接口**: `PUT /api/v1/admin/vehicle-models/{modelId}`
**权限**: vehicle:write
**状态**: 待开发

#### 4.2.2 车辆列表管理

##### 获取车辆列表
**接口**: `GET /api/v1/admin/vehicles`
**权限**: vehicle:read
**状态**: 待开发

**查询参数**:
- page: number - 页码
- limit: number - 每页数量
- keyword: string - 搜索关键词
- storeId: string - 门店ID
- status: string - 车辆状态
- vehicleType: string - 车辆类型 (crowdfunding, cooperative)
- brand: string - 品牌
- model: string - 型号

##### 创建车辆
**接口**: `POST /api/v1/admin/vehicles`
**权限**: vehicle:write
**状态**: 待开发

##### 获取车辆详情
**接口**: `GET /api/v1/admin/vehicles/{vehicleId}`
**权限**: vehicle:read
**状态**: 待开发

##### 更新车辆信息
**接口**: `PUT /api/v1/admin/vehicles/{vehicleId}`
**权限**: vehicle:write
**状态**: 待开发

#### 4.2.3 车辆状态管理

##### 更新车辆状态
**接口**: `PUT /api/v1/admin/vehicles/{vehicleId}/status`
**权限**: vehicle:write
**状态**: 待开发

**请求参数**:
```json
{
  "status": "maintenance",
  "reason": "string",
  "estimatedTime": "2025-11-30T00:00:00+08:00"
}
```

##### 车辆状态时间线
**接口**: `GET /api/v1/admin/vehicles/{vehicleId}/status-history`
**权限**: vehicle:read
**状态**: 待开发

#### 4.2.4 维保管理

##### 获取维保记录
**接口**: `GET /api/v1/admin/vehicles/{vehicleId}/maintenance`
**权限**: vehicle:read
**状态**: 待开发

##### 创建维保记录
**接口**: `POST /api/v1/admin/vehicles/{vehicleId}/maintenance`
**权限**: vehicle:write
**状态**: 待开发

##### 维保提醒列表
**接口**: `GET /api/v1/admin/maintenance/reminders`
**权限**: vehicle:read
**状态**: 待开发

#### 4.2.5 保险管理

##### 获取保险记录
**接口**: `GET /api/v1/admin/vehicles/{vehicleId}/insurance`
**权限**: vehicle:read
**状态**: 待开发

##### 创建保险记录
**接口**: `POST /api/v1/admin/vehicles/{vehicleId}/insurance`
**权限**: vehicle:write
**状态**: 待开发

##### 保险到期提醒
**接口**: `GET /api/v1/admin/insurance/expiring`
**权限**: vehicle:read
**状态**: 待开发

#### 4.2.6 违章管理

##### 获取违章记录
**接口**: `GET /api/v1/admin/vehicles/{vehicleId}/violations`
**权限**: vehicle:read
**状态**: 待开发

##### 创建违章记录
**接口**: `POST /api/v1/admin/vehicles/{vehicleId}/violations`
**权限**: vehicle:write
**状态**: 待开发

##### 违章处理
**接口**: `PUT /api/v1/admin/vehicles/{vehicleId}/violations/{violationId}/status`
**权限**: vehicle:write
**状态**: 待开发

### 4.3 门店管理

#### 4.3.1 门店基础管理

##### 获取门店列表
**接口**: `GET /api/v1/admin/stores`
**权限**: store:read
**状态**: 待开发

**查询参数**:
- page: number - 页码
- limit: number - 每页数量
- cityId: string - 城市ID
- regionId: string - 区域ID
- storeType: string - 门店类型
- status: string - 门店状态

##### 创建门店
**接口**: `POST /api/v1/admin/stores`
**权限**: store:write
**状态**: 待开发

##### 获取门店详情
**接口**: `GET /api/v1/admin/stores/{storeId}`
**权限**: store:read
**状态**: 待开发

##### 更新门店信息
**接口**: `PUT /api/v1/admin/stores/{storeId}`
**权限**: store:write
**状态**: 待开发

#### 4.3.2 门店设置管理

##### 获取门店设置
**接口**: `GET /api/v1/admin/stores/{storeId}/settings`
**权限**: store:read
**状态**: 待开发

##### 更新门店设置
**接口**: `PUT /api/v1/admin/stores/{storeId}/settings`
**权限**: store:write
**状态**: 待开发

#### 4.3.3 城市管理

##### 获取城市列表
**接口**: `GET /api/v1/admin/cities`
**权限**: city:read
**状态**: 待开发

##### 创建城市
**接口**: `POST /api/v1/admin/cities`
**权限**: city:write
**状态**: 待开发

#### 4.3.4 区域管理

##### 获取区域列表
**接口**: `GET /api/v1/admin/regions`
**权限**: region:read
**状态**: 待开发

##### 创建区域
**接口**: `POST /api/v1/admin/regions`
**权限**: region:write
**状态**: 待开发

##### 分配区域经理
**接口**: `PUT /api/v1/admin/regions/{regionId}/manager`
**权限**: region:write
**状态**: 待开发

### 4.4 订单管理

#### 4.4.1 订单基础管理

##### 获取订单列表
**接口**: `GET /api/v1/admin/orders`
**权限**: order:read
**状态**: 待开发

**查询参数**:
- page: number - 页码
- limit: number - 每页数量
- orderNo: string - 订单号
- userId: string - 用户ID
- storeId: string - 门店ID
- status: string - 订单状态
- vehicleType: string - 车辆类型
- dateRange: string - 日期范围

##### 获取订单详情
**接口**: `GET /api/v1/admin/orders/{orderNo}`
**权限**: order:read
**状态**: 待开发

#### 4.4.2 订单状态管理

##### 更新订单状态
**接口**: `POST /api/v1/admin/orders/{orderNo}/status`
**权限**: order:write
**状态**: 待开发

**请求参数**:
```json
{
  "action": "confirm",
  "reason": "string",
  "notes": "string"
}
```

##### 订单状态时间线
**接口**: `GET /api/v1/admin/orders/{orderNo}/status-history`
**权限**: order:read
**状态**: 待开发

#### 4.4.3 异常处理

##### 异常订单列表
**接口**: `GET /api/v1/admin/orders/exceptions`
**权限**: order:read
**状态**: 待开发

##### 处理异常订单
**接口**: `POST /api/v1/admin/orders/{orderNo}/handle-exception`
**权限**: order:write
**状态**: 待开发

#### 4.4.4 退款管理

##### 退款申请列表
**接口**: `GET /api/v1/admin/orders/refunds`
**权限**: order:read
**状态**: 待开发

##### 审核退款申请
**接口**: `POST /api/v1/admin/orders/{orderNo}/refunds/{refundId}/review`
**权限**: order:write
**状态**: 待开发

#### 4.4.5 评价管理

##### 获取评价列表
**接口**: `GET /api/v1/admin/orders/reviews`
**权限**: order:read
**状态**: 待开发

##### 回复评价
**接口**: `POST /api/v1/admin/orders/{orderNo}/reviews/{reviewId}/reply`
**权限**: order:write
**状态**: 待开发

### 4.5 众筹管理

#### 4.5.1 众筹项目管理

##### 获取众筹项目列表
**接口**: `GET /api/v1/admin/crowdfunding/projects`
**权限**: crowdfunding:read
**状态**: 待开发

##### 创建众筹项目
**接口**: `POST /api/v1/admin/crowdfunding/projects`
**权限**: crowdfunding:write
**状态**: 待开发

##### 获取项目详情
**接口**: `GET /api/v1/admin/crowdfunding/projects/{projectId}`
**权限**: crowdfunding:read
**状态**: 待开发

##### 更新项目信息
**接口**: `PUT /api/v1/admin/crowdfunding/projects/{projectId}`
**权限**: crowdfunding:write
**状态**: 待开发

#### 4.5.2 项目审核管理

##### 项目审核列表
**接口**: `GET /api/v1/admin/crowdfunding/projects/pending`
**权限**: crowdfunding:review
**状态**: 待开发

##### 审核项目
**接口**: `POST /api/v1/admin/crowdfunding/projects/{projectId}/review`
**权限**: crowdfunding:review
**状态**: 待开发

**请求参数**:
```json
{
  "action": "approve",
  "reason": "string",
  "notes": "string"
}
```

#### 4.5.3 车辆关联管理

##### 项目车辆列表
**接口**: `GET /api/v1/admin/crowdfunding/projects/{projectId}/vehicles`
**权限**: crowdfunding:read
**状态**: 待开发

##### 关联车辆到项目
**接口**: `POST /api/v1/admin/crowdfunding/projects/{projectId}/vehicles`
**权限**: crowdfunding:write
**状态**: 待开发

#### 4.5.4 份额管理

##### 份额购买记录
**接口**: `GET /api/v1/admin/crowdfunding/projects/{projectId}/shares`
**权限**: crowdfunding:read
**状态**: 待开发

##### 份额交易记录
**接口**: `GET /api/v1/admin/crowdfunding/trading`
**权限**: crowdfunding:read
**状态**: 待开发

#### 4.5.5 项目监控

##### 项目进度监控
**接口**: `GET /api/v1/admin/crowdfunding/projects/{projectId}/progress`
**权限**: crowdfunding:read
**状态**: 待开发

##### 收益统计
**接口**: `GET /api/v1/admin/crowdfunding/projects/{projectId}/earnings`
**权限**: crowdfunding:read
**状态**: 待开发

### 4.6 合作管理

#### 4.6.1 合作商管理

##### 获取合作商列表
**接口**: `GET /api/v1/admin/cooperative/merchants`
**权限**: cooperative:read
**状态**: 待开发

##### 创建合作商
**接口**: `POST /api/v1/admin/cooperative/merchants`
**权限**: cooperative:write
**状态**: 待开发

##### 合作商资质审核
**接口**: `POST /api/v1/admin/cooperative/merchants/{merchantId}/review`
**权限**: cooperative:review
**状态**: 待开发

#### 4.6.2 合作车辆管理

##### 获取合作车辆列表
**接口**: `GET /api/v1/admin/cooperative/vehicles`
**权限**: cooperative:read
**状态**: 待开发

##### 创建合作车辆
**接口**: `POST /api/v1/admin/cooperative/vehicles`
**权限**: cooperative:write
**状态**: 待开发

##### 服务标准配置
**接口**: `PUT /api/v1/admin/cooperative/vehicles/{vehicleId}/service-standards`
**权限**: cooperative:write
**状态**: 待开发

#### 4.6.3 供应商管理

##### 获取供应商列表
**接口**: `GET /api/v1/admin/cooperative/suppliers`
**权限**: cooperative:read
**状态**: 待开发

##### 创建供应商
**接口**: `POST /api/v1/admin/cooperative/suppliers`
**权限**: cooperative:write
**状态**: 待开发

#### 4.6.4 结算管理

##### 差价结算列表
**接口**: `GET /api/v1/admin/cooperative/settlements`
**权限**: cooperative:read
**状态**: 待开发

##### 创建结算单
**接口**: `POST /api/v1/admin/cooperative/settlements`
**权限**: cooperative:write
**状态**: 待开发

### 4.7 营地管理

#### 4.7.1 营地基础管理

##### 获取营地列表
**接口**: `GET /api/v1/admin/campsites`
**权限**: campsite:read
**状态**: 待开发

##### 创建营地
**接口**: `POST /api/v1/admin/campsites`
**权限**: campsite:write
**状态**: 待开发

##### 获取营地详情
**接口**: `GET /api/v1/admin/campsites/{campsiteId}`
**权限**: campsite:read
**状态**: 待开发

#### 4.7.2 营地设施管理

##### 获取营地设施
**接口**: `GET /api/v1/admin/campsites/{campsiteId}/facilities`
**权限**: campsite:read
**状态**: 待开发

##### 更新营地设施
**接口**: `PUT /api/v1/admin/campsites/{campsiteId}/facilities`
**权限**: campsite:write
**状态**: 待开发

#### 4.7.3 预订管理

##### 获取预订列表
**接口**: `GET /api/v1/admin/campsites/reservations`
**权限**: campsite:read
**状态**: 待开发

##### 创建预订
**接口**: `POST /api/v1/admin/campsites/reservations`
**权限**: campsite:write
**状态**: 待开发

#### 4.7.4 营地咨询管理

##### 获取咨询列表
**接口**: `GET /api/v1/admin/campsites/inquiries`
**权限**: campsite:read
**状态**: 待开发

##### 回复咨询
**接口**: `POST /api/v1/admin/campsites/inquiries/{inquiryId}/reply`
**权限**: campsite:write
**状态**: 待开发

---

## 5. 营销运营接口

### 5.1 营销管理

#### 5.1.1 价格策略管理

##### 获取价格策略
**接口**: `GET /api/v1/admin/marketing/pricing`
**权限**: marketing:read
**状态**: 待开发

##### 创建价格策略
**接口**: `POST /api/v1/admin/marketing/pricing`
**权限**: marketing:write
**状态**: 待开发

##### 动态价格计算
**接口**: `GET /api/v1/admin/marketing/pricing/calculate`
**权限**: marketing:read
**状态**: 待开发

#### 5.1.2 优惠券管理

##### 获取优惠券列表
**接口**: `GET /api/v1/admin/marketing/coupons`
**权限**: marketing:read
**状态**: 待开发

##### 创建优惠券
**接口**: `POST /api/v1/admin/marketing/coupons`
**权限**: marketing:write
**状态**: 待开发

##### 优惠券核销记录
**接口**: `GET /api/v1/admin/marketing/coupons/{couponId}/usage`
**权限**: marketing:read
**状态**: 待开发

#### 5.1.3 营销活动管理

##### 获取营销活动列表
**接口**: `GET /api/v1/admin/marketing/campaigns`
**权限**: marketing:read
**状态**: 待开发

##### 创建营销活动
**接口**: `POST /api/v1/admin/marketing/campaigns`
**权限**: marketing:write
**状态**: 待开发

##### 活动效果统计
**接口**: `GET /api/v1/admin/marketing/campaigns/{campaignId}/analytics`
**权限**: marketing:read
**状态**: 待开发

#### 5.1.4 特惠套餐管理

##### 获取套餐列表
**接口**: `GET /api/v1/admin/marketing/packages`
**权限**: marketing:read
**状态**: 待开发

##### 创建套餐
**接口**: `POST /api/v1/admin/marketing/packages`
**权限**: marketing:write
**状态**: 待开发

#### 5.1.5 房车旅游管理

##### 获取旅游路线
**接口**: `GET /api/v1/admin/marketing/tours`
**权限**: marketing:read
**状态**: 待开发

##### 创建旅游路线
**接口**: `POST /api/v1/admin/marketing/tours`
**权限**: marketing:write
**状态**: 待开发

##### 批次管理
**接口**: `GET /api/v1/admin/marketing/tours/{tourId}/batches`
**权限**: marketing:read
**状态**: 待开发

#### 5.1.6 增值费用管理

##### 获取增值费用列表
**接口**: `GET /api/v1/admin/marketing/additional-fees`
**权限**: marketing:read
**状态**: 待开发

##### 创建增值费用
**接口**: `POST /api/v1/admin/marketing/additional-fees`
**权限**: marketing:write
**状态**: 待开发

### 5.2 社区管理

#### 5.2.1 内容审核

##### 获取待审核内容
**接口**: `GET /api/v1/admin/community/pending-content`
**权限**: community:review
**状态**: 待开发

##### 审核内容
**接口**: `POST /api/v1/admin/community/content/{postId}/review`
**权限**: community:review
**状态**: 待开发

#### 5.2.2 社区配置

##### 获取社区配置
**接口**: `GET /api/v1/admin/community/settings`
**权限**: community:read
**状态**: 待开发

##### 更新社区配置
**接口**: `PUT /api/v1/admin/community/settings`
**权限**: community:write
**状态**: 待开发

#### 5.2.3 举报处理

##### 获取举报列表
**接口**: `GET /api/v1/admin/community/reports`
**权限**: community:read
**状态**: 待开发

##### 处理举报
**接口**: `POST /api/v1/admin/community/reports/{reportId}/handle`
**权限**: community:write
**状态**: 待开发

#### 5.2.4 内容管理

##### 获取优质内容
**接口**: `GET /api/v1/admin/community/featured-content`
**权限**: community:read
**状态**: 待开发

##### 推荐内容
**接口**: `POST /api/v1/admin/community/content/{postId}/feature`
**权限**: community:write
**状态**: 待开发

### 5.3 客服管理

#### 5.3.1 客服配置

##### 获取客服配置
**接口**: `GET /api/v1/admin/customer-service/settings`
**权限**: customer-service:read
**状态**: 待开发

##### 更新客服配置
**接口**: `PUT /api/v1/admin/customer-service/settings`
**权限**: customer-service:write
**状态**: 待开发

#### 5.3.2 工单管理

##### 获取工单列表
**接口**: `GET /api/v1/admin/customer-service/tickets`
**权限**: customer-service:read
**状态**: 待开发

##### 创建工单
**接口**: `POST /api/v1/admin/customer-service/tickets`
**权限**: customer-service:write
**状态**: 待开发

##### 分配工单
**接口**: `POST /api/v1/admin/customer-service/tickets/{ticketId}/assign`
**权限**: customer-service:write
**状态**: 待开发

#### 5.3.3 质量监控

##### 获取客服统计数据
**接口**: `GET /api/v1/admin/customer-service/analytics`
**权限**: customer-service:read
**状态**: 待开发

##### SLA监控
**接口**: `GET /api/v1/admin/customer-service/sla`
**权限**: customer-service:read
**状态**: 待开发

#### 5.3.4 知识库管理

##### 获取知识库文章
**接口**: `GET /api/v1/admin/customer-service/knowledge-base`
**权限**: customer-service:read
**状态**: 待开发

##### 创建知识库文章
**接口**: `POST /api/v1/admin/customer-service/knowledge-base`
**权限**: customer-service:write
**状态**: 待开发

### 5.4 分润管理

#### 5.4.1 众筹分润

##### 获取众筹分润记录
**接口**: `GET /api/v1/admin/profit-sharing/crowdfunding`
**权限**: profit-sharing:read
**状态**: 待开发

##### 计算众筹分润
**接口**: `POST /api/v1/admin/profit-sharing/crowdfunding/calculate`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.2 差价分润

##### 获取差价分润记录
**接口**: `GET /api/v1/admin/profit-sharing/cooperative`
**权限**: profit-sharing:read
**状态**: 待开发

##### 计算差价分润
**接口**: `POST /api/v1/admin/profit-sharing/cooperative/calculate`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.3 员工激励

##### 获取员工激励记录
**接口**: `GET /api/v1/admin/profit-sharing/employee-incentives`
**权限**: profit-sharing:read
**状态**: 待开发

##### 创建员工激励
**接口**: `POST /api/v1/admin/profit-sharing/employee-incentives`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.4 推广分润

##### 获取推广分润记录
**接口**: `GET /api/v1/admin/profit-sharing/referral`
**权限**: profit-sharing:read
**状态**: 待开发

##### 计算推广分润
**接口**: `POST /api/v1/admin/profit-sharing/referral/calculate`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.5 分润配置

##### 获取分润规则
**接口**: `GET /api/v1/admin/profit-sharing/rules`
**权限**: profit-sharing:read
**状态**: 待开发

##### 更新分润规则
**接口**: `PUT /api/v1/admin/profit-sharing/rules`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.6 结算管理

##### 获取结算列表
**接口**: `GET /api/v1/admin/profit-sharing/settlements`
**权限**: profit-sharing:read
**状态**: 待开发

##### 创建结算单
**接口**: `POST /api/v1/admin/profit-sharing/settlements`
**权限**: profit-sharing:write
**状态**: 待开发

#### 5.4.7 提现审核

##### 获取提现申请
**接口**: `GET /api/v1/admin/profit-sharing/withdrawals`
**权限**: profit-sharing:read
**状态**: 待开发

##### 审核提现申请
**接口**: `POST /api/v1/admin/profit-sharing/withdrawals/{withdrawalId}/review`
**权限**: profit-sharing:write
**状态**: 待开发

---

## 6. 系统管理接口

### 6.1 员工管理

#### 6.1.1 员工档案管理

##### 获取员工列表
**接口**: `GET /api/v1/admin/system/employees`
**权限**: employee:read
**状态**: 待开发

##### 创建员工
**接口**: `POST /api/v1/admin/system/employees`
**权限**: employee:write
**状态**: 待开发

##### 获取员工详情
**接口**: `GET /api/v1/admin/system/employees/{employeeId}`
**权限**: employee:read
**状态**: 待开发

##### 更新员工信息
**接口**: `PUT /api/v1/admin/system/employees/{employeeId}`
**权限**: employee:write
**状态**: 待开发

#### 6.1.2 角色分配

##### 获取员工角色
**接口**: `GET /api/v1/admin/system/employees/{employeeId}/roles`
**权限**: employee:read
**状态**: 待开发

##### 分配角色
**接口**: `POST /api/v1/admin/system/employees/{employeeId}/roles`
**权限**: employee:write
**状态**: 待开发

#### 6.1.3 门店员工管理

##### 获取门店员工
**接口**: `GET /api/v1/admin/system/store-employees`
**权限**: employee:read
**状态**: 待开发

##### 分配员工到门店
**接口**: `POST /api/v1/admin/system/store-employees`
**权限**: employee:write
**状态**: 待开发

#### 6.1.4 客服人员管理

##### 获取客服人员
**接口**: `GET /api/v1/admin/system/customer-service-staff`
**权限**: employee:read
**状态**: 待开发

##### 设置客服技能
**接口**: `PUT /api/v1/admin/system/customer-service-staff/{staffId}/skills`
**权限**: employee:write
**状态**: 待开发

#### 6.1.5 绩效管理

##### 获取绩效记录
**接口**: `GET /api/v1/admin/system/employees/{employeeId}/performance`
**权限**: employee:read
**状态**: 待开发

##### 创建绩效记录
**接口**: `POST /api/v1/admin/system/employees/{employeeId}/performance`
**权限**: employee:write
**状态**: 待开发

### 6.2 权限管理

#### 6.2.1 角色管理

##### 获取角色列表
**接口**: `GET /api/v1/admin/system/roles`
**权限**: role:read
**状态**: 待开发

##### 创建角色
**接口**: `POST /api/v1/admin/system/roles`
**权限**: role:write
**状态**: 待开发

##### 获取角色详情
**接口**: `GET /api/v1/admin/system/roles/{roleId}`
**权限**: role:read
**状态**: 待开发

##### 更新角色
**接口**: `PUT /api/v1/admin/system/roles/{roleId}`
**权限**: role:write
**状态**: 待开发

#### 6.2.2 权限配置

##### 获取权限列表
**接口**: `GET /api/v1/admin/system/permissions`
**权限**: permission:read
**状态**: 待开发

##### 分配权限给角色
**接口**: `POST /api/v1/admin/system/roles/{roleId}/permissions`
**权限**: permission:write
**状态**: 待开发

#### 6.2.3 菜单权限

##### 获取菜单列表
**接口**: `GET /api/v1/admin/system/menus`
**权限**: menu:read
**状态**: 待开发

##### 配置角色菜单权限
**接口**: `POST /api/v1/admin/system/roles/{roleId}/menus`
**权限**: menu:write
**状态**: 待开发

#### 6.2.4 数据权限

##### 获取数据权限配置
**接口**: `GET /api/v1/admin/system/data-permissions`
**权限**: data-permission:read
**状态**: 待开发

##### 配置数据权限
**接口**: `PUT /api/v1/admin/system/data-permissions`
**权限**: data-permission:write
**状态**: 待开发

#### 6.2.5 操作日志

##### 获取操作日志
**接口**: `GET /api/v1/admin/system/operation-logs`
**权限**: audit:read
**状态**: 待开发

**查询参数**:
- page: number - 页码
- limit: number - 每页数量
- operatorId: string - 操作人ID
- module: string - 模块
- action: string - 操作类型
- dateRange: string - 日期范围

### 6.3 系统管理

#### 6.3.1 系统配置

##### 获取系统配置
**接口**: `GET /api/v1/admin/system/configs`
**权限**: system:read
**状态**: 待开发

##### 更新系统配置
**接口**: `PUT /api/v1/admin/system/configs`
**权限**: system:write
**状态**: 待开发

#### 6.3.2 参数设置

##### 获取参数设置
**接口**: `GET /api/v1/admin/system/parameters`
**权限**: system:read
**状态**: 待开发

##### 更新参数设置
**接口**: `PUT /api/v1/admin/system/parameters`
**权限**: system:write
**状态**: 待开发

#### 6.3.3 智能预警

##### 获取预警列表
**接口**: `GET /api/v1/admin/system/alerts`
**权限**: system:read
**状态**: 待开发

##### 创建预警规则
**接口**: `POST /api/v1/admin/system/alert-rules`
**权限**: system:write
**状态**: 待开发

#### 6.3.4 系统监控

##### 获取系统状态
**接口**: `GET /api/v1/admin/system/status`
**权限**: system:read
**状态**: 待开发

##### 获取性能指标
**接口**: `GET /api/v1/admin/system/metrics`
**权限**: system:read
**状态**: 待开发

#### 6.3.5 数据备份

##### 获取备份列表
**接口**: `GET /api/v1/admin/system/backups`
**权限**: system:read
**状态**: 待开发

##### 创建备份
**接口**: `POST /api/v1/admin/system/backups`
**权限**: system:write
**状态**: 待开发

##### 恢复备份
**接口**: `POST /api/v1/admin/system/backups/{backupId}/restore`
**权限**: system:write
**状态**: 待开发

#### 6.3.6 审计日志

##### 获取审计日志
**接口**: `GET /api/v1/admin/system/audit-logs`
**权限**: audit:read
**状态**: 待开发

##### 生成审计报告
**接口**: `POST /api/v1/admin/system/audit-reports`
**权限**: audit:write
**状态**: 待开发

---

## 7. 数据分析接口

### 7.1 工作台模块

#### 7.1.1 数据概览

##### 获取工作台数据
**接口**: `GET /api/v1/admin/analytics/dashboard`
**权限**: analytics:read
**状态**: 待开发

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "overview": {
      "totalUsers": 10000,
      "totalOrders": 5000,
      "totalRevenue": 2900000,
      "activeVehicles": 150,
      "newUsersToday": 50,
      "ordersToday": 25,
      "revenueToday": 14500
    },
    "trends": {
      "userGrowth": [
        {"date": "2025-11-20", "count": 45},
        {"date": "2025-11-21", "count": 52}
      ],
      "revenueGrowth": [
        {"date": "2025-11-20", "amount": 12000},
        {"date": "2025-11-21", "amount": 14500}
      ]
    },
    "alerts": [
      {
        "type": "warning",
        "message": "订单取消率超过70%",
        "action": "查看详情"
      }
    ]
  }
}
```

#### 7.1.2 今日待办

##### 获取今日待办
**接口**: `GET /api/v1/admin/analytics/today-tasks`
**权限**: analytics:read
**状态**: 待开发

#### 7.1.3 快捷操作

##### 获取快捷操作
**接口**: `GET /api/v1/admin/analytics/quick-actions`
**权限**: analytics:read
**状态**: 待开发

### 7.2 财务管理模块

#### 7.2.1 收入统计

##### 获取收入统计
**接口**: `GET /api/v1/admin/analytics/revenue`
**权限**: finance:read
**状态**: 待开发

#### 7.2.2 支出管理

##### 获取支出列表
**接口**: `GET /api/v1/admin/analytics/expenses`
**权限**: finance:read
**状态**: 待开发

##### 创建支出记录
**接口**: `POST /api/v1/admin/analytics/expenses`
**权限**: finance:write
**状态**: 待开发

#### 7.2.3 对账结算

##### 获取对账记录
**接口**: `GET /api/v1/admin/analytics/reconciliation`
**权限**: finance:read
**状态**: 待开发

##### 生成对账单
**接口**: `POST /api/v1/admin/analytics/reconciliation/generate`
**权限**: finance:write
**状态**: 待开发

#### 7.2.4 财务报表

##### 获取财务报表
**接口**: `GET /api/v1/admin/analytics/financial-reports`
**权限**: finance:read
**状态**: 待开发

##### 生成财务报表
**接口**: `POST /api/v1/admin/analytics/financial-reports/generate`
**权限**: finance:write
**状态**: 待开发

#### 7.2.5 发票管理

##### 获取发票列表
**接口**: `GET /api/v1/admin/analytics/invoices`
**权限**: finance:read
**状态**: 待开发

##### 创建发票
**接口**: `POST /api/v1/admin/analytics/invoices`
**权限**: finance:write
**状态**: 待开发

### 7.3 业务数据分析

#### 7.3.1 用户分析

##### 获取用户统计数据
**接口**: `GET /api/v1/admin/analytics/users`
**权限**: analytics:read
**状态**: 待开发

##### 获取用户行为分析
**接口**: `GET /api/v1/admin/analytics/user-behavior`
**权限**: analytics:read
**状态**: 待开发

#### 7.3.2 车辆分析

##### 获取车辆使用统计
**接口**: `GET /api/v1/admin/analytics/vehicles`
**权限**: analytics:read
**状态**: 待开发

##### 获取车辆收益分析
**接口**: `GET /api/v1/admin/analytics/vehicle-earnings`
**权限**: analytics:read
**状态**: 待开发

#### 7.3.3 订单分析

##### 获取订单统计数据
**接口**: `GET /api/v1/admin/analytics/orders`
**权限**: analytics:read
**状态**: 待开发

##### 获取订单趋势分析
**接口**: `GET /api/v1/admin/analytics/order-trends`
**权限**: analytics:read
**状态**: 待开发

---

## 8. 错误码说明

### 8.1 通用错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 0 | 成功 | - |
| 40001 | 参数验证失败 | 检查请求参数格式和必填项 |
| 40002 | 参数格式错误 | 检查参数类型和格式 |
| 40101 | 未授权访问 | 检查Token是否有效 |
| 40102 | Token已过期 | 重新登录获取新Token |
| 40301 | 权限不足 | 检查用户权限配置 |
| 40401 | 资源不存在 | 检查资源ID是否正确 |
| 40402 | 接口不存在 | 检查API路径是否正确 |
| 40501 | 请求方法不允许 | 检查HTTP方法是否正确 |
| 42901 | 请求频率超限 | 降低请求频率 |
| 50001 | 服务器内部错误 | 检查服务器日志 |
| 50002 | 数据库连接错误 | 检查数据库连接状态 |
| 50003 | 第三方服务异常 | 检查外部服务状态 |

### 8.2 业务错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 10001 | 用户不存在 | 检查用户ID |
| 10002 | 用户状态异常 | 检查用户状态 |
| 20001 | 车辆不存在 | 检查车辆ID |
| 20002 | 车辆状态不可用 | 检查车辆当前状态 |
| 30001 | 订单不存在 | 检查订单号 |
| 30002 | 订单状态错误 | 检查订单当前状态 |
| 40001 | 门店不存在 | 检查门店ID |
| 40002 | 门店状态异常 | 检查门店营业状态 |

### 8.3 权限错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 50001 | 角色不存在 | 检查角色ID |
| 50002 | 权限不足 | 联系管理员分配权限 |
| 50003 | 数据权限越界 | 检查数据访问范围 |
| 50004 | 操作权限不足 | 联系管理员分配操作权限 |

---

## 📝 开发对接说明

### API开发优先级

**第一阶段 - 核心认证**:
1. 管理员认证接口 (3.1)
2. 权限验证中间件
3. 基础响应格式统一

**第二阶段 - 核心业务**:
1. 用户管理接口 (4.1)
2. 车辆管理接口 (4.2)
3. 门店管理接口 (4.3)
4. 订单管理接口 (4.4)

**第三阶段 - 扩展业务**:
1. 众筹管理接口 (4.5)
2. 合作管理接口 (4.6)
3. 营销管理接口 (5.1)
4. 分润管理接口 (5.4)

**第四阶段 - 系统管理**:
1. 员工管理接口 (6.1)
2. 权限管理接口 (6.2)
3. 系统管理接口 (6.3)

**第五阶段 - 数据分析**:
1. 工作台接口 (7.1)
2. 财务管理接口 (7.2)
3. 业务分析接口 (7.3)

### 开发规范

1. **所有接口必须使用统一的响应格式**
2. **所有接口都需要完整的错误处理**
3. **所有接口都需要权限验证**
4. **所有接口都需要参数验证**
5. **所有接口都需要日志记录**
6. **所有接口都需要API文档注释**

### 测试要求

1. **单元测试覆盖率达到80%以上**
2. **接口测试覆盖所有业务场景**
3. **压力测试确保并发性能**
4. **安全测试防止权限越界**

---

## 📞 技术支持

**文档维护**: 叨叨房车后端团队
**API开发**: 后端开发工程师
**测试验证**: 测试团队
**技术审核**: 技术负责人

---

**版本**: v2.0.0 | **最后更新**: 2025-11-28 | **状态**: 完整待开发

**核心变更**:
- 基于产品需求文档完整重构API文档
- 覆盖25个功能模块的所有接口
- 统一接口格式和错误处理
- 明确所有接口状态为"待开发"
- 添加完整的开发对接说明