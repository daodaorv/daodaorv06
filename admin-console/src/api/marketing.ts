/**
 * 营销管理 API
 */
import {
  mockGetPricingStrategyList,
  mockGetCouponList,
  mockGetActivityList,
  mockGetPackageList,
  mockGetTourList,
  mockGetExtraFeeList,
  mockGetMarketingStats,
  mockGetCouponRecordList,
  type PricingStrategy,
  type PricingStrategyListParams,
  type Coupon,
  type CouponListParams,
  type MarketingActivity,
  type ActivityListParams,
  type Package,
  type PackageListParams,
  type Tour,
  type TourListParams,
  type ExtraFee,
  type ExtraFeeListParams,
  type MarketingStats,
  type CouponRecord,
  type CouponRecordListParams,
  type CouponRecordType,
  type CouponRecordSource,
  type ApplicableProductType
} from '@/mock/marketing'

// 导出类型
export type {
  PricingStrategy,
  PricingStrategyListParams,
  Coupon,
  CouponListParams,
  MarketingActivity,
  ActivityListParams,
  Package,
  PackageListParams,
  Tour,
  TourListParams,
  ExtraFee,
  ExtraFeeListParams,
  MarketingStats,
  CouponRecord,
  CouponRecordListParams,
  CouponRecordType,
  CouponRecordSource,
  ApplicableProductType
}

// ==================== 价格策略管理 ====================

/**
 * 获取价格策略列表
 */
export const getPricingStrategyList = (params: PricingStrategyListParams) => {
  // return request.get('/marketing/pricing-strategies', { params })
  return mockGetPricingStrategyList(params)
}

/**
 * 创建价格策略
 */
export const createPricingStrategy = (data: Partial<PricingStrategy>) => {
  // return request.post('/marketing/pricing-strategies', data)
  return Promise.resolve({ success: true, data })
}

/**
 * 更新价格策略
 */
export const updatePricingStrategy = (id: number, data: Partial<PricingStrategy>) => {
  // return request.put(`/marketing/pricing-strategies/${id}`, data)
  return Promise.resolve({ success: true, data })
}

/**
 * 删除价格策略
 */
export const deletePricingStrategy = (_id: number) => {
  // return request.delete(`/marketing/pricing-strategies/${_id}`)
  return Promise.resolve({ success: true })
}

// ==================== 优惠券管理 ====================

/**
 * 获取优惠券列表
 */
export const getCouponList = (params: CouponListParams) => {
  // return request.get('/marketing/coupons', { params })
  return mockGetCouponList(params)
}

/**
 * 创建优惠券
 */
export const createCoupon = (data: Partial<Coupon>) => {
  // return request.post('/marketing/coupons', data)
  return Promise.resolve({ success: true, data })
}

/**
 * 更新优惠券
 */
export const updateCoupon = (id: number, data: Partial<Coupon>) => {
  // return request.put(`/marketing/coupons/${id}`, data)
  return Promise.resolve({ success: true, data })
}

/**
 * 删除优惠券
 */
export const deleteCoupon = (id: number) => {
  // return request.delete(`/marketing/coupons/${id}`)
  return Promise.resolve({ success: true })
}

/**
 * 检查优惠码是否存在
 */
export const checkCouponCodeExists = (code: string) => {
  // return request.get('/marketing/coupons/check-code', { params: { code } })
  return Promise.resolve({ exists: false })
}

/**
 * 批量生成优惠码
 */
export const generateCouponCodes = (params: {
  prefix: string
  count: number
  randomLength: number
}) => {
  // return request.post('/marketing/coupons/generate-codes', params)
  return Promise.resolve({ codes: [] })
}

// ==================== 优惠券记录管理 ====================

/**
 * 获取优惠券记录列表
 */
export const getCouponRecordList = (params: CouponRecordListParams) => {
  // return request.get('/marketing/coupon-records', { params })
  return mockGetCouponRecordList(params)
}

/**
 * 获取优惠券记录详情
 */
export const getCouponRecordDetail = (id: number) => {
  // return request.get(`/marketing/coupon-records/${id}`)
  return Promise.resolve({ data: {} })
}

/**
 * 导出优惠券记录
 */
export const exportCouponRecords = (params: CouponRecordListParams) => {
  // return request.get('/marketing/coupon-records/export', { params, responseType: 'blob' })
  return Promise.resolve()
}

// ==================== 营销活动管理 ====================

/**
 * 获取营销活动列表
 */
export const getActivityList = (params: ActivityListParams) => {
  // return request.get('/marketing/activities', { params })
  return mockGetActivityList(params)
}

// ==================== 特惠套餐管理 ====================

/**
 * 获取特惠套餐列表
 */
export const getPackageList = (params: PackageListParams) => {
  // return request.get('/marketing/packages', { params })
  return mockGetPackageList(params)
}

// ==================== 房车旅游管理 ====================

/**
 * 获取房车旅游列表
 */
export const getTourList = (params: TourListParams) => {
  // return request.get('/marketing/tours', { params })
  return mockGetTourList(params)
}

// ==================== 增值费用管理 ====================

/**
 * 获取增值费用列表
 */
export const getExtraFeeList = (params: ExtraFeeListParams) => {
  // return request.get('/marketing/extra-fees', { params })
  return mockGetExtraFeeList(params)
}

// ==================== 营销统计 ====================

/**
 * 获取营销统计
 */
export const getMarketingStats = () => {
  // return request.get('/marketing/stats')
  return mockGetMarketingStats()
}
