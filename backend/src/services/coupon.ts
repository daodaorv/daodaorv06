import { Op } from 'sequelize';
import { Coupon, UserCoupon, CouponUsageLog, CouponDistributionLog, Order } from '../models';
import { generateCouponCode, generateTransactionNo } from '../utils/generator';
import { sequelize } from '../config/database';

export interface AvailableCouponFilters {
  orderAmount?: number;
  vehicleId?: number;
  category?: string;
}

export interface ClaimCouponData {
  userId: number;
  couponId: number;
  obtainSource?: string;
  sourceRelatedId?: number;
  distributionType?: string;
  distributionReason?: string;
}

export interface UseCouponData {
  userId: number;
  couponCode: string;
  orderId: number;
}

export interface ValidateCouponData {
  couponId: number;
  couponCode: string;
  userId: number;
  orderAmount: number;
  vehicleId?: number;
}

export class CouponService {
  /**
   * 获取可用优惠券列表
   */
  public async getAvailableCoupons(userId: number, filters: AvailableCouponFilters = {}) {
    const whereClause: any = {
      isActive: true
    };

    // 时间条件：必须是在有效期内
    const now = new Date();
    whereClause[Op.or] = [
      {
        validFrom: { [Op.lte]: now },
        validUntil: { [Op.gte]: now }
      },
      {
        validFrom: null,
        validUntil: null
      }
    ];

    // 如果有订单金额，筛选满足最低使用金额的优惠券
    if (filters.orderAmount) {
      whereClause.minAmount = { [Op.lte]: filters.orderAmount };
    }

    const coupons = await Coupon.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    // 过滤用户已领取的优惠券
    const userCouponCounts = await UserCoupon.findAll({
      where: {
        userId,
        couponId: { [Op.in]: coupons.map(c => c.id) }
      },
      attributes: [
        'couponId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'claimedCount']
      ],
      group: ['couponId']
    });

    const claimedCounts = userCouponCounts.reduce((acc, item) => {
      acc[item.couponId] = parseInt(item.get('claimedCount') as string);
      return acc;
    }, {} as Record<number, number>);

    // 过滤结果
    const availableCoupons = coupons.filter(coupon => {
      const claimedCount = claimedCounts[coupon.id] || 0;
      return coupon.totalQuantity === 0 || claimedCount < coupon.totalQuantity;
    });

    // 转换为前端格式，添加是否已领取状态
    return availableCoupons.map(coupon => {
      const claimedCount = claimedCounts[coupon.id] || 0;
      return {
        ...coupon.toJSON(),
        remainingQuantity: coupon.totalQuantity === 0 ? -1 : coupon.totalQuantity - claimedCount,
        isClaimed: claimedCount > 0,
        canClaim: coupon.totalQuantity === 0 || claimedCount < coupon.perUserLimit
      };
    });
  }

  /**
   * 获取用户优惠券列表
   */
  public async getUserCoupons(
    userId: number,
    page: number = 1,
    limit: number = 20,
    status?: string
  ) {
    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await UserCoupon.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Coupon,
          attributes: ['id', 'name', 'description', 'type', 'discount', 'minAmount']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      coupons: rows,
      total: count
    };
  }

  /**
   * 领取优惠券
   */
  public async claimCoupon(userId: number, couponId: number, claimData?: Partial<ClaimCouponData>) {
    const transaction = await sequelize.transaction();

    try {
      // 检查优惠券是否存在且可领取
      const coupon = await Coupon.findByPk(couponId, { transaction });

      if (!coupon) {
        throw new Error('COUPON_NOT_FOUND');
      }

      if (!coupon.isActive) {
        throw new Error('COUPON_INACTIVE');
      }

      // 检查用户是否已领取
      const existingCoupon = await UserCoupon.findOne({
        where: {
          userId,
          couponId,
          status: ['unused', 'used']
        },
        transaction
      });

      if (existingCoupon) {
        throw new Error('ALREADY_CLAIMED');
      }

      // 检查领取限制
      const claimedCount = await UserCoupon.count({
        where: {
          userId,
          couponId
        },
        transaction
      });

      if (coupon.perUserLimit > 0 && claimedCount >= coupon.perUserLimit) {
        throw new Error('CLAIM_LIMIT_EXCEEDED');
      }

      // 检查库存
      if (coupon.totalQuantity > 0) {
        const totalClaimed = await UserCoupon.count({
          where: { couponId },
          transaction
        });

        if (totalClaimed >= coupon.totalQuantity) {
          throw new Error('INSUFFICIENT_QUANTITY');
        }
      }

      // 计算有效期
      const now = new Date();
      let validFrom: Date;
      let validUntil: Date;

      if (coupon.validFrom && coupon.validUntil) {
        validFrom = new Date(coupon.validFrom);
        validUntil = new Date(coupon.validUntil);
      } else {
        validFrom = now;
        validUntil = new Date(now.getTime() + coupon.validDays * 24 * 60 * 60 * 1000);
      }

      // 生成唯一优惠券码
      let couponCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        couponCode = generateCouponCode();
        const existing = await UserCoupon.findOne({
          where: { couponCode },
          transaction
        });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('FAILED_TO_GENERATE_CODE');
      }

      // 创建用户优惠券
      const userCoupon = await UserCoupon.create({
        userId,
        couponId,
        couponCode,
        status: 'unused',
        validFrom,
        validUntil,
        obtainSource: claimData?.obtainSource || 'activity',
        sourceRelatedId: claimData?.sourceRelatedId
      }, { transaction });

      // 记录发放日志
      if (claimData?.distributionType) {
        await CouponDistributionLog.create({
          couponId,
          userId,
          userCouponId: userCoupon.id,
          couponCode,
          distributionType: claimData.distributionType,
          distributionReason: claimData.distributionReason || '用户领取'
        }, { transaction });
      }

      await transaction.commit();
      return userCoupon;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 使用优惠券
   */
  public async useCoupon(userId: number, couponCode: string, orderId: number) {
    const transaction = await sequelize.transaction();

    try {
      // 查找用户优惠券
      const userCoupon = await UserCoupon.findOne({
        where: {
          userId,
          couponCode,
          status: 'unused'
        },
        include: [
          {
            model: Coupon
          }
        ],
        transaction
      });

      if (!userCoupon) {
        throw new Error('COUPON_NOT_FOUND');
      }

      // 检查优惠券是否有效
      if (userCoupon.validUntil && new Date() > userCoupon.validUntil) {
        throw new Error('COUPON_EXPIRED');
      }

      if (userCoupon.validFrom && new Date() < userCoupon.validFrom) {
        throw new Error('COUPON_NOT_ACTIVE_YET');
      }

      // 获取订单信息
      const order = await Order.findByPk(orderId, {
        transaction
      });

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // 检查订单金额是否满足最低使用金额
      if (userCoupon.coupon.minAmount > 0 && order.totalAmount < userCoupon.coupon.minAmount) {
        throw new Error('ORDER_AMOUNT_INSUFFICIENT');
      }

      // 计算优惠金额
      let discountAmount = 0;
      if (userCoupon.coupon.type === 'fixed') {
        discountAmount = Math.min(userCoupon.coupon.discount, order.totalAmount);
      } else {
        // 百分比优惠券
        const calculatedDiscount = order.totalAmount * (userCoupon.coupon.discount / 100);
        discountAmount = Math.min(
          calculatedDiscount,
          userCoupon.coupon.maxDiscount || order.totalAmount
        );
      }

      const actualAmount = order.totalAmount - discountAmount;

      // 更新优惠券状态
      await userCoupon.update({
        status: 'used',
        usedAt: new Date(),
        usedOrderId: orderId
      }, { transaction });

      // 更新订单金额（这里需要根据实际业务逻辑调整）
      // await order.update({ actualAmount }, { transaction });

      // 记录使用日志
      await CouponUsageLog.create({
        userId,
        couponId: userCoupon.couponId,
        userCouponId: userCoupon.id,
        couponCode,
        orderId,
        orderAmount: order.totalAmount,
        discountAmount,
        actualAmount
      }, { transaction });

      await transaction.commit();

      return {
        userCouponId: userCoupon.id,
        discountAmount,
        actualAmount,
        couponName: userCoupon.coupon.name
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 验证优惠券
   */
  public async validateCoupon(
    userId: number,
    couponCode: string,
    orderAmount: number,
    vehicleId?: number
  ) {
    const userCoupon = await UserCoupon.findOne({
      where: {
        userId,
        couponCode,
        status: 'unused'
      },
      include: [
        {
          model: Coupon
        }
      ]
    });

    if (!userCoupon) {
      throw new Error('COUPON_NOT_FOUND');
    }

    // 检查优惠券状态
    const isValid = await this.isCouponValid(userCoupon, orderAmount, vehicleId);

    if (!isValid.isValid) {
      throw new Error('COUPON_INVALID');
    }

    // 计算优惠金额
    let discountAmount = 0;
    if (userCoupon.coupon.type === 'fixed') {
      discountAmount = Math.min(userCoupon.coupon.discount, orderAmount);
    } else {
      const calculatedDiscount = orderAmount * (userCoupon.coupon.discount / 100);
      discountAmount = Math.min(
        calculatedDiscount,
        userCoupon.coupon.maxDiscount || orderAmount
      );
    }

    const finalAmount = orderAmount - discountAmount;

    return {
      isValid: true,
      discountAmount,
      finalAmount,
      coupon: userCoupon.coupon
    };
  }

  /**
   * 检查优惠券是否有效
   */
  private async isCouponValid(userCoupon: any, orderAmount: number, vehicleId?: number): Promise<{ isValid: boolean; reason?: string }> {
    const now = new Date();

    // 检查是否过期
    if (userCoupon.validUntil && now > userCoupon.validUntil) {
      return { isValid: false, reason: '优惠券已过期' };
    }

    // 检查是否在有效期内
    if (userCoupon.validFrom && now < userCoupon.validFrom) {
      return { isValid: false, reason: '优惠券尚未生效' };
    }

    // 检查最低使用金额
    if (userCoupon.coupon.minAmount > 0 && orderAmount < userCoupon.coupon.minAmount) {
      return { isValid: false, reason: `订单金额不足${userCoupon.coupon.minAmount}元` };
    }

    // 检查适用条件（这里可以根据实际业务逻辑扩展）
    if (vehicleId && userCoupon.coupon.applicableProducts) {
      const applicableProducts = userCoupon.coupon.applicableProducts;
      if (!applicableProducts.includes(vehicleId)) {
        return { isValid: false, reason: '优惠券不适用于当前车辆' };
      }
    }

    return { isValid: true };
  }

  /**
   * 获取优惠券详情
   */
  public async getCouponDetail(couponId: number) {
    return await Coupon.findByPk(couponId);
  }

  /**
   * 根据优惠券ID获取用户优惠券
   */
  public async getUserCouponByCouponId(userId: number, couponId: number) {
    return await UserCoupon.findOne({
      where: {
        userId,
        couponId
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 获取用户优惠券统计信息
   */
  public async getCouponStats(userId: number) {
    const stats = await UserCoupon.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "unused" THEN 1 END')), 'unused'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "used" THEN 1 END')), 'used'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "expired" THEN 1 END')), 'expired'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "used" THEN discount_amount ELSE 0 END')), 'totalSavings']
      ],
      include: [
        {
          model: Coupon,
          attributes: []
        }
      ],
      raw: true
    });

    return stats[0] || {
      total: 0,
      unused: 0,
      used: 0,
      expired: 0,
      totalSavings: 0
    };
  }

  /**
   * 过期未使用的优惠券
   */
  public async expireCoupons() {
    const now = new Date();

    await UserCoupon.update(
      {
        status: 'expired'
      },
      {
        where: {
          status: 'unused',
          validUntil: { [Op.lt]: now }
        }
      }
    );

    // 这里可以添加通知逻辑，告知用户优惠券已过期
  }

  /**
   * 取消优惠券（管理员功能）
   */
  public async cancelUserCoupon(userCouponId: number, reason?: string) {
    const userCoupon = await UserCoupon.findByPk(userCouponId);

    if (!userCoupon) {
      throw new Error('USER_COUPON_NOT_FOUND');
    }

    if (userCoupon.status !== 'unused') {
      throw new Error('ONLY_UNUSED_COUPONS_CAN_BE_CANCELLED');
    }

    await userCoupon.update({
      status: 'cancelled'
    });

    // 记录取消日志
    // 这里可以添加日志记录逻辑

    return userCoupon;
  }
}