import { RowDataPacket } from 'mysql2';

/**
 * 优惠券库存
 */
export interface CouponInventory extends RowDataPacket {
  id: number;
  coupon_product_id: number;
  total_stock: number;
  sold_count: number;
  remaining_stock: number;
  warning_threshold: number;
  auto_offline_when_empty: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * 限购规则
 */
export interface PurchaseLimit extends RowDataPacket {
  id: number;
  coupon_product_id: number;
  method_type: string;
  limit_per_user: number;
  limit_period: 'daily' | 'weekly' | 'monthly' | 'total';
  user_type: 'all' | 'newbie' | 'member';
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建库存参数
 */
export interface CreateInventoryParams {
  coupon_product_id: number;
  total_stock: number;
  warning_threshold?: number;
  auto_offline_when_empty?: number;
}

/**
 * 更新库存参数
 */
export interface UpdateInventoryParams {
  total_stock?: number;
  warning_threshold?: number;
  auto_offline_when_empty?: number;
}

/**
 * 补充库存参数
 */
export interface ReplenishInventoryParams {
  quantity: number;
  reason: string;
}

/**
 * 创建限购规则参数
 */
export interface CreatePurchaseLimitParams {
  coupon_product_id: number;
  method_type: string;
  limit_per_user: number;
  limit_period?: 'daily' | 'weekly' | 'monthly' | 'total';
  user_type?: 'all' | 'newbie' | 'member';
}
