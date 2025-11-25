import { Request, Response } from 'express';
import { PaymentService } from '../services/payment';
import { ApiResponse } from '../utils/response';
import { WechatPaymentService } from '../services/wechat-payment';
import { AlipayPaymentService } from '../services/alipay-payment';
import { BalancePaymentService } from '../services/balance-payment';

export class PaymentController {
  private paymentService: PaymentService;
  private wechatPaymentService: WechatPaymentService;
  private alipayPaymentService: AlipayPaymentService;
  private balancePaymentService: BalancePaymentService;

  constructor() {
    this.paymentService = new PaymentService();
    this.wechatPaymentService = new WechatPaymentService();
    this.alipayPaymentService = new AlipayPaymentService();
    this.balancePaymentService = new BalancePaymentService();
  }

  /**
   * 获取支付方式列表
   */
  public async getPaymentMethods(req: Request, res: Response) {
    try {
      const methods = await this.paymentService.getPaymentMethods();

      res.json(
        ApiResponse.success('获取成功', methods)
      );
    } catch (error: any) {
      console.error('Get payment methods error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 创建支付订单
   */
  public async createPayment(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { orderId, paymentMethod, clientIp, deviceInfo } = req.body;

      // 验证订单是否属于当前用户
      const order = await this.paymentService.validateOrderOwnership(orderId, userId);

      if (!order) {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      // 检查订单状态是否可以支付
      if (order.status.code !== 'pending_payment') {
        return res.status(400).json(
          ApiResponse.error('订单状态不允许支付', 400001)
        );
      }

      // 检查是否已存在待支付的支付记录
      const existingPayment = await this.paymentService.getPendingPayment(orderId, paymentMethod);
      if (existingPayment) {
        // 如果已存在待支付记录，返回该记录的支付信息
        const paymentData = await this.generatePaymentData(existingPayment, paymentMethod);
        return res.json(
          ApiResponse.success('支付订单已存在', paymentData)
        );
      }

      // 创建新的支付记录
      const payment = await this.paymentService.createPayment({
        orderId,
        userId,
        paymentMethod,
        amount: order.actualAmount,
        clientIp,
        deviceInfo
      });

      // 生成支付数据
      const paymentData = await this.generatePaymentData(payment, paymentMethod);

      res.json(
        ApiResponse.success('支付订单创建成功', paymentData)
      );
    } catch (error: any) {
      console.error('Create payment error:', error);

      if (error.code === 'ORDER_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('订单不存在', 404001)
        );
      }

      if (error.code === 'INVALID_PAYMENT_METHOD') {
        return res.status(400).json(
          ApiResponse.error('支付方式不支持', 400002)
        );
      }

      if (error.code === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json(
          ApiResponse.error('余额不足', 400003)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 查询支付状态
   */
  public async getPaymentStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const paymentNo = req.params.paymentNo;

      const payment = await this.paymentService.getPaymentByNo(paymentNo, userId);

      if (!payment) {
        return res.status(404).json(
          ApiResponse.error('支付记录不存在', 404001)
        );
      }

      const paymentStatus = {
        paymentNo: payment.paymentNo,
        orderId: payment.orderId,
        orderNo: payment.order?.orderNo,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        thirdPartyTransactionId: payment.thirdPartyTransactionId,
        paidTime: payment.paidTime,
        failureReason: payment.failureReason
      };

      res.json(
        ApiResponse.success('查询成功', paymentStatus)
      );
    } catch (error: any) {
      console.error('Get payment status error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 处理支付回调
   */
  public async handlePaymentNotify(req: Request, res: Response) {
    try {
      const method = req.params.method;
      const notifyData = req.body;

      let result;

      switch (method) {
        case 'wechat':
          result = await this.wechatPaymentService.handleNotify(notifyData);
          break;
        case 'alipay':
          result = await this.alipayPaymentService.handleNotify(notifyData);
          break;
        case 'unionpay':
          // 银联支付回调处理
          result = { success: true, message: '银联回调处理成功' };
          break;
        default:
          return res.status(400).json(
            ApiResponse.error('不支持的支付方式', 400001)
          );
      }

      if (result.success) {
        // 根据不同支付方式返回相应的响应格式
        switch (method) {
          case 'wechat':
            res.type('application/xml');
            res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
            break;
          case 'alipay':
            res.send('success');
            break;
          default:
            res.json(
              ApiResponse.success(result.message)
            );
        }
      } else {
        res.status(400).json(
          ApiResponse.error(result.message, 400002)
        );
      }
    } catch (error: any) {
      console.error('Handle payment notify error:', error);
      res.status(500).json(
        ApiResponse.error('回调处理失败', 500000)
      );
    }
  }

  /**
   * 取消支付
   */
  public async cancelPayment(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const paymentNo = req.params.paymentNo;

      const payment = await this.paymentService.getPaymentByNo(paymentNo, userId);

      if (!payment) {
        return res.status(404).json(
          ApiResponse.error('支付记录不存在', 404001)
        );
      }

      // 检查支付状态是否可以取消
      if (payment.status !== 'pending') {
        return res.status(400).json(
          ApiResponse.error('支付状态不允许取消', 400001)
        );
      }

      await this.paymentService.cancelPayment(payment.id, userId);

      res.json(
        ApiResponse.success('支付已取消')
      );
    } catch (error: any) {
      console.error('Cancel payment error:', error);
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
      const paymentNo = req.params.paymentNo;
      const { refundAmount, refundReason } = req.body;

      const payment = await this.paymentService.getPaymentByNo(paymentNo, userId);

      if (!payment) {
        return res.status(404).json(
          ApiResponse.error('支付记录不存在', 404001)
        );
      }

      // 检查支付状态是否可以退款
      if (payment.status !== 'success') {
        return res.status(400).json(
          ApiResponse.error('只有支付成功的订单才能申请退款', 400001)
        );
      }

      // 检查退款金额
      if (refundAmount <= 0 || refundAmount > payment.amount) {
        return res.status(400).json(
          ApiResponse.error('退款金额不正确', 400002)
        );
      }

      const refund = await this.paymentService.createRefund({
        paymentId: payment.id,
        orderId: payment.orderId,
        userId,
        refundAmount,
        refundReason
      });

      res.json(
        ApiResponse.success('退款申请提交成功', refund)
      );
    } catch (error: any) {
      console.error('Request refund error:', error);

      if (error.code === 'REFUND_AMOUNT_INVALID') {
        return res.status(400).json(
          ApiResponse.error('退款金额不正确', 400002)
        );
      }

      if (error.code === 'REFUND_ALREADY_EXISTS') {
        return res.status(400).json(
          ApiResponse.error('该支付已存在退款申请', 400003)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户支付记录
   */
  public async getUserPayments(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const method = req.query.method as string;

      const { payments, total } = await this.paymentService.getUserPayments(
        userId,
        page,
        limit,
        status,
        method
      );

      const pagination = {
        current: page,
        pageSize: limit,
        total,
        pages: Math.ceil(total / limit)
      };

      res.json(
        ApiResponse.success('获取成功', {
          payments,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get user payments error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取支付详情
   */
  public async getPaymentDetail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const paymentNo = req.params.paymentNo;

      const payment = await this.paymentService.getPaymentDetail(paymentNo, userId);

      if (!payment) {
        return res.status(404).json(
          ApiResponse.error('支付记录不存在', 404001)
        );
      }

      res.json(
        ApiResponse.success('获取成功', payment)
      );
    } catch (error: any) {
      console.error('Get payment detail error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 重试支付
   */
  public async retryPayment(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const paymentNo = req.params.paymentNo;

      const payment = await this.paymentService.getPaymentByNo(paymentNo, userId);

      if (!payment) {
        return res.status(404).json(
          ApiResponse.error('支付记录不存在', 404001)
        );
      }

      // 检查支付状态是否可以重试
      if (!['pending', 'failed'].includes(payment.status)) {
        return res.status(400).json(
          ApiResponse.error('支付状态不允许重试', 400001)
        );
      }

      // 检查支付是否已过期
      if (new Date() > new Date(payment.createdAt.getTime() + 30 * 60 * 1000)) {
        return res.status(400).json(
          ApiResponse.error('支付已过期，请重新创建支付订单', 400002)
        );
      }

      // 重新生成支付数据
      const paymentData = await this.generatePaymentData(payment, payment.paymentMethod);

      res.json(
        ApiResponse.success('重试支付成功', paymentData)
      );
    } catch (error: any) {
      console.error('Retry payment error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 生成支付数据
   */
  private async generatePaymentData(payment: any, paymentMethod: string) {
    const baseData = {
      paymentNo: payment.paymentNo,
      amount: payment.amount,
      paymentMethod,
      expireTime: new Date(payment.createdAt.getTime() + 30 * 60 * 1000) // 30分钟后过期
    };

    switch (paymentMethod) {
      case 'wechat':
        return {
          ...baseData,
          ...(await this.wechatPaymentService.generatePaymentData(payment))
        };
      case 'alipay':
        return {
          ...baseData,
          ...(await this.alipayPaymentService.generatePaymentData(payment))
        };
      case 'balance':
        return {
          ...baseData,
          ...(await this.balancePaymentService.generatePaymentData(payment))
        };
      case 'unionpay':
        return {
          ...baseData,
          paymentUrl: '', // 银联支付链接
          qrCode: '', // 银联支付二维码
        };
      default:
        throw new Error('不支持的支付方式');
    }
  }
}