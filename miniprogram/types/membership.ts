/**
 * 会员相关类型定义
 */

/**
 * 会员等级
 */
export type MembershipLevel = 'basic' | 'silver' | 'gold' | 'platinum'

/**
 * 会员权益
 */
export interface MembershipBenefit {
  /** 权益ID */
  id: string
  /** 权益名称 */
  name: string
  /** 权益描述 */
  description: string
  /** 权益图标 */
  icon: string
}

/**
 * 会员套餐
 */
export interface MembershipPlan {
  /** 套餐ID */
  id: string
  /** 套餐名称 */
  name: string
  /** 套餐等级 */
  level: MembershipLevel
  /** 套餐时长（月） */
  duration: number
  /** 原价 */
  originalPrice: number
  /** 现价 */
  currentPrice: number
  /** 权益列表 */
  benefits: MembershipBenefit[]
  /** 是否推荐 */
  recommended?: boolean
}

/**
 * 支付参数
 */
export interface PaymentParams {
  /** 支付方式 */
  method: 'wechat' | 'alipay'
  /** 支付金额 */
  amount: number
  /** 其他参数 */
  [key: string]: unknown
}

/**
 * 购买会员参数
 */
export interface PurchaseMembershipParams {
  /** 套餐ID */
  planId: string
  /** 支付参数 */
  paymentParams?: PaymentParams
}
