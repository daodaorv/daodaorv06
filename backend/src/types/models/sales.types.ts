import { RowDataPacket } from 'mysql2';

/**
 * 销售概览数据
 */
export interface SalesOverview {
  total_sales_amount: number;
  total_points_spent: number;
  total_sales_count: number;
  conversion_rate: number;
}

/**
 * 获取方式销售统计
 */
export interface MethodSalesStats {
  method_type: string;
  sales_count: number;
  sales_amount: number;
  points_spent: number;
  conversion_rate: number;
}

/**
 * 用户分析数据
 */
export interface UserAnalysis {
  total_users: number;
  new_users: number;
  old_users: number;
  member_users: number;
  repurchase_rate: number;
}

/**
 * 产品排行数据
 */
export interface ProductRanking extends RowDataPacket {
  product_id: number;
  product_title: string;
  sales_count: number;
  sales_amount: number;
  conversion_rate: number;
}

/**
 * 销售查询参数
 */
export interface SalesQueryParams {
  start_date?: string;
  end_date?: string;
  product_id?: number;
}
