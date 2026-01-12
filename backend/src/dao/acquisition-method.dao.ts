/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import {
  AcquisitionMethod,
  CreateAcquisitionMethodParams,
  UpdateAcquisitionMethodParams,
} from '../types/models/acquisition-method.types';
import { logger } from '@utils/logger';

/**
 * 获取方式配置 DAO
 */
export class AcquisitionMethodDAO extends BaseDao<AcquisitionMethod> {
  constructor() {
    super('coupon_acquisition_methods');
  }

  /**
   * 创建获取方式
   */
  async createMethod(params: CreateAcquisitionMethodParams): Promise<AcquisitionMethod> {
    try {
      const {
        coupon_product_id,
        method_type,
        method_config,
        priority = 0,
        is_enabled = 1,
        start_time,
        end_time,
      } = params;

      const sql = `
        INSERT INTO ${this.tableName}
        (coupon_product_id, method_type, method_config, priority, is_enabled, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const configJson = JSON.stringify(method_config);

      const result = await QueryBuilder.insert(sql, [
        coupon_product_id,
        method_type,
        configJson,
        priority,
        is_enabled,
        start_time || null,
        end_time || null,
      ]);

      const method = await this.findById(result.insertId);
      if (!method) {
        throw new Error('获取方式创建失败');
      }

      return method;
    } catch (error) {
      logger.error('创建获取方式失败:', error);
      throw error;
    }
  }

  /**
   * 更新获取方式
   */
  async updateMethod(id: number, params: UpdateAcquisitionMethodParams): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (params.method_config !== undefined) {
        fields.push('method_config = ?');
        values.push(JSON.stringify(params.method_config));
      }

      if (params.priority !== undefined) {
        fields.push('priority = ?');
        values.push(params.priority);
      }

      if (params.is_enabled !== undefined) {
        fields.push('is_enabled = ?');
        values.push(params.is_enabled);
      }

      if (params.start_time !== undefined) {
        fields.push('start_time = ?');
        values.push(params.start_time);
      }

      if (params.end_time !== undefined) {
        fields.push('end_time = ?');
        values.push(params.end_time);
      }

      if (fields.length === 0) {
        return false;
      }

      const sql = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      const result = await QueryBuilder.update(sql, values);
      return result > 0;
    } catch (error) {
      logger.error('更新获取方式失败:', error);
      throw error;
    }
  }

  /**
   * 获取优惠券产品的所有获取方式
   */
  async findMethodsByProductId(productId: number): Promise<AcquisitionMethod[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE coupon_product_id = ?
        ORDER BY priority ASC, created_at ASC
      `;

      const methods = (await QueryBuilder.query(sql, [productId])) as AcquisitionMethod[];
      return methods;
    } catch (error) {
      logger.error('获取优惠券产品的获取方式失败:', error);
      throw error;
    }
  }

  /**
   * 启用/禁用获取方式
   */
  async toggleMethod(id: number): Promise<boolean> {
    try {
      const method = await this.findById(id);
      if (!method) {
        return false;
      }

      const newStatus = method.is_enabled === 1 ? 0 : 1;
      const sql = `UPDATE ${this.tableName} SET is_enabled = ? WHERE id = ?`;
      const result = await QueryBuilder.update(sql, [newStatus, id]);
      return result > 0;
    } catch (error) {
      logger.error('切换获取方式状态失败:', error);
      throw error;
    }
  }
}
