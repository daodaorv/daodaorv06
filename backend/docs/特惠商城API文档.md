# 特惠商城管理API文档

## 概述

本文档描述了特惠商城管理系统的后端API接口,包括管理端和小程序端的所有接口。

**基础URL**: `http://localhost:3001/api`

**认证方式**: Bearer Token (JWT)

---

## 一、管理端API

### 1. 优惠券产品管理

#### 1.1 获取优惠券产品列表

**接口**: `GET /v1/admin/coupon-products`

**请求参数**:
```json
{
  "status": "active",           // 可选: active | inactive
  "display_position": "hot",    // 可选: newbie | hot | limited
  "page": 1,                    // 页码
  "pageSize": 20                // 每页数量
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "coupon_id": 10,
        "product_title": "新人专享50元券",
        "product_description": "新用户首单立减50元",
        "product_image": "/images/coupon1.jpg",
        "display_position": "newbie",
        "special_tags": ["新人专享", "热门"],
        "display_order": 1,
        "status": "active",
        "coupon_name": "50元满减券",
        "coupon_type": "discount",
        "coupon_amount": 50
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```
