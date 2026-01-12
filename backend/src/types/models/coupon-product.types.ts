import { RowDataPacket } from 'mysql2';

/**
 * 展示位置类型
 */
export type DisplayPosition = 'newbie' | 'hot' | 'limited';

/**
 * 优惠券产品状态
 */
export type CouponProductStatus = 'active' | 'inactive';

/**
 * 获取方式类型
 */
export type MethodType = 'free' | 'points' | 'cash' | 'combo' | 'share' | 'invite';

/**
 * 优惠券产品
 */
export interface CouponProduct extends RowDataPacket {
  id: number;
  coupon_id: number;
  product_title: string;
  product_description?: string;
  product_image?: string;
  display_position?: DisplayPosition;
  special_tags?: string[];
  display_order: number;
  status: CouponProductStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * 优惠券产品详情(包含关联信息)
 */
export interface CouponProductDetail extends CouponProduct {
  // 关联的优惠券信息
  coupon_name?: string;
  coupon_type?: string;
  coupon_amount?: number;
  coupon_rate?: number;
}

/**
 * 创建优惠券产品参数
 */
export interface CreateCouponProductParams {
  coupon_id: number;
  product_title: string;
  product_description?: string;
  product_image?: string;
  display_position?: DisplayPosition;
  special_tags?: string[];
  display_order?: number;
}

/**
 * 更新优惠券产品参数
 */
export interface UpdateCouponProductParams {
  product_title?: string;
  product_description?: string;
  product_image?: string;
  display_position?: DisplayPosition;
  special_tags?: string[];
  display_order?: number;
  status?: CouponProductStatus;
}

/**
 * 优惠券产品查询参数
 */
export interface CouponProductQueryParams {
  status?: CouponProductStatus;
  display_position?: DisplayPosition;
  page?: number;
  pageSize?: number;
}
