import { Request, Response } from 'express';
import { MembershipOrderDAO } from '../dao/membership-order.dao';
import { MembershipUpgradeService } from '../services/membership-upgrade.service';
import { PaymentStatus } from '../types/models/membership-order.types';
import { logger } from '@utils/logger';

/**
 * 会员订单控制器
 */
export class MembershipOrderController {
  private membershipOrderDAO: MembershipOrderDAO;
  private membershipUpgradeService: MembershipUpgradeService;

  constructor() {
    this.membershipOrderDAO = new MembershipOrderDAO();
    this.membershipUpgradeService = new MembershipUpgradeService();
  }

  /**
   * 创建会员订单
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, membership_level, duration, original_price, discount_amount, actual_amount, remark } =
        req.body;

      const orderNo = await this.membershipOrderDAO.createOrder({
        user_id,
        membership_level,
        duration,
        original_price,
        discount_amount,
        actual_amount,
        remark,
      });

      res.json({
        success: true,
        data: { order_no: orderNo },
        message: '会员订单创建成功',
      });
    } catch (error) {
      logger.error('创建会员订单失败', { error });
      res.status(500).json({
        success: false,
        message: '创建会员订单失败',
      });
    }
  };

  /**
   * 获取订单详情
   */
  getOrderDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderNo } = req.params;
      const order = await this.membershipOrderDAO.findByOrderNo(orderNo);

      if (!order) {
        res.status(404).json({
          success: false,
          message: '订单不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error('获取订单详情失败', { error });
      res.status(500).json({
        success: false,
        message: '获取订单详情失败',
      });
    }
  };

  /**
   * 分页查询订单列表
   */
  getOrderList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, status, payment_status } = req.query;

      const result = await this.membershipOrderDAO.findAll({
        page: Number(page),
        limit: Number(limit),
        status: status as any,
        payment_status: payment_status as any,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('查询订单列表失败', { error });
      res.status(500).json({
        success: false,
        message: '查询订单列表失败',
      });
    }
  };

  /**
   * 处理支付回调（模拟）
   */
  handlePaymentCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { order_no, payment_method } = req.body;

      // 更新支付状态
      await this.membershipOrderDAO.updatePaymentStatus({
        order_no,
        payment_status: PaymentStatus.PAID,
        payment_method,
        paid_at: new Date(),
      });

      // 触发会员升级
      await this.membershipUpgradeService.handlePaymentSuccess(order_no);

      res.json({
        success: true,
        message: '支付成功，会员权益已自动发放',
      });
    } catch (error) {
      logger.error('处理支付回调失败', { error });
      res.status(500).json({
        success: false,
        message: '处理支付回调失败',
      });
    }
  };
}
