/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import {
  SalesOverview,
  MethodSalesStats,
  SalesQueryParams,
} from '../types/models/sales.types';
import { logger } from '@utils/logger';

/**
 * 销售数据统计 DAO
 */
export class SalesStatsDAO extends BaseDao<any> {
  constructor() {
    super('coupon_sales_records');
  }

  /**
   * 获取销售概览
   */
  async getSalesOverview(params: SalesQueryParams): Promise<SalesOverview> {
    try {
      const { start_date, end_date } = params;
      const conditions: string[] = ['1=1'];
      const values: any[] = [];

      if (start_date) {
        conditions.push('created_at >= ?');
        values.push(start_date);
      }

      if (end_date) {
        conditions.push('created_at <= ?');
        values.push(end_date);
      }

      const whereClause = 'WHERE ' + conditions.join(' AND ');

      const sql = `
        SELECT
          SUM(cash_spent) as total_sales_amount,
          SUM(points_spent) as total_points_spent,
          COUNT(*) as total_sales_count,
          0 as conversion_rate
        FROM ${this.tableName}
        ${whereClause}
      `;

      const result = (await QueryBuilder.queryOne(sql, values)) as SalesOverview;
      return result || { total_sales_amount: 0, total_points_spent: 0, total_sales_count: 0, conversion_rate: 0 };
    } catch (error) {
      logger.error('获取销售概览失败:', error);
      throw error;
    }
  }

  /**
   * 获取获取方式分析
   */
  async getMethodStats(params: SalesQueryParams): Promise<MethodSalesStats[]> {
    try {
      const { product_id } = params;
      const conditions: string[] = ['1=1'];
      const values: any[] = [];

      if (product_id) {
        conditions.push('coupon_product_id = ?');
        values.push(product_id);
      }

      const whereClause = 'WHERE ' + conditions.join(' AND ');

      const sql = `
        SELECT
          method_type,
          COUNT(*) as sales_count,
          SUM(cash_spent) as sales_amount,
          SUM(points_spent) as points_spent,
          0 as conversion_rate
        FROM ${this.tableName}
        ${whereClause}
        GROUP BY method_type
      `;

      const results = (await QueryBuilder.query(sql, values)) as MethodSalesStats[];
      return results;
    } catch (error) {
      logger.error('获取获取方式分析失败:', error);
      throw error;
    }
  }
}
