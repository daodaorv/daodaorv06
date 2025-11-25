import { Request, Response } from 'express';
import { OrderEnhancedService } from '../services/orderEnhanced';
import { ApiResponse } from '../utils/response';

export class OrderEnhancedController {
  private orderEnhancedService: OrderEnhancedService;

  constructor() {
    this.orderEnhancedService = new OrderEnhancedService();
  }

  /**
   * 获取增强的订单列表
   */
  public async getOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const {
        userId,
        statusId,
        vehicleId,
        driverId,
        storeId,
        priority,
        sourceChannel,
        startDate,
        endDate,
        keyword
      } = req.query;

      const filters = {
        userId: userId ? parseInt(userId as string) : undefined,
        statusId: statusId ? parseInt(statusId as string) : undefined,
        vehicleId: vehicleId ? parseInt(vehicleId as string) : undefined,
        driverId: driverId ? parseInt(driverId as string) : undefined,
        storeId: storeId ? parseInt(storeId as string) : undefined,
        priority: priority as string,
        sourceChannel: sourceChannel as string,
        dateRange: startDate && endDate ? {
          startDate: startDate as string,
          endDate: endDate as string
        } : undefined,
        keyword: keyword as string
      };

      const result = await this.orderEnhancedService.getOrders(page, limit, filters);

      const pagination = {
        current: page,
        pageSize: limit,
        total: result.total,
        pages: result.totalPages
      };

      res.json(
        ApiResponse.success('获取成功', {
          orders: result.orders,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get orders error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取订单完整详情
   */
  public async getOrderDetail(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user?.id;

      const order = await this.orderEnhancedService.getOrderDetail(orderId, userId);

      res.json(
        ApiResponse.success('获取成功', order)
      );
    } catch (error: any) {
      console.error('Get order detail error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      if (error.message === 'PERMISSION_DENIED') {
        return res.status(403).json(
          ApiResponse.error('权限不足', 403001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 更新订单状态
   */
  public async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user?.id;
      const {
        statusId,
        notes,
        images,
        location
      } = req.body;

      const statusUpdate = {
        statusId,
        operatorId: userId,
        operatorType: 'user',
        operatorName: req.user?.nickname,
        notes,
        images,
        location
      };

      const order = await this.orderEnhancedService.updateOrderStatus(
        orderId,
        statusUpdate,
        userId
      );

      res.json(
        ApiResponse.success('状态更新成功', order)
      );
    } catch (error: any) {
      console.error('Update order status error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      if (error.message === 'PERMISSION_DENIED') {
        return res.status(403).json(
          ApiResponse.error('权限不足', 403001)
        );
      }

      if (error.message === 'INVALID_STATUS_TRANSITION') {
        return res.status(400).json(
          ApiResponse.error('无效的状态流转', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 设置订单提醒
   */
  public async setOrderReminder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const {
        reminderType,
        reminderTime,
        message,
        channels,
        enabled
      } = req.body;

      const reminder = await this.orderEnhancedService.setOrderReminder(orderId, {
        reminderType,
        reminderTime: new Date(reminderTime),
        message,
        channels,
        enabled
      });

      res.json(
        ApiResponse.success('提醒设置成功', reminder)
      );
    } catch (error: any) {
      console.error('Set order reminder error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 申请退款
   */
  public async requestRefund(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.orderId);
      const {
        refundType,
        refundAmount,
        refundReason,
        detailedReason,
        evidenceImages
      } = req.body;

      const refundRequest = await this.orderEnhancedService.requestRefund(
        orderId,
        userId,
        {
          refundType,
          refundAmount,
          refundReason,
          detailedReason,
          evidenceImages
        }
      );

      res.json(
        ApiResponse.success('退款申请提交成功', refundRequest)
      );
    } catch (error: any) {
      console.error('Request refund error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      if (error.message === 'REFUND_REQUEST_EXISTS') {
        return res.status(400).json(
          ApiResponse.error('该订单已有退款申请', 400001)
        );
      }

      if (error.message === 'INVALID_REFUND_AMOUNT') {
        return res.status(400).json(
          ApiResponse.error('无效的退款金额', 400002)
        );
      }

      if (error.message === 'REFUND_AMOUNT_MISMATCH') {
        return res.status(400).json(
          ApiResponse.error('退款金额不匹配', 400003)
        );
      }

      if (error.message === 'FULL_REFUND_TIME_LIMIT_EXCEEDED') {
        return res.status(400).json(
          ApiResponse.error('距离取车时间不足24小时，不可全额退款', 400004)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 上传订单文件
   */
  public async uploadOrderFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.orderId);
      const {
        fileType,
        fileName,
        fileUrl,
        fileSize,
        fileFormat,
        description,
        uploaderType
      } = req.body;

      const file = await this.orderEnhancedService.uploadOrderFile(orderId, {
        fileType,
        fileName,
        fileUrl,
        fileSize,
        fileFormat,
        description,
        uploadedBy: userId,
        uploaderType
      });

      res.json(
        ApiResponse.success('文件上传成功', file)
      );
    } catch (error: any) {
      console.error('Upload order file error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取订单统计信息
   */
  public async getOrderStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        startDate,
        endDate
      } = req.query;

      const filters = {
        userId,
        dateRange: startDate && endDate ? {
          startDate: startDate as string,
          endDate: endDate as string
        } : undefined
      };

      const stats = await this.orderEnhancedService.getOrderStats(filters);

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get order stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取订单时间线
   */
  public async getOrderTimeline(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user?.id;

      // 先验证订单权限
      const order = await this.orderEnhancedService.getOrderDetail(orderId, userId);
      if (!order) {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      // 时间线已经在订单详情中返回，这里可以直接使用
      res.json(
        ApiResponse.success('获取成功', order.timeline)
      );
    } catch (error: any) {
      console.error('Get order timeline error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 取消订单
   */
  public async cancelOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.orderId);
      const { cancellationReason } = req.body;

      const order = await this.orderEnhancedService.updateOrderStatus(
        orderId,
        {
          statusId: 7, // 已取消
          operatorId: userId,
          operatorType: 'user',
          notes: cancellationReason
        },
        userId
      );

      res.json(
        ApiResponse.success('订单取消成功', order)
      );
    } catch (error: any) {
      console.error('Cancel order error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      if (error.message === 'INVALID_STATUS_TRANSITION') {
        return res.status(400).json(
          ApiResponse.error('当前状态不允许取消订单', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 确认收车
   */
  public async confirmReturn(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.orderId);
      const {
        fuelLevel,
        damageStatus,
        totalDistance,
        notes,
        images
      } = req.body;

      const order = await this.orderEnhancedService.updateOrderStatus(
        orderId,
        {
          statusId: 5, // 待还车
          operatorId: userId,
          operatorType: 'user',
          notes,
          images,
          location: req.body.location
        },
        userId
      );

      // 更新还车相关信息
      await order.update({
        actualReturnTime: new Date(),
        fuelLevelReturn: fuelLevel,
        damageStatusReturn: damageStatus,
        totalDistance
      });

      res.json(
        ApiResponse.success('确认还车成功', order)
      );
    } catch (error: any) {
      console.error('Confirm return error:', error);

      if (error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}