import { Request, Response } from 'express';
import { OrderService } from '../services/order';
import { ApiResponse } from '../utils/response';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * 创建订单
   */
  public async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderData = {
        userId,
        vehicleId: req.body.vehicleId,
        pickupStoreId: req.body.pickupStoreId,
        returnStoreId: req.body.returnStoreId,
        pickupTime: new Date(req.body.pickupTime),
        returnTime: new Date(req.body.returnTime),
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        idCardNumber: req.body.idCardNumber,
        driverLicenseNumber: req.body.driverLicenseNumber,
        couponId: req.body.couponId,
        userRemark: req.body.userRemark,
        isDifferentReturn: req.body.isDifferentReturn || false
      };

      // 验证时间有效性
      const now = new Date();
      if (orderData.pickupTime <= now) {
        return res.status(400).json(
          ApiResponse.error('取车时间不能早于当前时间', 100001)
        );
      }

      if (orderData.returnTime <= orderData.pickupTime) {
        return res.status(400).json(
          ApiResponse.error('还车时间必须晚于取车时间', 100002)
        );
      }

      // 限制最长租赁时间（90天）
      const maxReturnTime = new Date(orderData.pickupTime);
      maxReturnTime.setDate(maxReturnTime.getDate() + 90);
      if (orderData.returnTime > maxReturnTime) {
        return res.status(400).json(
          ApiResponse.error('租赁时间不能超过90天', 100003)
        );
      }

      const order = await this.orderService.createOrder(orderData);

      res.json(
        ApiResponse.success('订单创建成功', order)
      );
    } catch (error: any) {
      console.error('Create order error:', error);

      if (error.code === 'VEHICLE_NOT_AVAILABLE') {
        return res.status(400).json(
          ApiResponse.error('车辆在指定时间段内不可用', 100004)
        );
      }

      if (error.code === 'INVALID_COUPON') {
        return res.status(400).json(
          ApiResponse.error('优惠券无效或不可用', 100005)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户订单列表
   */
  public async getUserOrders(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const { orders, total } = await this.orderService.getUserOrders(
        userId,
        page,
        limit,
        status
      );

      const pagination = {
        current: page,
        pageSize: limit,
        total,
        pages: Math.ceil(total / limit)
      };

      res.json(
        ApiResponse.success('获取成功', {
          orders,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get user orders error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取订单详情
   */
  public async getOrderDetail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.orderId);

      const order = await this.orderService.getOrderDetail(orderId, userId);

      if (!order) {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      res.json(
        ApiResponse.success('获取成功', order)
      );
    } catch (error: any) {
      console.error('Get order detail error:', error);
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
      const reason = req.body.reason;

      const order = await this.orderService.getOrderDetail(orderId, userId);

      if (!order) {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      // 检查订单状态是否允许取消
      if (order.status.code === 'cancelled') {
        return res.status(400).json(
          ApiResponse.error('订单已经取消', 400001)
        );
      }

      if (order.status.code === 'completed') {
        return res.status(400).json(
          ApiResponse.error('订单已完成，无法取消', 400002)
        );
      }

      if (order.status.code === 'in_progress') {
        return res.status(400).json(
          ApiResponse.error('订单进行中，无法取消', 400003)
        );
      }

      // 检查是否在允许取消的时间内（取车前2小时）
      const pickupTime = new Date(order.pickupTime);
      const now = new Date();
      const twoHoursBeforePickup = new Date(pickupTime.getTime() - 2 * 60 * 60 * 1000);

      if (now >= twoHoursBeforePickup) {
        return res.status(400).json(
          ApiResponse.error('取车前2小时内不允许取消订单', 400004)
        );
      }

      await this.orderService.cancelOrder(orderId, userId, reason);

      res.json(
        ApiResponse.success('订单取消成功')
      );
    } catch (error: any) {
      console.error('Cancel order error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 计算订单价格
   */
  public async calculatePrice(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        vehicleId,
        pickupTime,
        returnTime,
        couponId
      } = req.body;

      const priceCalculation = await this.orderService.calculatePrice({
        userId,
        vehicleId,
        pickupTime: new Date(pickupTime),
        returnTime: new Date(returnTime),
        couponId
      });

      res.json(
        ApiResponse.success('计算成功', priceCalculation)
      );
    } catch (error: any) {
      console.error('Calculate price error:', error);

      if (error.code === 'VEHICLE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('车辆不存在', 404001)
        );
      }

      if (error.code === 'INVALID_TIME_RANGE') {
        return res.status(400).json(
          ApiResponse.error('时间范围无效', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取订单状态列表
   */
  public async getOrderStatusList(req: Request, res: Response) {
    try {
      const statusList = await this.orderService.getOrderStatusList();

      res.json(
        ApiResponse.success('获取成功', statusList)
      );
    } catch (error: any) {
      console.error('Get order status list error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 申请订单延期
   */
  public async requestOrderExtension(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.orderId);
      const { extensionHours, remark } = req.body;

      const order = await this.orderService.getOrderDetail(orderId, userId);

      if (!order) {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      // 检查订单状态是否允许延期
      if (order.status.code !== 'in_progress') {
        return res.status(400).json(
          ApiResponse.error('只有使用中的订单才能申请延期', 400001)
        );
      }

      // 检查是否已申请过延期
      if (order.extensionRequest) {
        return res.status(400).json(
          ApiResponse.error('已存在延期申请，请等待审批', 400002)
        );
      }

      const extensionRequest = await this.orderService.requestOrderExtension({
        orderId,
        userId,
        extensionHours,
        remark
      });

      res.json(
        ApiResponse.success('延期申请提交成功', extensionRequest)
      );
    } catch (error: any) {
      console.error('Request order extension error:', error);

      if (error.code === 'EXTENSION_HOURS_INVALID') {
        return res.status(400).json(
          ApiResponse.error('延期时间无效', 400003)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}