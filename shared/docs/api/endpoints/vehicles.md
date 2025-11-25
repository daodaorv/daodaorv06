# 车辆接口

## 获取车辆列表

**接口地址**: `GET /api/v1/vehicles`

**接口描述**: 获取车辆列表，支持分页、筛选和搜索

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，从1开始，默认1 |
| limit | number | 否 | 每页数量，默认10，最大100 |
| brand | string | 否 | 车辆品牌 |
| type | number | 否 | 车辆类型：1(房车), 2(MPV), 3(SUV), 4(轿车), 5(其他) |
| seats | number | 否 | 座位数 |
| minPrice | number | 否 | 最低日租金 |
| maxPrice | number | 否 | 最高日租金 |
| storeId | number | 否 | 门店ID |
| keyword | string | 否 | 搜索关键词（品牌、型号） |
| sort | string | 否 | 排序字段：price(价格), rating(评分), distance(距离) |
| order | string | 否 | 排序方向：asc(升序), desc(降序)，默认desc |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "brand": "奔驰",
        "model": "V260L",
        "type": 1,
        "typeName": "房车",
        "seats": 7,
        "licensePlate": "沪A88888",
        "year": 2023,
        "mileage": 15000,
        "pricePerDay": 1200,
        "deposit": 3000,
        "images": [
          "https://example.com/car1-1.jpg",
          "https://example.com/car1-2.jpg",
          "https://example.com/car1-3.jpg"
        ],
        "features": [
          "GPS导航",
          "蓝牙音乐",
          "USB充电接口",
          "自动空调",
          "倒车雷达"
        ],
        "rating": 4.8,
        "reviewCount": 156,
        "storeId": 1,
        "storeName": "上海浦东店",
        "storeDistance": 5.2,
        "status": 1,
        "createdAt": "2025-11-24T10:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取车辆详情

**接口地址**: `GET /api/v1/vehicles/{id}`

**接口描述**: 获取指定车辆的详细信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 车辆ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "brand": "奔驰",
    "model": "V260L",
    "type": 1,
    "typeName": "房车",
    "seats": 7,
    "licensePlate": "沪A88888",
    "year": 2023,
    "mileage": 15000,
    "engine": "2.0T 涡轮增压",
    "transmission": "自动变速箱",
    "fuelType": "汽油",
    "fuelConsumption": "9.5L/100km",
    "driveMode": "前轮驱动",
    "pricePerDay": 1200,
    "deposit": 3000,
    "insuranceFee": 50,
    "serviceFee": 30,
    "images": [
      {
        "url": "https://example.com/car1-1.jpg",
        "type": "exterior",
        "description": "车辆外观"
      },
      {
        "url": "https://example.com/car1-2.jpg",
        "type": "interior",
        "description": "车内布局"
      }
    ],
    "features": [
      {
        "name": "GPS导航",
        "icon": "gps",
        "description": "内置高德地图导航系统"
      },
      {
        "name": "蓝牙音乐",
        "icon": "bluetooth",
        "description": "支持蓝牙连接播放音乐"
      }
    ],
    "equipment": {
      "entertainment": ["GPS导航", "蓝牙音乐", "USB接口"],
      "safety": ["ABS", "ESP", "安全气囊", "倒车雷达"],
      "comfort": ["自动空调", "真皮座椅", "加热座椅"]
    },
    "description": "全新奔驰V260L房车，配备2.0T涡轮增压发动机，7座布局，适合家庭出行。",
    "rating": 4.8,
    "reviewCount": 156,
    "ratingDistribution": {
      "5": 120,
      "4": 25,
      "3": 8,
      "2": 2,
      "1": 1
    },
    "storeId": 1,
    "storeName": "上海浦东店",
    "storeAddress": "上海市浦东新区张江高科技园区",
    "storePhone": "021-12345678",
    "storeLocation": {
      "latitude": 31.2165,
      "longitude": 121.5365
    },
    "availability": [
      {
        "date": "2025-11-25",
        "available": true
      },
      {
        "date": "2025-11-26",
        "available": false
      }
    ],
    "status": 1,
    "createdAt": "2025-11-24T10:00:00+08:00",
    "updatedAt": "2025-11-24T10:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取车辆品牌列表

**接口地址**: `GET /api/v1/vehicles/brands`

**接口描述**: 获取所有车辆品牌列表

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "奔驰",
      "logo": "https://example.com/brands/benz.png",
      "vehicleCount": 25
    },
    {
      "id": 2,
      "name": "宝马",
      "logo": "https://example.com/brands/bmw.png",
      "vehicleCount": 18
    },
    {
      "id": 3,
      "name": "别克",
      "logo": "https://example.com/brands/buick.png",
      "vehicleCount": 32
    }
  ],
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取车辆类型列表

**接口地址**: `GET /api/v1/vehicles/types`

**接口描述**: 获取所有车辆类型列表

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "房车",
      "description": "适合长途旅行的多功能车辆",
      "icon": "rv",
      "vehicleCount": 15
    },
    {
      "id": 2,
      "name": "MPV",
      "description": "多功能商务车，空间宽敞",
      "icon": "mpv",
      "vehicleCount": 28
    },
    {
      "id": 3,
      "name": "SUV",
      "description": "运动型多功能车",
      "icon": "suv",
      "vehicleCount": 22
    }
  ],
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 检查车辆可用性

**接口地址**: `GET /api/v1/vehicles/{id}/availability`

**接口描述**: 检查指定车辆在指定时间段内的可用性

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 车辆ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式：YYYY-MM-DD |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "vehicleId": 1,
    "startDate": "2025-12-01",
    "endDate": "2025-12-05",
    "available": true,
    "totalPrice": 4800,
    "dailyPrice": 1200,
    "days": 4,
    "conflicts": []
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取车辆评价列表

**接口地址**: `GET /api/v1/vehicles/{id}/reviews`

**接口描述**: 获取指定车辆的用户评价列表

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 车辆ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，从1开始，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| rating | number | 否 | 评分筛选：1-5星 |
| sort | string | 否 | 排序：newest(最新), rating(评分), helpful(有用) |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 123,
        "userName": "张先生",
        "userAvatar": "https://example.com/avatar1.jpg",
        "rating": 5,
        "content": "车辆非常干净，性能良好，店主服务态度很好！",
        "images": [
          "https://example.com/review1-1.jpg"
        ],
        "tripInfo": {
          "startDate": "2025-11-20",
          "endDate": "2025-11-22",
          "days": 2
        },
        "helpfulCount": 15,
        "createdAt": "2025-11-23T10:00:00+08:00"
      }
    ],
    "summary": {
      "totalReviews": 156,
      "averageRating": 4.8,
      "ratingDistribution": {
        "5": 120,
        "4": 25,
        "3": 8,
        "2": 2,
        "1": 1
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "pages": 16
    }
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取推荐车辆

**接口地址**: `GET /api/v1/vehicles/recommendations`

**接口描述**: 根据用户偏好获取推荐车辆

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量，默认5 |
| type | string | 否 | 推荐类型：similar(相似), popular(热门), new(最新) |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 2,
      "brand": "宝马",
      "model": "X5",
      "type": 3,
      "seats": 7,
      "pricePerDay": 1000,
      "rating": 4.7,
      "reviewCount": 89,
      "image": "https://example.com/car2-1.jpg",
      "reason": "与您浏览的车辆类型相同"
    }
  ],
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 500001 | 车辆不存在 |
| 500002 | 车辆不可用 |
| 500003 | 车辆已被预订 |
| 500004 | 车辆信息不完整 |
| 500005 | 车辆已下架 |
| 500006 | 日期格式错误 |
| 500007 | 开始日期不能晚于结束日期 |
| 500008 | 预订天数超出限制 |
| 500009 | 车辆在此时间段不可用 |

## 使用示例

### JavaScript/TypeScript
```typescript
// 获取车辆列表
const getVehicles = async (params = {}) => {
  const response = await fetch('/api/v1/vehicles?' + new URLSearchParams(params))
  const result = await response.json()
  return result.data
}

// 获取车辆详情
const getVehicleDetail = async (id: number) => {
  const response = await fetch(`/api/v1/vehicles/${id}`)
  const result = await response.json()
  return result.data
}

// 检查车辆可用性
const checkAvailability = async (id: number, startDate: string, endDate: string) => {
  const response = await fetch(
    `/api/v1/vehicles/${id}/availability?startDate=${startDate}&endDate=${endDate}`
  )
  const result = await response.json()
  return result.data
}

// 使用示例
const vehicles = await getVehicles({
  page: 1,
  limit: 10,
  type: 1,
  minPrice: 500,
  maxPrice: 2000,
  sort: 'price',
  order: 'asc'
})

const detail = await getVehicleDetail(1)

const availability = await checkAvailability(1, '2025-12-01', '2025-12-05')
```

### uni-app
```javascript
// 获取车辆列表
const getVehicles = (params) => {
  return uni.request({
    url: '/api/v1/vehicles',
    data: params
  }).then(res => res.data.data)
}

// 获取车辆详情
const getVehicleDetail = (id) => {
  return uni.request({
    url: `/api/v1/vehicles/${id}`
  }).then(res => res.data.data)
}

// 在页面中使用
export default {
  data() {
    return {
      vehicles: [],
      loading: false,
      pagination: {}
    }
  },

  async onLoad() {
    this.loading = true
    try {
      const result = await getVehicles({
        page: 1,
        limit: 10
      })
      this.vehicles = result.list
      this.pagination = result.pagination
    } catch (error) {
      uni.showToast({
        title: '获取车辆列表失败',
        icon: 'none'
      })
    } finally {
      this.loading = false
    }
  }
}
```