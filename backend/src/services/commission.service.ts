import { OrderDAO } from '../dao/order.dao';
import { ProfitSharingDAO } from '../dao/profit-sharing.dao';
import { logger } from '@utils/logger';

/**
 * 分润计算服务
 * 基于现有的分润配置计算订单分润
 */
export class CommissionService {
  private orderDAO: OrderDAO;
  private profitSharingDAO: ProfitSharingDAO;

  constructor() {
    this.orderDAO = new OrderDAO();
    this.profitSharingDAO = new ProfitSharingDAO();
  }

  /**
   * 计算订单分润
   */
  async calculateOrderCommission(orderId: number): Promise<void> {
    try {
      logger.info('开始计算订单分润', { orderId });

      // 1. 查询订单信息
      const order = await this.orderDAO.findById(orderId);
      if (!order) {
        throw new Error(`订单不存在: ${orderId}`);
      }

      // 2. 验证订单状态
      if (order.status !== 'completed') {
        throw new Error(`订单未完成，无法计算分润: ${orderId}`);
      }

      // 3. 计算推广分润
      await this.calculatePromotionCommission(order);

      // 4. 计算托管分润
      await this.calculateHostingCommission(order);

      logger.info('订单分润计算完成', { orderId });
    } catch (error) {
      logger.error('计算订单分润失败', { error, orderId });
      throw error;
    }
  }

  /**
   * 计算推广分润
   */
  private async calculatePromotionCommission(order: any): Promise<void> {
    try {
      // 获取推广人信息
      if (!order.promoter_id) {
        logger.info('订单无推广人，跳过推广分润', { orderId: order.id });
        return;
      }

      // 从分润配置读取比例
      const promotionRate = 0.05; // 5% 默认比例，实际应从配置读取

      const commissionAmount = order.actual_amount * promotionRate;

      // 记录分润
      await this.profitSharingDAO.createRecord({
        order_id: order.id,
        user_id: order.promoter_id,
        type: 'promotion',
        amount: commissionAmount,
        status: 'pending',
      });

      logger.info('推广分润计算完成', {
        orderId: order.id,
        promoterId: order.promoter_id,
        amount: commissionAmount,
      });
    } catch (error) {
      logger.error('计算推广分润失败', { error, orderId: order.id });
      throw error;
    }
  }

  /**
   * 计算托管分润
   */
  private async calculateHostingCommission(order: any): Promise<void> {
    try {
      // 获取车辆托管信息
      if (!order.vehicle_id) {
        logger.info('订单无车辆信息，跳过托管分润', { orderId: order.id });
        return;
      }

      // 从分润配置读取比例
      const hostingRate = 0.7; // 70% 默认比例，实际应从配置读取

      const commissionAmount = order.actual_amount * hostingRate;

      // 记录分润
      await this.profitSharingDAO.createRecord({
        order_id: order.id,
        user_id: order.vehicle_owner_id,
        type: 'hosting',
        amount: commissionAmount,
        status: 'pending',
      });

      logger.info('托管分润计算完成', {
        orderId: order.id,
        ownerId: order.vehicle_owner_id,
        amount: commissionAmount,
      });
    } catch (error) {
      logger.error('计算托管分润失败', { error, orderId: order.id });
      throw error;
    }
  }
}
