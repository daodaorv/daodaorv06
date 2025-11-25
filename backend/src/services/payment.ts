import { Op } from 'sequelize';
import { Payment, Order, OrderStatus, PaymentMethod, PaymentChannel, Refund, sequelize } from '../models';
import { generatePaymentNo, generateRefundNo } from '../utils/generator';

export interface CreatePaymentData {
  orderId: number;
  userId: number;
  paymentMethod: string;
  amount: number;
  clientIp?: string;
  deviceInfo?: string;
}

export interface CreateRefundData {
  paymentId: number;
  orderId: number;
  userId: number;
  refundAmount: number;
  refundReason: string;
}

export class PaymentService {
  /**
   * 获取支付方式列表
   */
  public async getPaymentMethods() {
    return await PaymentMethod.findAll({
      where: { isEnabled: true },
      order: [['sortOrder', 'ASC']]
    });
  }

  /**
   * 验证订单所有权
   */
  public async validateOrderOwnership(orderId: number, userId: number) {
    return await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderStatus,
          attributes: ['id', 'name', 'code']
        }
      ]
    });
  }

  /**
   * 获取待支付的支付记录
   */
  public async getPendingPayment(orderId: number, paymentMethod: string) {
    return await Payment.findOne({
      where: {
        orderId,
        paymentMethod,
        status: 'pending'
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 创建支付记录
   */
  public async createPayment(paymentData: CreatePaymentData) {
    const transaction = await sequelize.transaction();

    try {
      // 获取支付方式配置
      const paymentMethod = await PaymentMethod.findOne({
        where: { code: paymentData.paymentMethod, isEnabled: true },
        transaction
      });

      if (!paymentMethod) {
        throw new Error('支付方式不存在或已禁用');
      }

      // 获取支付渠道配置
      const paymentChannel = await PaymentChannel.findOne({
        where: {
          methodCode: paymentData.paymentMethod,
          isEnabled: true
        },
        transaction
      });

      // 创建支付记录
      const payment = await Payment.create({
        paymentNo: generatePaymentNo(),
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        paymentType: 'full_payment',
        paymentMethod: paymentData.paymentMethod,
        channelId: paymentChannel?.id,
        amount: paymentData.amount,
        status: 'pending',
        clientIp: paymentData.clientIp,
        deviceInfo: paymentData.deviceInfo
      }, { transaction });

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 通过流水号获取支付记录
   */
  public async getPaymentByNo(paymentNo: string, userId?: number) {
    const whereClause: any = { paymentNo };

    if (userId) {
      whereClause.userId = userId;
    }

    return await Payment.findOne({
      where: whereClause,
      include: [
        {
          model: Order,
          attributes: ['id', 'orderNo']
        }
      ]
    });
  }

  /**
   * 取消支付
   */
  public async cancelPayment(paymentId: number, userId: number) {
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(paymentId, { transaction });

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      if (payment.userId !== userId) {
        throw new Error('无权限操作此支付记录');
      }

      if (payment.status !== 'pending') {
        throw new Error('支付状态不允许取消');
      }

      await payment.update({
        status: 'cancelled',
        failureReason: '用户取消'
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 创建退款申请
   */
  public async createRefund(refundData: CreateRefundData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查支付记录
      const payment = await Payment.findByPk(refundData.paymentId, {
        transaction
      });

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 检查是否已存在退款申请
      const existingRefund = await Refund.findOne({
        where: {
          paymentId: refundData.paymentId,
          status: { [Op.notIn]: ['failed', 'cancelled'] }
        },
        transaction
      });

      if (existingRefund) {
        throw new Error('该支付已存在退款申请');
      }

      // 检查退款金额
      if (refundData.refundAmount > payment.amount) {
        throw new Error('退款金额不能大于支付金额');
      }

      // 判断退款类型
      const refundType = refundData.refundAmount === payment.amount ? 'full' : 'partial';

      // 创建退款记录
      const refund = await Refund.create({
        refundNo: generateRefundNo(),
        paymentId: refundData.paymentId,
        orderId: refundData.orderId,
        userId: refundData.userId,
        refundAmount: refundData.refundAmount,
        refundReason: refundData.refundReason,
        refundType,
        status: 'pending',
        operatorType: 'user'
      }, { transaction });

      await transaction.commit();
      return refund;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户支付记录
   */
  public async getUserPayments(
    userId: number,
    page: number = 1,
    limit: number = 20,
    status?: string,
    method?: string
  ) {
    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    if (method) {
      whereClause.paymentMethod = method;
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          attributes: ['id', 'orderNo']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      payments: rows,
      total: count
    };
  }

  /**
   * 获取支付详情
   */
  public async getPaymentDetail(paymentNo: string, userId?: number) {
    const whereClause: any = { paymentNo };

    if (userId) {
      whereClause.userId = userId;
    }

    return await Payment.findOne({
      where: whereClause,
      include: [
        {
          model: Order,
          attributes: ['id', 'orderNo', 'totalAmount', 'actualAmount'],
          include: [
            {
              model: OrderStatus,
              attributes: ['id', 'name', 'code', 'description']
            }
          ]
        },
        {
          model: PaymentMethod,
          attributes: ['id', 'code', 'name', 'description'],
          required: false
        }
      ]
    });
  }

  /**
   * 更新支付状态
   */
  public async updatePaymentStatus(
    paymentNo: string,
    status: string,
    thirdPartyTransactionId?: string,
    additionalData?: any
  ) {
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findOne({
        where: { paymentNo },
        transaction
      });

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      const updateData: any = {
        status,
        thirdPartyTransactionId
      };

      if (status === 'success') {
        updateData.paidTime = new Date();
        updateData.payTime = new Date();
      } else if (status === 'failed') {
        updateData.failureReason = additionalData?.failureReason || '支付失败';
      }

      await payment.update(updateData, { transaction });

      // 如果支付成功，更新订单状态
      if (status === 'success') {
        await this.updateOrderAfterPaymentSuccess(payment.orderId, transaction);
      }

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 支付成功后更新订单状态
   */
  private async updateOrderAfterPaymentSuccess(orderId: number, transaction: any) {
    // 获取待确认状态
    const pendingConfirmationStatus = await OrderStatus.findOne({
      where: { code: 'pending_confirmation' },
      transaction
    });

    if (!pendingConfirmationStatus) {
      throw new Error('订单状态不存在');
    }

    // 更新订单状态
    await Order.update(
      {
        statusId: pendingConfirmationStatus.id
      },
      {
        where: { id: orderId },
        transaction
      }
    );

    // 记录状态变更日志
    await sequelize.model('OrderStatusLog').create({
      orderId,
      fromStatusId: (await Order.findByPk(orderId, { transaction }))?.statusId,
      toStatusId: pendingConfirmationStatus.id,
      operatorId: 0, // 系统操作
      operatorType: 'system',
      remark: '支付成功，订单状态更新'
    }, { transaction });
  }

  /**
   * 获取支付渠道配置
   */
  public async getPaymentChannelConfig(methodCode: string) {
    return await PaymentChannel.findOne({
      where: {
        methodCode,
        isEnabled: true
      }
    });
  }

  /**
   * 记录支付日志
   */
  public async logPaymentAction(logData: {
    paymentId?: number;
    paymentNo?: string;
    action: string;
    requestData?: any;
    responseData?: any;
    status: string;
    errorCode?: string;
    errorMessage?: string;
    durationMs?: number;
  }) {
    try {
      await sequelize.model('PaymentLog').create(logData);
    } catch (error) {
      // 日志记录失败不应该影响主流程
      console.error('Log payment action error:', error);
    }
  }

  /**
   * 检查支付是否可以退款
   */
  public async canRefund(paymentId: number): Promise<boolean> {
    const payment = await Payment.findByPk(paymentId);

    if (!payment || payment.status !== 'success') {
      return false;
    }

    // 检查是否在退款期限内（90天）
    const refundDeadline = new Date(payment.paidTime!.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (new Date() > refundDeadline) {
      return false;
    }

    return true;
  }

  /**
   * 获取支付统计信息
   */
  public async getPaymentStats(userId: number) {
    const stats = await Payment.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "success" THEN amount ELSE 0 END')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "success" THEN 1 ELSE NULL END')), 'successCount'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "failed" THEN 1 ELSE NULL END')), 'failedCount']
      ],
      raw: true
    });

    return stats[0] || {
      totalCount: 0,
      totalAmount: 0,
      successCount: 0,
      failedCount: 0
    };
  }
}