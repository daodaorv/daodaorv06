# 后端API清理重组快速执行指南

> **适用场景**: 快速清理和重组现有不符合规范的API实现
> **执行时间**: 2小时
> **目标**: 建立符合API总规范的基础架构

---

## 🎯 执行目标

**当前问题**:
- ❌ API路径缺少统一前缀（现有: `/vehicles`, 需要: `/api/v1/vehicles`）
- ❌ 响应格式不统一（不符合API总规范）
- ❌ 错误码不规范（使用HTTP状态码，非业务错误码）
- ❌ 缺少分端权限控制（无admin/mobile前缀区分）

**清理目标**:
- ✅ 统一API路径前缀规范
- ✅ 统一响应格式和错误处理
- ✅ 建立分端路由结构
- ✅ 保留现有业务逻辑代码

---

## ⚡ 快速清理步骤

### 步骤1: 备份现有代码（5分钟）
```bash
# 创建备份分支
git checkout -b backup/api-before-cleanup
git add .
git commit -m "backup: API清理前的代码备份"
git checkout main

# 创建工作分支
git checkout -b feature/api-cleanup-restructure
```

### 步骤2: 更新主入口文件（15分钟）

**文件**: `backend/src/index.ts`
✅ **已完成**: 更新路由结构，添加分端前缀注释

### 步骤3: 创建统一响应中间件（20分钟）

创建文件：`backend/src/middleware/response.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  version: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  code: number;
  message: string;
  data: {};
  errors?: Array<{
    field: string;
    message: string;
  }>;
  meta: ApiMeta;
}

export const getMeta = (req?: Request): ApiMeta => ({
  timestamp: new Date().toISOString(),
  requestId: req?.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  version: 'v1.0'
});

export const successResponse = <T>(data: T, req?: Request): ApiResponse<T> => ({
  code: 0,
  message: 'success',
  data,
  meta: getMeta(req)
});

export const errorResponse = (code: number, message: string, errors?: any[], req?: Request): ApiError => ({
  code,
  message,
  data: {},
  errors: errors || [],
  meta: getMeta(req)
});

// 统一成功响应中间件
export const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 保存原始的json方法
  const originalJson = res.json;

  // 重写json方法
  res.json = function(data: any) {
    // 如果已经是标准格式，直接返回
    if (data && typeof data === 'object' && 'code' in data && 'meta' in data) {
      return originalJson.call(this, data);
    }

    // 否则包装为标准格式
    const standardResponse = successResponse(data, req);
    return originalJson.call(this, standardResponse);
  };

  next();
};
```

### 步骤4: 更新错误处理中间件（15分钟）

**文件**: `backend/src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { errorResponse, getMeta } from './response';

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
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });

  // 默认错误码和消息
  let statusCode = 500;
  let errorCode = 100006; // 服务器内部错误
  let message = '服务器内部错误';
  const errors: any[] = [];

  // 根据错误类型设置响应
  if (error instanceof Error) {
    // 业务逻辑错误
    if (error.message.includes('用户不存在')) {
      statusCode = 400;
      errorCode = 200001;
      message = error.message;
    } else if (error.message.includes('密码错误')) {
      statusCode = 401;
      errorCode = 200001;
      message = '用户名或密码错误';
    } else if (error.message.includes('验证码')) {
      statusCode = 400;
      errorCode = 200004;
      message = '验证码错误或已过期';
    } else if (error.message.includes('参数')) {
      statusCode = 400;
      errorCode = 100001;
      message = '请求参数错误';
    }
  }

  // 返回统一错误响应
  const errorResp = errorResponse(errorCode, message, errors, req);
  res.status(statusCode).json(errorResp);
};
```

### 步骤5: 更新现有控制器（30分钟）

**示例：更新认证控制器**
**文件**: `backend/src/controllers/auth.controller.ts`

主要修改点：
1. 导入响应工具函数
2. 使用统一响应格式
3. 使用业务错误码

```typescript
import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { successResponse, errorResponse } from '@/middleware/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  sendCode = async (req: Request, res: Response) => {
    try {
      const { phone, code_type } = req.body;
      const result = await this.authService.sendVerificationCode(phone, code_type);

      // 使用统一成功响应
      res.json(successResponse(result, req));
    } catch (error: any) {
      // 使用统一错误响应
      const errorResp = errorResponse(200004, error.message || '发送验证码失败', [], req);
      res.status(400).json(errorResp);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { phone, password, loginDevice, loginIp } = req.body;
      const result = await this.authService.login({
        phone,
        password,
        loginIp: loginIp || req.ip,
        loginDevice: loginDevice || req.get('User-Agent')?.substring(0, 200) || 'Unknown',
        loginPlatform: req.body.loginPlatform || 'pc'
      });

      res.json(successResponse(result, req));
    } catch (error: any) {
      const errorResp = errorResponse(200001, error.message || '登录失败', [], req);
      res.status(401).json(errorResp);
    }
  };
}
```

### 步骤6: 应用响应中间件（5分钟）

**文件**: `backend/src/index.ts`
在中间件部分添加：
```typescript
import { responseMiddleware } from '@/middleware/response';

// 在路由之前添加响应中间件
app.use(responseMiddleware);
```

### 步骤7: 测试验证（10分钟）

```bash
# 启动开发服务器
npm run dev

# 测试现有接口
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'

# 检查响应格式是否统一
# 应该返回:
# {
#   "code": 0,
#   "message": "success",
#   "data": {...},
#   "meta": {
#     "timestamp": "2025-11-26T10:00:00+08:00",
#     "requestId": "req_1732617600001_abc123",
#     "version": "v1.0"
#   }
# }
```

### 步骤8: 提交代码（10分钟）

```bash
# 添加修改的文件
git add backend/src/middleware/response.ts
git add backend/src/middleware/errorHandler.ts
git add backend/src/controllers/auth.controller.ts
git add backend/src/index.ts

# 提交修改
git commit -m "feat: 实现统一API响应格式和错误处理

- 添加 responseMiddleware 统一响应格式
- 更新 errorHandler 使用业务错误码
- 重构 auth.controller 使用新响应格式
- 完善路由结构，为分端API做准备"
```

---

## ✅ 清理完成检查清单

**基础架构检查**：
- [ ] 统一响应格式中间件已实现
- [ ] 统一错误处理中间件已实现
- [ ] 主路由文件已更新结构
- [ ] 现有控制器已使用新响应格式

**代码质量检查**：
- [ ] 服务器可以正常启动
- [ ] 现有API响应格式符合规范
- [ ] 错误处理使用业务错误码
- [ ] 日志记录功能正常

**文档更新检查**：
- [ ] API.md文件中的"待后端开发"状态已更新
- [ ] 代码提交信息清晰明确
- [ ] 分支管理规范正确

---

## 🚀 下一步行动

**立即执行**：
1. 按照本指南完成基础架构清理
2. 测试确保现有API正常工作
3. 提交代码到feature分支

**后续工作**：
1. 按照 `API实施计划.md` 开始新API开发
2. 逐个更新现有控制器使用新响应格式
3. 实现分端权限控制和路由结构

---

## ⚠️ 注意事项

**风险提醒**：
- 修改响应格式会影响前端调用，需要与前端团队同步
- 错误码变更需要更新前端错误处理逻辑
- 建议在开发环境充分测试后再部署到测试环境

**性能考虑**：
- 响应中间件会轻微增加内存使用
- 错误日志记录需要关注存储空间
- 建议监控API响应时间变化

**兼容性**：
- 现有业务逻辑代码保持不变
- 只修改响应格式和错误处理
- 数据库操作和第三方服务调用不受影响

---

**创建时间**: 2025-11-26
**维护团队**: 后端开发团队
**最后更新**: 2025-11-26