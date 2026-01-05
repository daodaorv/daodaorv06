import { MembershipBenefitConfigDAO } from '../dao/membership-benefit-config.dao';
import { UserConfigDAO } from '../dao/user-config.dao';
import { UserCouponDAO } from '../dao/user-coupon.dao';
import { logger } from '@utils/logger';

/**
 * 权益发放服务
 */
export class BenefitDistributionService {
  private membershipBenefitConfigDAO: MembershipBenefitConfigDAO;
  private userConfigDAO: UserConfigDAO;
  private userCouponDAO: UserCouponDAO;

  constructor() {
    this.membershipBenefitConfigDAO = new MembershipBenefitConfigDAO();
    this.userConfigDAO = new UserConfigDAO();
    this.userCouponDAO = new UserCouponDAO();
  }

  /**
   * 发放托管欢迎权益
   */
  async distributeHostingWelcomeBenefits(data: {
    userId: number;
    hostingVehicleId: number;
  }): Promise<void> {
    try {
      logger.info('开始发放托管欢迎权益', { userId: data.userId, hostingVehicleId: data.hostingVehicleId });

      // 1. 获取托管欢迎权益配置
      const benefitConfigs = await this.membershipBenefitConfigDAO.getHostingWelcomeBenefits();

      if (benefitConfigs.length === 0) {
        logger.warn('未配置托管欢迎权益', { userId: data.userId });
        return;
      }

      // 2. 遍历权益配置并发放
      for (const config of benefitConfigs) {
        await this.distributeBenefit(data.userId, config);
      }

      logger.info('托管欢迎权益发放完成', { userId: data.userId, benefitCount: benefitConfigs.length });
    } catch (error) {
      logger.error('托管欢迎权益发放失败', { error, userId: data.userId });
      throw error;
    }
  }

  /**
   * 发放会员权益
   */
  async distributeMembershipBenefits(data: {
    userId: number;
    membershipLevel: any;
  }): Promise<void> {
    try {
      logger.info('开始发放会员权益', { userId: data.userId, membershipLevel: data.membershipLevel });

      // 1. 获取会员权益配置
      const benefitConfigs = await this.membershipBenefitConfigDAO.getMembershipBenefits(data.membershipLevel as any);

      if (benefitConfigs.length === 0) {
        logger.warn('未配置会员权益', { userId: data.userId, membershipLevel: data.membershipLevel });
        return;
      }

      // 2. 遍历权益配置并发放
      for (const config of benefitConfigs) {
        await this.distributeBenefit(data.userId, config);
      }

      logger.info('会员权益发放完成', { userId: data.userId, benefitCount: benefitConfigs.length });
    } catch (error) {
      logger.error('会员权益发放失败', { error, userId: data.userId });
      throw error;
    }
  }

  /**
   * 发放单个权益
   */
  private async distributeBenefit(userId: number, config: any): Promise<void> {
    const benefitValue = typeof config.benefit_value === 'string'
      ? JSON.parse(config.benefit_value)
      : config.benefit_value;

    switch (config.benefit_type) {
      case 'coupon':
        // 发放优惠券
        await this.distributeCoupons(userId, benefitValue);
        break;
      case 'promotion_rate':
        // 设置推广比例
        await this.userConfigDAO.set(userId, 'promotion_rate', String(benefitValue.rate || 0.05));
        logger.info('设置推广比例', { userId, rate: benefitValue.rate });
        break;
      case 'discount':
        // 设置折扣权限
        await this.userConfigDAO.set(userId, 'discount_rate', String(benefitValue.rate || 1.0));
        logger.info('设置折扣权限', { userId, rate: benefitValue.rate });
        break;
      default:
        logger.warn('未知的权益类型', { benefitType: config.benefit_type });
    }
  }

  /**
   * 批量发放优惠券
   */
  private async distributeCoupons(userId: number, couponConfig: any): Promise<void> {
    const couponIds = Array.isArray(couponConfig) ? couponConfig : couponConfig.coupon_ids || [];

    for (const couponId of couponIds) {
      try {
        // 计算优惠券过期时间（默认30天）
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await this.userCouponDAO.claimCoupon({
          userId: userId,
          couponId: couponId,
          expiryDate: expiryDate.toISOString().split('T')[0],
        });
        logger.info('优惠券发放成功', { userId, couponId });
      } catch (error) {
        logger.error('优惠券发放失败', { error, userId, couponId });
        // 继续发放其他优惠券
      }
    }
  }
}
