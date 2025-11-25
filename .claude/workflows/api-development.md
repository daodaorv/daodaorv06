# API开发工作流

你是一名专业的API开发工程师，负责设计 and 实现叨叨房车项目的后端API接口。

## API开发流程

### 1. 接口设计
- **路径设计**: 遵循RESTful规范
  ```
  GET    /api/v1/vehicles          # 获取车辆列表
  GET    /api/v1/vehicles/:id      # 获取单个车辆
  POST   /api/v1/vehicles          # 创建车辆
  PUT    /api/v1/vehicles/:id      # 更新车辆
  DELETE /api/v1/vehicles/:id      # 删除车辆
  ```

- **请求参数**: 明确定义查询参数、路径参数、请求体
- **响应格式**: 统一的JSON响应结构
- **错误码**: 使用项目标准错误码 (100000-699999)

### 2. 数据模型定义
```typescript
// 请求DTO
export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(0)
  dailyRate: number;
}

// 响应DTO
export class VehicleResponseDto {
  id: number;
  brand: string;
  model: string;
  dailyRate: number;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. 业务逻辑实现
- **服务层**: 实现核心业务逻辑
- **验证层**: 输入验证和业务规则检查
- **权限控制**: 基于角色的访问控制
- **事务处理**: 确保数据一致性

### 4. 接口测试
```typescript
// 单元测试示例
describe('VehicleController', () => {
  it('should create a new vehicle', async () => {
    const createVehicleDto = {
      brand: '奔驰',
      model: 'Sprinter',
      dailyRate: 500
    };

    const response = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehicleDto)
      .expect(201);

    expect(response.body.data).toMatchObject(createVehicleDto);
  });
});
```

## API响应标准

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "brand": "奔驰",
    "model": "Sprinter"
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2025-11-19T10:00:00+08:00"
  }
}
```

### 错误响应
```json
{
  "code": 100001,
  "message": "参数验证失败",
  "error": "品牌名称不能为空",
  "meta": {
    "requestId": "req-123",
    "timestamp": "2025-11-19T10:00:00+08:00"
  }
}
```

## 中间件使用

### 认证中间件
```typescript
// JWT认证验证
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json(createErrorResponse(401001, '缺少认证令牌'));
  }
  // 验证token逻辑...
};
```

### 权限中间件
```typescript
// RBAC权限检查
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) {
      return res.status(403).json(createErrorResponse(403001, '权限不足'));
    }
    next();
  };
};
```

## 错误处理

### 业务异常
```typescript
export class BusinessException extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// 使用示例
if (!vehicle) {
  throw new BusinessException(200001, '车辆不存在');
}
```

### 全局异常处理
```typescript
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof BusinessException) {
    return res.status(400).json(createErrorResponse(error.code, error.message, error.details));
  }

  // 未知错误
  res.status(500).json(createErrorResponse(500001, '服务器内部错误'));
};
```

## 数据库最佳实践

### 查询优化
- 使用适当的索引
- 避免N+1查询问题
- 使用分页查询大数据集
- 合理使用关联查询

### 事务处理
```typescript
export const createOrder = async (orderData: CreateOrderDto) => {
  const transaction = await sequelize.transaction();

  try {
    // 创建订单
    const order = await Order.create(orderData, { transaction });

    // 更新车辆状态
    await Vehicle.update(
      { status: VehicleStatus.RENTED },
      { where: { id: orderData.vehicleId }, transaction }
    );

    await transaction.commit();
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

开始API开发时，请使用TodoWrite工具创建详细的开发任务列表。