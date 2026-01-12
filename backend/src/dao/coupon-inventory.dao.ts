/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import {
  CouponInventory,
  CreateInventoryParams,
  UpdateInventoryParams,
  ReplenishInventoryParams,
} from '../types/models/inventory.types';
import { logger } from '@utils/logger';

/**
 * 优惠券库存 DAO
 */
export class CouponInventoryDAO extends BaseDao<CouponInventory> {
  constructor() {
    super('coupon_inventory');
  }

  /**
   * 创建库存记录
   */
  async createInventory(params: CreateInventoryParams): Promise<CouponInventory> {
    try {
      const {
        coupon_product_id,
        total_stock,
        warning_threshold = 100,
        auto_offline_when_empty = 1,
      } = params;

      const sql = `
        INSERT INTO ${this.tableName}
        (coupon_product_id, total_stock, sold_count, remaining_stock, warning_threshold, auto_offline_when_empty)
        VALUES (?, ?, 0, ?, ?, ?)
      `;

      const result = await QueryBuilder.insert(sql, [
        coupon_product_id,
        total_stock,
        total_stock,
        warning_threshold,
        auto_offline_when_empty,
      ]);

      const inventory = await this.findById(result.insertId);
      if (!inventory) {
        throw new Error('库存记录创建失败');
      }

      return inventory;
    } catch (error) {
      logger.error('创建库存记录失败:', error);
      throw error;
    }
  }

  /**
   * 更新库存
   */
  async updateInventory(productId: number, params: UpdateInventoryParams): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (params.total_stock !== undefined) {
        fields.push('total_stock = ?');
        values.push(params.total_stock);
        // 同时更新剩余库存
        fields.push('remaining_stock = total_stock - sold_count');
      }

      if (params.warning_threshold !== undefined) {
        fields.push('warning_threshold = ?');
        values.push(params.warning_threshold);
      }

      if (params.auto_offline_when_empty !== undefined) {
        fields.push('auto_offline_when_empty = ?');
        values.push(params.auto_offline_when_empty);
      }

      if (fields.length === 0) {
        return false;
      }

      const sql = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE coupon_product_id = ?`;
      values.push(productId);

      const result = await QueryBuilder.update(sql, values);
      return result > 0;
    } catch (error) {
      logger.error('更新库存失败:', error);
      throw error;
    }
  }

  /**
   * 获取库存信息
   */
  async getInventoryByProductId(productId: number): Promise<CouponInventory | null> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE coupon_product_id = ?`;
      const result = (await QueryBuilder.queryOne(sql, [productId])) as CouponInventory | null;
      return result;
    } catch (error) {
      logger.error('获取库存信息失败:', error);
      throw error;
    }
  }

  /**
   * 补充库存
   */
  async replenishInventory(productId: number, params: ReplenishInventoryParams): Promise<boolean> {
    try {
      const { quantity } = params;
      const sql = `
        UPDATE ${this.tableName}
        SET total_stock = total_stock + ?,
            remaining_stock = remaining_stock + ?
        WHERE coupon_product_id = ?
      `;
      const result = await QueryBuilder.update(sql, [quantity, quantity, productId]);
      return result > 0;
    } catch (error) {
      logger.error('补充库存失败:', error);
      throw error;
    }
  }
}
