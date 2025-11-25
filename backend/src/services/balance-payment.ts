import { Payment, UserBalance } from '../models';
import { PaymentService } from './payment';
import { generateTransactionNo } from '../utils/generator';
import { sequelize } from '../config/database';

export class BalancePaymentService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * 生成余额支付数据
   */
  public async generatePaymentData(payment: Payment) {
    const transaction = await sequelize.transaction();

    try {
      // 检查用户余额
      const userBalance = await UserBalance.findOne({
        where: { userId: payment.userId },
        transaction
      });

      if (!userBalance) {
        throw new Error('用户余额账户不存在');
      }

      if (userBalance.availableBalance < payment.amount) {
        throw new Error('余额不足');
      }

      // 扣除余额
      const newBalance = userBalance.availableBalance - payment.amount;

      await userBalance.update({
        availableBalance: newBalance,
        totalConsume: userBalance.totalConsume + payment.amount,
        lastConsumeTime: new Date()
      }, { transaction });

      // 记录余额变动
      await sequelize.model('BalanceTransaction').create({
        userId: payment.userId,
        transactionNo: generateTransactionNo(),
        transactionType: 'consume',
        amount: -payment.amount,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        relatedPaymentId: payment.id,
        description: `订单支付-${payment.paymentNo}`,
        status: 'success',
        operatorType: 'user'
      }, { transaction });

      // 更新支付状态为成功
      await payment.update({
        status: 'success',
        thirdPartyTransactionId: 'BALANCE_PAYMENT',
        paidTime: new Date(),
        payTime: new Date()
      }, { transaction });

      await transaction.commit();

      return {
        status: 'success',
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        paymentAmount: payment.amount
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 退款到余额
   */
  public async refundToBalance(refundData: {
    userId: number;
    refundAmount: number;
    refundReason: string;
    relatedPaymentId: number;
    relatedRefundId: number;
  }) {
    const transaction = await sequelize.transaction();

    try {
      // 获取或创建用户余额账户
      let userBalance = await UserBalance.findOne({
        where: { userId: refundData.userId },
        transaction
      });

      if (!userBalance) {
        userBalance = await UserBalance.create({
          userId: refundData.userId,
          availableBalance: 0,
          frozenBalance: 0,
          totalRecharge: 0,
          totalConsume: 0
        }, { transaction });
      }

      // 增加余额
      const newBalance = userBalance.availableBalance + refundData.refundAmount;

      await userBalance.update({
        availableBalance: newBalance
      }, { transaction });

      // 记录余额变动
      await sequelize.model('BalanceTransaction').create({
        userId: refundData.userId,
        transactionNo: generateTransactionNo(),
        transactionType: 'refund',
        amount: refundData.refundAmount,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        relatedPaymentId: refundData.relatedPaymentId,
        relatedRefundId: refundData.relatedRefundId,
        description: `订单退款-${refundData.refundReason}`,
        status: 'success',
        operatorType: 'system'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        refundAmount: refundData.refundAmount
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户余额
   */
  public async getUserBalance(userId: number) {
    const userBalance = await UserBalance.findOne({
      where: { userId }
    });

    return {
      availableBalance: userBalance?.availableBalance || 0,
      frozenBalance: userBalance?.frozenBalance || 0,
      totalRecharge: userBalance?.totalRecharge || 0,
      totalConsume: userBalance?.totalConsume || 0,
      lastRechargeTime: userBalance?.lastRechargeTime,
      lastConsumeTime: userBalance?.lastConsumeTime
    };
  }

  /**
   * 充值到余额
   */
  public async rechargeBalance(rechargeData: {
    userId: number;
    amount: number;
    bonusAmount?: number;
    paymentMethod: string;
    thirdPartyTransactionId?: string;
  }) {
    const transaction = await sequelize.transaction();

    try {
      // 获取或创建用户余额账户
      let userBalance = await UserBalance.findOne({
        where: { userId: rechargeData.userId },
        transaction
      });

      if (!userBalance) {
        userBalance = await UserBalance.create({
          userId: rechargeData.userId,
          availableBalance: 0,
          frozenBalance: 0,
          totalRecharge: 0,
          totalConsume: 0
        }, { transaction });
      }

      // 计算实际到账金额
      const actualAmount = rechargeData.amount + (rechargeData.bonusAmount || 0);
      const newBalance = userBalance.availableBalance + actualAmount;

      await userBalance.update({
        availableBalance: newBalance,
        totalRecharge: userBalance.totalRecharge + rechargeData.amount,
        lastRechargeTime: new Date()
      }, { transaction });

      // 记录余额变动
      await sequelize.model('BalanceTransaction').create({
        userId: rechargeData.userId,
        transactionNo: generateTransactionNo(),
        transactionType: 'recharge',
        amount: actualAmount,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        description: `余额充值-${rechargeData.amount}元`,
        status: 'success',
        operatorType: 'user'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newBalance,
        rechargeAmount: rechargeData.amount,
        bonusAmount: rechargeData.bonusAmount || 0,
        actualAmount
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 冻结余额
   */
  public async freezeBalance(userId: number, amount: number, reason: string) {
    const transaction = await sequelize.transaction();

    try {
      const userBalance = await UserBalance.findOne({
        where: { userId },
        transaction
      });

      if (!userBalance || userBalance.availableBalance < amount) {
        throw new Error('余额不足');
      }

      const newAvailableBalance = userBalance.availableBalance - amount;
      const newFrozenBalance = userBalance.frozenBalance + amount;

      await userBalance.update({
        availableBalance: newAvailableBalance,
        frozenBalance: newFrozenBalance
      }, { transaction });

      // 记录余额变动
      await sequelize.model('BalanceTransaction').create({
        userId,
        transactionNo: generateTransactionNo(),
        transactionType: 'refreeze',
        amount: -amount,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newAvailableBalance,
        frozenAmount: amount,
        description: reason,
        status: 'success',
        operatorType: 'system'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        availableBalance: newAvailableBalance,
        frozenBalance: newFrozenBalance
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 解冻余额
   */
  public async unfreezeBalance(userId: number, amount: number, reason: string) {
    const transaction = await sequelize.transaction();

    try {
      const userBalance = await UserBalance.findOne({
        where: { userId },
        transaction
      });

      if (!userBalance || userBalance.frozenBalance < amount) {
        throw new Error('冻结余额不足');
      }

      const newAvailableBalance = userBalance.availableBalance + amount;
      const newFrozenBalance = userBalance.frozenBalance - amount;

      await userBalance.update({
        availableBalance: newAvailableBalance,
        frozenBalance: newFrozenBalance
      }, { transaction });

      // 记录余额变动
      await sequelize.model('BalanceTransaction').create({
        userId,
        transactionNo: generateTransactionNo(),
        transactionType: 'unfreeze',
        amount: amount,
        balanceBefore: userBalance.availableBalance,
        balanceAfter: newAvailableBalance,
        frozenAmount: -amount,
        description: reason,
        status: 'success',
        operatorType: 'system'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        availableBalance: newAvailableBalance,
        frozenBalance: newFrozenBalance
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取余额变动记录
   */
  public async getBalanceTransactions(
    userId: number,
    page: number = 1,
    limit: number = 20,
    transactionType?: string
  ) {
    const whereClause: any = { userId };

    if (transactionType) {
      whereClause.transactionType = transactionType;
    }

    const { count, rows } = await sequelize.model('BalanceTransaction').findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      transactions: rows,
      total: count
    };
  }

  /**
   * 检查余额是否足够
   */
  public async checkBalance(userId: number, amount: number): Promise<boolean> {
    const userBalance = await UserBalance.findOne({
      where: { userId }
    });

    if (!userBalance) {
      return false;
    }

    return userBalance.availableBalance >= amount;
  }

  /**
   * 处理支付回调（余额支付不需要外部回调，直接同步处理）
   */
  public async handleNotify(notifyData: any) {
    // 余额支付是同步处理的，不需要异步回调
    return { success: true, message: '余额支付已处理' };
  }
}