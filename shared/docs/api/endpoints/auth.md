# 认证接口

## 用户登录

**接口地址**: `POST /api/v1/auth/login`

**接口描述**: 用户手机号验证码登录，支持自动注册

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号，11位数字 |
| code | string | 是 | 验证码，6位数字 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户昵称",
      "avatar": "https://example.com/avatar.jpg",
      "userType": "customer",
      "status": "active",
      "createdAt": "2025-11-24T10:00:00+08:00"
    }
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 发送验证码

**接口地址**: `POST /api/v1/auth/send-code`

**接口描述**: 发送手机验证码

**请求参数**:
```json
{
  "phone": "13800138000",
  "type": "login"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号，11位数字 |
| type | string | 是 | 验证码类型：login(登录), register(注册), reset(重置密码) |

**响应示例**:
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "message": "验证码有效期为5分钟"
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 刷新Token

**接口地址**: `POST /api/v1/auth/refresh`

**接口描述**: 使用refreshToken获取新的token

**请求参数**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 获取用户信息

**接口地址**: `GET /api/v1/auth/profile`

**接口描述**: 获取当前登录用户的详细信息

**请求头**:
```http
Authorization: Bearer <your-jwt-token>
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "birthday": "1990-01-01",
    "realName": "张三",
    "idCard": "******************",
    "realNameVerified": true,
    "userType": "customer",
    "status": "active",
    "balance": 1000.00,
    "points": 500,
    "createdAt": "2025-11-24T10:00:00+08:00",
    "updatedAt": "2025-11-24T10:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 更新用户信息

**接口地址**: `PUT /api/v1/auth/profile`

**接口描述**: 更新当前登录用户的信息

**请求头**:
```http
Authorization: Bearer <your-jwt-token>
```

**请求参数**:
```json
{
  "nickname": "新昵称",
  "gender": 1,
  "birthday": "1990-01-01",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称，最大20个字符 |
| gender | number | 否 | 性别：0(未知), 1(男), 2(女) |
| birthday | string | 否 | 生日，格式：YYYY-MM-DD |
| avatar | string | 否 | 头像URL |

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "新昵称",
    "gender": 1,
    "birthday": "1990-01-01",
    "avatar": "https://example.com/new-avatar.jpg",
    "updatedAt": "2025-11-24T10:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 实名认证

**接口地址**: `POST /api/v1/auth/verify-identity`

**接口描述**: 提交实名认证信息

**请求头**:
```http
Authorization: Bearer <your-jwt-token>
```

**请求参数**:
```json
{
  "realName": "张三",
  "idCard": "310101199001011234"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| realName | string | 是 | 真实姓名，2-20个中文字符 |
| idCard | string | 是 | 身份证号，18位数字 |

**响应示例**:
```json
{
  "code": 0,
  "message": "认证提交成功",
  "data": {
    "realName": "张三",
    "idCard": "******************",
    "realNameVerified": true,
    "verifiedAt": "2025-11-24T10:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 退出登录

**接口地址**: `POST /api/v1/auth/logout`

**接口描述**: 退出当前登录

**请求头**:
```http
Authorization: Bearer <your-jwt-token>
```

**响应示例**:
```json
{
  "code": 0,
  "message": "退出成功",
  "data": {},
  "meta": {
    "timestamp": "2025-11-24T10:00:00+08:00",
    "requestId": "req_123456789"
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200001 | 未登录，请先登录 |
| 200002 | Token已过期，请重新登录 |
| 200003 | Token无效 |
| 200004 | 手机号格式错误 |
| 200005 | 验证码错误 |
| 200006 | 验证码已过期 |
| 200007 | 手机号已注册 |
| 200008 | 用户不存在 |
| 200009 | 账号被禁用 |
| 200010 | 实名认证失败 |
| 200011 | 身份证号格式错误 |
| 200012 | 姓名格式错误 |

## 使用示例

### JavaScript/TypeScript
```typescript
// 登录
const login = async (phone: string, code: string) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, code }),
  })

  const result = await response.json()
  if (result.code === 0) {
    // 保存token
    localStorage.setItem('token', result.data.token)
    localStorage.setItem('refreshToken', result.data.refreshToken)
    return result.data.user
  } else {
    throw new Error(result.message)
  }
}

// 获取用户信息
const getProfile = async () => {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const result = await response.json()
  if (result.code === 0) {
    return result.data
  } else {
    throw new Error(result.message)
  }
}
```

### uni-app
```javascript
// 登录
const login = (phone, code) => {
  return uni.request({
    url: '/api/v1/auth/login',
    method: 'POST',
    data: { phone, code }
  }).then(res => {
    if (res.data.code === 0) {
      // 保存token
      uni.setStorageSync('token', res.data.data.token)
      uni.setStorageSync('refreshToken', res.data.data.refreshToken)
      return res.data.data.user
    } else {
      throw new Error(res.data.message)
    }
  })
}

// 获取用户信息
const getProfile = () => {
  const token = uni.getStorageSync('token')
  return uni.request({
    url: '/api/v1/auth/profile',
    header: {
      'Authorization': `Bearer ${token}`
    }
  }).then(res => {
    if (res.data.code === 0) {
      return res.data.data
    } else {
      throw new Error(res.data.message)
    }
  })
}
```