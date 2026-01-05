/**
 * 会员订单相关类型定义
 */

/**
 * 会员等级枚举
 */
export enum MembershipLevel {
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

/**
 * 订单状态枚举
 */
export enum MembershipOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * 会员订单接口
 */
export interface MembershipOrder {
  id: number;
  order_no: string;
  user_id: number;
  membership_level: MembershipLevel;
  duration: number; // 时长（月）
  original_price: number;
  discount_amount: number;
  actual_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  paid_at?: Date;
  status: MembershipOrderStatus;
  remark?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建会员订单参数
 */
export interface CreateMembershipOrderParams {
  user_id: number;
  membership_level: MembershipLevel;
  duration: number;
  original_price: number;
  discount_amount?: number;
  actual_amount: number;
  remark?: string;
}

/**
 * 更新订单支付状态参数
 */
export interface UpdatePaymentStatusParams {
  order_no: string;
  payment_status: PaymentStatus;
  payment_method?: string;
  paid_at?: Date;
}
