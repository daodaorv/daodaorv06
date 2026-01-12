import { RowDataPacket } from 'mysql2';

/**
 * 获取方式类型
 */
export type MethodType = 'free' | 'points' | 'cash' | 'combo' | 'share' | 'invite';

/**
 * 获取方式配置
 */
export interface AcquisitionMethod extends RowDataPacket {
  id: number;
  coupon_product_id: number;
  method_type: MethodType;
  method_config: string; // JSON字符串
  priority: number;
  is_enabled: number;
  start_time?: Date;
  end_time?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * 免费领取配置
 */
export interface FreeMethodConfig {
  user_type: 'newbie' | 'member' | 'all';
  limit_per_user: number;
  total_limit: number;
}

/**
 * 积分兑换配置
 */
export interface PointsMethodConfig {
  points_required: number;
  limit_per_user: number;
  total_limit: number;
}

/**
 * 现金购买配置
 */
export interface CashMethodConfig {
  price: number;
  original_price: number;
  limit_per_user: number;
  total_limit: number;
}

/**
 * 积分+现金配置
 */
export interface ComboMethodConfig {
  points_required: number;
  cash_required: number;
  limit_per_user: number;
  total_limit: number;
}

/**
 * 分享得券配置
 */
export interface ShareMethodConfig {
  sharer_reward_coupon_id: number;
  sharee_coupon_id: number;
  share_limit_per_user: number;
}

/**
 * 邀请得券配置
 */
export interface InviteMethodConfig {
  inviter_reward_coupons: number[];
  require_first_order: boolean;
}

/**
 * 创建获取方式参数
 */
export interface CreateAcquisitionMethodParams {
  coupon_product_id: number;
  method_type: MethodType;
  method_config: FreeMethodConfig | PointsMethodConfig | CashMethodConfig | ComboMethodConfig | ShareMethodConfig | InviteMethodConfig;
  priority?: number;
  is_enabled?: number;
  start_time?: string;
  end_time?: string;
}

/**
 * 更新获取方式参数
 */
export interface UpdateAcquisitionMethodParams {
  method_config?: FreeMethodConfig | PointsMethodConfig | CashMethodConfig | ComboMethodConfig | ShareMethodConfig | InviteMethodConfig;
  priority?: number;
  is_enabled?: number;
  start_time?: string;
  end_time?: string;
}
