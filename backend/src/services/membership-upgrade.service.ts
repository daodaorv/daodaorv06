import { MembershipOrderDAO } from '../dao/membership-order.dao';
import { UserRoleDAO } from '../dao/user-role.dao';
import { RoleDAO } from '../dao/role.dao';
import { BenefitDistributionService } from './benefit-distribution.service';
import { logger } from '@utils/logger';
import type { MembershipLevel } from '../types/models/membership-order.types';

/**
 * 会员升级服务
 * 处理会员订单支付成功后的自动升级和权益发放
 */
export class MembershipUpgradeService {
  private membershipOrderDAO: MembershipOrderDAO;
  private userRoleDAO: UserRoleDAO;
  private roleDAO: RoleDAO;
  private benefitDistributionService: BenefitDistributionService;

  constructor() {
    this.membershipOrderDAO = new MembershipOrderDAO();
    this.userRoleDAO = new UserRoleDAO();
    this.roleDAO = new RoleDAO();
    this.benefitDistributionService = new BenefitDistributionService();
  }

  /**
   * 会员等级对应的角色代码映射
   */
  private getMembershipRoleCode(level: MembershipLevel): string {
    const roleMap: Record<MembershipLevel, string> = {
      silver: 'member_silver',
      gold: 'member_gold',
      platinum: 'member_platinum',
    };
    return roleMap[level];
  }

  /**
   * 计算会员到期时间
   */
  private calculateExpiresAt(duration: number): Date {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + duration);
    return expiresAt;
  }

  /**
   * 处理会员订单支付成功
   * 自动分配会员角色和发放权益
   */
  async handlePaymentSuccess(orderNo: string): Promise<void> {
    try {
      logger.info('开始处理会员订单支付成功', { orderNo });

      // 1. 查询订单信息
      const order = await this.membershipOrderDAO.findByOrderNo(orderNo);
      if (!order) {
        throw new Error(`订单不存在: ${orderNo}`);
      }

      if (order.payment_status !== 'paid') {
        throw new Error(`订单未支付: ${orderNo}`);
      }

      // 2. 分配会员角色
      await this.assignMembershipRole(order.user_id, order.membership_level, order.duration);

      // 3. 发放会员权益
      await this.benefitDistributionService.distributeMembershipBenefits({
        userId: order.user_id,
        membershipLevel: order.membership_level,
      });

      logger.info('会员订单处理完成', { orderNo, userId: order.user_id });
    } catch (error) {
      logger.error('处理会员订单支付失败', { error, orderNo });
      throw error;
    }
  }

  /**
   * 分配会员角色
   */
  private async assignMembershipRole(
    userId: number,
    membershipLevel: MembershipLevel,
    duration: number
  ): Promise<void> {
    try {
      const roleCode = this.getMembershipRoleCode(membershipLevel);
      const role = await this.roleDAO.findByCode(roleCode);

      if (!role) {
        throw new Error(`会员角色不存在: ${roleCode}`);
      }

      const expiresAt = this.calculateExpiresAt(duration);

      await this.userRoleDAO.assignRole({
        user_id: userId,
        role_id: role.id,
        granted_by: null, // 系统自动分配
        expires_at: expiresAt,
      });

      logger.info('会员角色分配成功', { userId, roleCode, expiresAt });
    } catch (error) {
      logger.error('分配会员角色失败', { error, userId, membershipLevel });
      throw error;
    }
  }
}
