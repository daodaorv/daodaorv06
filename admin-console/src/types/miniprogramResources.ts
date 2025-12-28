/**
 * 小程序资源管理类型定义
 */

// ==================== 图片资源类型 ====================

/**
 * 轮播图
 */
export interface Banner {
  id: number
  type: 'home' | 'hosting' // 轮播图类型：首页/托管中心
  image: string // 图片URL
  link?: string // 跳转链接（可选）
  sortOrder: number // 排序权重（数字越大越靠前）
  isEnabled: boolean // 是否启用
  startTime?: string // 生效开始时间（可选）
  endTime?: string // 生效结束时间（可选）
  createdAt: string
  updatedAt: string
}

/**
 * 推广卡片
 */
export interface PromoCard {
  id: number
  title: string // 卡片标题
  subtitle: string // 副标题
  image: string // 背景图片URL
  route: string // 跳转路径
  sortOrder: number // 排序权重
  isEnabled: boolean // 是否启用
  createdAt: string
  updatedAt: string
}

// ==================== 文本内容类型 ====================

/**
 * 公告类型
 */
export type NoticeType = 'info' | 'warning' | 'promotion'

/**
 * 公告
 */
export interface Notice {
  id: number
  content: string // 公告内容（建议50字以内）
  type: NoticeType // 公告类型
  link?: string // 跳转链接（可选）
  sortOrder: number // 排序权重
  isEnabled: boolean // 是否启用
  startTime?: string // 生效开始时间
  endTime?: string // 生效结束时间
  createdAt: string
  updatedAt: string
}

/**
 * 协议类型
 */
export type AgreementType = 'user_agreement' | 'privacy_policy' | 'cancellation_policy'

/**
 * 协议
 */
export interface Agreement {
  id: number
  type: AgreementType
  title: string // 协议标题
  content: string // 协议内容（富文本HTML）
  version: string // 版本号（如：v1.0.0）
  effectiveDate: string // 生效日期
  requireRead: boolean // 是否强制阅读
  createdAt: string
  updatedAt: string
}

// ==================== 配置管理类型 ====================

/**
 * 会员权益项
 */
export interface MembershipBenefit {
  name: string // 权益名称
  description: string // 权益描述
  icon: string // 图标名称
}

/**
 * 会员配置
 */
export interface MembershipConfig {
  price: number // 会员年费（元）
  duration: number // 会员时长（天）
  discount: number // 折扣比例（0.95表示95折）
  benefits: MembershipBenefit[] // 权益列表
}

/**
 * 服务菜单项
 */
export interface ServiceMenuItem {
  id: string
  name: string // 服务名称
  icon: string // 图标名称
  path: string // 跳转路径
  sortOrder: number // 排序权重
  isEnabled: boolean // 是否启用
}

/**
 * 应用基础配置
 */
export interface AppConfig {
  servicePhone: string // 客服电话
  serviceWechat?: string // 客服微信
  companyAddress: string // 公司地址
  businessHours: string // 营业时间
  aboutUs: string // 关于我们（富文本）
  version: string // 版本号
}

// ==================== 表单数据类型 ====================

/**
 * 轮播图表单数据
 */
export interface BannerFormData {
  id?: number
  type: 'home' | 'hosting'
  images: string[] // 图片数组（单张）
  link?: string
  sortOrder: number
  isEnabled: boolean
  timeRange?: [string, string] // 时间范围
}

/**
 * 推广卡片表单数据
 */
export interface PromoCardFormData {
  id?: number
  title: string
  subtitle: string
  images: string[] // 图片数组（单张）
  route: string
  sortOrder: number
  isEnabled: boolean
}

/**
 * 公告表单数据
 */
export interface NoticeFormData {
  id?: number
  content: string
  type: NoticeType
  link?: string
  sortOrder: number
  isEnabled: boolean
  timeRange?: [string, string]
}

/**
 * 协议表单数据
 */
export interface AgreementFormData {
  type: AgreementType
  title: string
  content: string
  version: string
  effectiveDate: string
  requireRead: boolean
}
