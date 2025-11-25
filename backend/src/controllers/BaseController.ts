// 基础控制器
import { Request, Response } from 'express';

export abstract class BaseController {
  protected success<T>(data: T, message: string = 'success') {
    return {
      code: 0,
      message,
      data,
      meta: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString()
      }
    };
  }

  protected error(message: string, code: number = 500, details?: any) {
    return {
      code,
      message,
      details,
      meta: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString()
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}