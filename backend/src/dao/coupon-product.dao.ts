/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import {
  CouponProduct,
  CouponProductDetail,
  CreateCouponProductParams,
  UpdateCouponProductParams,
  CouponProductQueryParams,
} from '../types/models/coupon-product.types';
import { logger } from '@utils/logger';

/**
 * 优惠券产品 DAO
 */
export class CouponProductDAO extends BaseDao<CouponProduct> {
  constructor() {
    super('coupon_products');
  }

  /**
   * 创建优惠券产品
   */
  async createProduct(params: CreateCouponProductParams): Promise<CouponProduct> {
    try {
      const {
        coupon_id,
        product_title,
        product_description,
        product_image,
        display_position,
        special_tags,
        display_order = 0,
      } = params;

      const sql = `
        INSERT INTO ${this.tableName}
        (coupon_id, product_title, product_description, product_image,
         display_position, special_tags, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const tagsJson = special_tags ? JSON.stringify(special_tags) : null;

      const result = await QueryBuilder.insert(sql, [
        coupon_id,
        product_title,
        product_description || null,
        product_image || null,
        display_position || null,
        tagsJson,
        display_order,
      ]);

      const product = await this.findById(result.insertId);
      if (!product) {
        throw new Error('优惠券产品创建失败');
      }

      return product;
    } catch (error) {
      logger.error('创建优惠券产品失败:', error);
      throw error;
    }
  }

  /**
   * 更新优惠券产品
   */
  async updateProduct(id: number, params: UpdateCouponProductParams): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (params.product_title !== undefined) {
        fields.push('product_title = ?');
        values.push(params.product_title);
      }

      if (params.product_description !== undefined) {
        fields.push('product_description = ?');
        values.push(params.product_description);
      }

      if (params.product_image !== undefined) {
        fields.push('product_image = ?');
        values.push(params.product_image);
      }

      if (params.display_position !== undefined) {
        fields.push('display_position = ?');
        values.push(params.display_position);
      }

      if (params.special_tags !== undefined) {
        fields.push('special_tags = ?');
        values.push(JSON.stringify(params.special_tags));
      }

      if (params.display_order !== undefined) {
        fields.push('display_order = ?');
        values.push(params.display_order);
      }

      if (params.status !== undefined) {
        fields.push('status = ?');
        values.push(params.status);
      }

      if (fields.length === 0) {
        return false;
      }

      const sql = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      const result = await QueryBuilder.update(sql, values);
      return result > 0;
    } catch (error) {
      logger.error('更新优惠券产品失败:', error);
      throw error;
    }
  }

  /**
   * 查询优惠券产品列表
   */
  async findProducts(params: CouponProductQueryParams): Promise<{ list: CouponProductDetail[]; total: number }> {
    try {
      const { status, display_position, page = 1, pageSize = 10 } = params;

      const conditions: string[] = ['1=1'];
      const values: any[] = [];

      if (status) {
        conditions.push('cp.status = ?');
        values.push(status);
      }

      if (display_position) {
        conditions.push('cp.display_position = ?');
        values.push(display_position);
      }

      const whereClause = 'WHERE ' + conditions.join(' AND ');

      // 获取总数
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} cp ${whereClause}`;
      const countResult = (await QueryBuilder.queryOne(countSql, values)) as { total: number } | null;
      const total = countResult?.total || 0;

      // 分页查询
      const sql = `
        SELECT cp.*, c.name as coupon_name, c.type as coupon_type,
               c.amount as coupon_amount, c.rate as coupon_rate
        FROM ${this.tableName} cp
        LEFT JOIN coupons c ON cp.coupon_id = c.id
        ${whereClause}
        ORDER BY cp.display_order ASC, cp.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const list = (await QueryBuilder.query(sql, [...values, pageSize, (page - 1) * pageSize])) as CouponProductDetail[];

      return { list, total };
    } catch (error) {
      logger.error('查询优惠券产品列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取优惠券产品详情
   */
  async findProductDetail(id: number): Promise<CouponProductDetail | null> {
    try {
      const sql = `
        SELECT cp.*, c.name as coupon_name, c.type as coupon_type,
               c.amount as coupon_amount, c.rate as coupon_rate
        FROM ${this.tableName} cp
        LEFT JOIN coupons c ON cp.coupon_id = c.id
        WHERE cp.id = ?
      `;

      const result = (await QueryBuilder.queryOne(sql, [id])) as CouponProductDetail | null;
      return result;
    } catch (error) {
      logger.error('获取优惠券产品详情失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: number[], status: string): Promise<boolean> {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const sql = `UPDATE ${this.tableName} SET status = ? WHERE id IN (${placeholders})`;
      const result = await QueryBuilder.update(sql, [status, ...ids]);
      return result > 0;
    } catch (error) {
      logger.error('批量更新状态失败:', error);
      throw error;
    }
  }

  /**
   * 调整展示顺序
   */
  async reorderProducts(orders: Array<{ id: number; order: number }>): Promise<boolean> {
    try {
      for (const item of orders) {
        const sql = `UPDATE ${this.tableName} SET display_order = ? WHERE id = ?`;
        await QueryBuilder.update(sql, [item.order, item.id]);
      }
      return true;
    } catch (error) {
      logger.error('调整展示顺序失败:', error);
      throw error;
    }
  }
}
