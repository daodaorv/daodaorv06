/**
 * 叨叨房车小程序端统一枚举定义
 *
 * 重要说明:
 * 1. 本文件定义所有枚举类型,作为项目的唯一数据源
 * 2. 所有枚举值以小程序端实际使用为准
 * 3. PC管理端必须与本文件保持完全一致
 * 4. 修改枚举值时必须同步更新PC管理端
 */

// ============================================
// 订单相关枚举
// ============================================

/**
 * 订单状态
 */
export enum OrderStatus {
  /** 待支付 */
  PENDING = 'pending',
  /** 已支付 */
  PAID = 'paid',
  /** 已确认 */
  CONFIRMED = 'confirmed',
  /** 待取车 */
  READY = 'ready',
  /** 使用中 */
  IN_USE = 'in_use',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已取消 */
  CANCELLED = 'cancelled',
  /** 已退款 */
  REFUNDED = 'refunded',
}

/**
 * 订单状态映射
 */
export const ORDER_STATUS_MAP = {
  [OrderStatus.PENDING]: { code: 'pending', name: '待支付', color: '#E6A23C' },
  [OrderStatus.PAID]: { code: 'paid', name: '已支付', color: '#409EFF' },
  [OrderStatus.CONFIRMED]: { code: 'confirmed', name: '已确认', color: '#409EFF' },
  [OrderStatus.READY]: { code: 'ready', name: '待取车', color: '#409EFF' },
  [OrderStatus.IN_USE]: { code: 'in_use', name: '使用中', color: '#67C23A' },
  [OrderStatus.COMPLETED]: { code: 'completed', name: '已完成', color: '#909399' },
  [OrderStatus.CANCELLED]: { code: 'cancelled', name: '已取消', color: '#909399' },
  [OrderStatus.REFUNDED]: { code: 'refunded', name: '已退款', color: '#F56C6C' },
} as const

/**
 * 订单支付状态汇总
 */
export enum OrderPaymentStatus {
  /** 未支付 */
  UNPAID = 'unpaid',
  /** 部分支付 */
  PARTIAL = 'partial',
  /** 已支付 */
  PAID = 'paid',
  /** 已退款 */
  REFUNDED = 'refunded',
}

/**
 * 支付记录详细状态
 */
export enum PaymentRecordStatus {
  /** 待支付 */
  PENDING = 'pending',
  /** 支付成功 */
  SUCCESS = 'success',
  /** 支付失败 */
  FAILED = 'failed',
  /** 支付取消 */
  CANCELLED = 'cancelled',
  /** 退款中 */
  REFUNDING = 'refunding',
  /** 已退款 */
  REFUNDED = 'refunded',
}

/**
 * 支付方式
 */
export enum PaymentMethod {
  /** 微信支付 */
  WECHAT = 'wechat',
  /** 支付宝 */
  ALIPAY = 'alipay',
  /** 余额支付 */
  BALANCE = 'balance',
}

// ============================================
// 车辆相关枚举
// ============================================

/**
 * 车辆状态
 */
export enum VehicleStatus {
  /** 可用 */
  AVAILABLE = 'available',
  /** 已出租 */
  RENTED = 'rented',
  /** 维护中 */
  MAINTENANCE = 'maintenance',
  /** 不可用 */
  UNAVAILABLE = 'unavailable',
}

/**
 * 车辆状态映射
 */
export const VEHICLE_STATUS_MAP = {
  [VehicleStatus.AVAILABLE]: { code: 'available', name: '可用', color: '#67C23A' },
  [VehicleStatus.RENTED]: { code: 'rented', name: '已出租', color: '#E6A23C' },
  [VehicleStatus.MAINTENANCE]: { code: 'maintenance', name: '维护中', color: '#909399' },
  [VehicleStatus.UNAVAILABLE]: { code: 'unavailable', name: '不可用', color: '#F56C6C' },
} as const

/**
 * 车辆类型
 */
export enum VehicleType {
  /** 自行式房车 */
  MOTORHOME = 'motorhome',
  /** 拖挂式房车 */
  TRAILER = 'trailer',
  /** 露营车 */
  CAMPER_VAN = 'camper_van',
  /** 休闲车 */
  RV = 'rv',
}

/**
 * 变速箱类型
 */
export enum Transmission {
  /** 手动 */
  MANUAL = 'manual',
  /** 自动 */
  AUTOMATIC = 'automatic',
}

/**
 * 燃料类型
 */
export enum FuelType {
  /** 汽油 */
  GASOLINE = 'gasoline',
  /** 柴油 */
  DIESEL = 'diesel',
  /** 混合动力 */
  HYBRID = 'hybrid',
  /** 电动 */
  ELECTRIC = 'electric',
}

// ============================================
// 托管相关枚举
// ============================================

/**
 * 托管类型
 */
export enum HostingType {
  /** 自有车托管 */
  OWN_VEHICLE = 'own_vehicle',
  /** 购车托管 */
  PURCHASE_VEHICLE = 'purchase_vehicle',
}

/**
 * 托管申请状态
 */
export enum HostingApplicationStatus {
  /** 待审核 */
  PENDING = 'pending',
  /** 已通过 */
  APPROVED = 'approved',
  /** 已拒绝 */
  REJECTED = 'rejected',
}

/**
 * 托管车辆状态
 */
export enum HostingVehicleStatus {
  /** 运营中 */
  ACTIVE = 'active',
  /** 暂停 */
  PAUSED = 'paused',
  /** 已终止 */
  TERMINATED = 'terminated',
}

/**
 * 提现状态
 */
export enum WithdrawalStatus {
  /** 待审核 */
  PENDING = 'pending',
  /** 已通过 */
  APPROVED = 'approved',
  /** 已拒绝 */
  REJECTED = 'rejected',
  /** 已完成 */
  COMPLETED = 'completed',
}

// ============================================
// 用户相关枚举
// ============================================

/**
 * 用户类型
 */
export enum UserType {
  /** C端用户 */
  CUSTOMER = 'customer',
  /** 移动管理员 */
  MOBILE_ADMIN = 'mobile_admin',
  /** PC管理员 */
  PC_ADMIN = 'pc_admin',
}

/**
 * 用户状态
 */
export enum UserStatus {
  /** 激活 */
  ACTIVE = 'active',
  /** 未激活 */
  INACTIVE = 'inactive',
  /** 禁用 */
  BANNED = 'banned',
}

/**
 * 会员类型
 */
export enum MembershipTier {
  /** 普通会员 */
  REGULAR = 'regular',
  /** PLUS会员 */
  PLUS = 'plus',
}

// ============================================
// 众筹相关枚举
// ============================================

/**
 * 众筹项目状态
 */
export enum CrowdfundingProjectStatus {
  /** 筹备中 */
  PREPARING = 'preparing',
  /** 众筹中 */
  FUNDING = 'funding',
  /** 众筹成功 */
  SUCCESS = 'success',
  /** 众筹失败 */
  FAILED = 'failed',
  /** 运营中 */
  OPERATING = 'operating',
  /** 已关闭 */
  CLOSED = 'closed',
}

/**
 * 众筹份额状态
 */
export enum CrowdfundingShareStatus {
  /** 持有中 */
  ACTIVE = 'active',
  /** 已转让 */
  TRANSFERRED = 'transferred',
  /** 已赎回 */
  REDEEMED = 'redeemed',
}

// ============================================
// 优惠券相关枚举
// ============================================

/**
 * 优惠券状态
 */
export enum CouponStatus {
  /** 未使用 */
  UNUSED = 'unused',
  /** 已使用 */
  USED = 'used',
  /** 已过期 */
  EXPIRED = 'expired',
}

/**
 * 优惠券类型
 */
export enum CouponType {
  /** 满减券 */
  FULL_REDUCTION = 'full_reduction',
  /** 折扣券 */
  DISCOUNT = 'discount',
  /** 代金券 */
  CASH = 'cash',
}

// ============================================
// 社区相关枚举
// ============================================

/**
 * 社区内容状态
 */
export enum CommunityContentStatus {
  /** 待审核 */
  PENDING = 'pending',
  /** 已发布 */
  PUBLISHED = 'published',
  /** 已隐藏 */
  HIDDEN = 'hidden',
}

/**
 * 社区内容类型
 */
export enum CommunityContentType {
  /** 图文 */
  IMAGE_TEXT = 'image_text',
  /** 视频 */
  VIDEO = 'video',
}

// ============================================
// 特惠租车相关枚举
// ============================================

/**
 * 特惠套餐状态
 */
export enum SpecialOfferStatus {
  /** 生效中 */
  ACTIVE = 'active',
  /** 未生效 */
  INACTIVE = 'inactive',
  /** 已售罄 */
  SOLD_OUT = 'soldout',
  /** 已过期 */
  EXPIRED = 'expired',
}
