// 验证中间件 - Joi版本
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// 支持Joi Schema的验证中间件
export const validateRequest = (schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Promise<void> => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 验证请求体
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // 返回所有验证错误
        stripUnknown: true, // 移除未知字段
      });

      if (error) {
        res.status(400).json({
          code: 400001,
          message: '参数验证失败',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          })),
          meta: {
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      // 将验证后的数据替换原始请求体
      req.body = value;
      next();
    } catch (err) {
      res.status(500).json({
        code: 500001,
        message: '服务器内部错误',
        data: null,
        meta: {
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        }
      });
    }
  };
};

// 兼容express-validator的旧版本（如果需要）
export const validationMiddleware = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 这个函数暂时保留，以防有其他地方使用
    next();
  };
};

