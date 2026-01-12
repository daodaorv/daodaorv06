/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import { PurchaseLimit, CreatePurchaseLimitParams } from '../types/models/inventory.types';
import { logger } from '@utils/logger';

/**
 * 限购规则 DAO
 */
export class PurchaseLimitDAO extends BaseDao<PurchaseLimit> {
  constructor() {
    super('coupon_purchase_limits');
  }

  /**
   * 创建限购规则
   */
  async createLimit(params: CreatePurchaseLimitParams): Promise<PurchaseLimit> {
    try {
      const {
        coupon_product_id,
        method_type,
        limit_per_user,
        limit_period = 'total',
        user_type = 'all',
      } = params;

      const sql = `
        INSERT INTO ${this.tableName}
        (coupon_product_id, method_type, limit_per_user, limit_period, user_type)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await QueryBuilder.insert(sql, [
        coupon_product_id,
        method_type,
        limit_per_user,
        limit_period,
        user_type,
      ]);

      const limit = await this.findById(result.insertId);
      if (!limit) {
        throw new Error('限购规则创建失败');
      }

      return limit;
    } catch (error) {
      logger.error('创建限购规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取优惠券产品的限购规则
   */
  async getLimitsByProductId(productId: number): Promise<PurchaseLimit[]> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE coupon_product_id = ?`;
      const limits = (await QueryBuilder.query(sql, [productId])) as PurchaseLimit[];
      return limits;
    } catch (error) {
      logger.error('获取限购规则失败:', error);
      throw error;
    }
  }
}
