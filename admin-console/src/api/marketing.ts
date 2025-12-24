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
  mockCreateExtraFee,
  mockUpdateExtraFee,
  mockDeleteExtraFee,
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
  type SpecialOffer,
  type SpecialOfferStatus,
  type Tour,
  type TourListParams,
  type TourStatus,
  type BatchStatus,
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
  SpecialOffer,
  SpecialOfferStatus,
  Tour,
  TourListParams,
  TourStatus,
  BatchStatus,
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
export const deleteCoupon = (_id: number) => {
  // return request.delete(`/marketing/coupons/${id}`)
  return Promise.resolve({ success: true })
}

/**
 * 检查优惠码是否存在
 */
export const checkCouponCodeExists = (_code: string) => {
  // return request.get('/marketing/coupons/check-code', { params: { code } })
  return Promise.resolve({ exists: false })
}

/**
 * 批量生成优惠码
 */
export const generateCouponCodes = (_params: {
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
export const getCouponRecordDetail = (_id: number) => {
  // return request.get(`/marketing/coupon-records/${id}`)
  return Promise.resolve({ data: {} })
}

/**
 * 导出优惠券记录
 */
export const exportCouponRecords = (_params: CouponRecordListParams) => {
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

// ==================== 特惠租车管理 ====================

/**
 * 获取特惠租车列表
 */
export const getSpecialOfferList = (params: PackageListParams) => {
  // return request.get('/marketing/special-offers', { params })
  return mockGetPackageList(params)
}

// 兼容旧的函数名
export const getPackageList = getSpecialOfferList

/**
 * 创建特惠租车
 */
export const createSpecialOffer = (data: Partial<SpecialOffer>) => {
  // return request.post('/marketing/special-offers', data)
  return Promise.resolve({ success: true, data })
}

/**
 * 更新特惠租车
 */
export const updateSpecialOffer = (id: number, data: Partial<SpecialOffer>) => {
  // return request.put(`/marketing/special-offers/${id}`, data)
  return Promise.resolve({ success: true, data })
}

/**
 * 删除特惠租车
 */
export const deleteSpecialOffer = (id: number) => {
  // return request.delete(`/marketing/special-offers/${id}`)
  return Promise.resolve({ success: true })
}

// ==================== 房车旅游管理 ====================

/**
 * 获取房车旅游列表
 */
export const getTourList = (params: TourListParams) => {
  // return request.get('/marketing/tours', { params })
  return mockGetTourList(params)
}

/**
 * 创建房车旅游线路
 */
export const createTour = (data: Partial<Tour>) => {
  // return request.post('/marketing/tours', data)
  return Promise.resolve({ success: true, data })
}

/**
 * 更新房车旅游线路
 */
export const updateTour = (id: number, data: Partial<Tour>) => {
  // return request.put(`/marketing/tours/${id}`, data)
  return Promise.resolve({ success: true, data })
}

/**
 * 删除房车旅游线路
 */
export const deleteTour = (id: number) => {
  // return request.delete(`/marketing/tours/${id}`)
  return Promise.resolve({ success: true })
}

// ==================== 增值费用管理 ====================

/**
 * 获取增值费用列表
 */
export const getExtraFeeList = (params: ExtraFeeListParams) => {
  // return request.get('/marketing/extra-fees', { params })
  return mockGetExtraFeeList(params)
}

/**
 * 创建增值费用
 */
export const createExtraFee = (data: Partial<ExtraFee>) => {
  // return request.post('/marketing/extra-fees', data)
  return mockCreateExtraFee(data)
}

/**
 * 更新增值费用
 */
export const updateExtraFee = (id: number, data: Partial<ExtraFee>) => {
  // return request.put(`/marketing/extra-fees/${id}`, data)
  return mockUpdateExtraFee(id, data)
}

/**
 * 删除增值费用
 */
export const deleteExtraFee = (id: number) => {
  // return request.delete(`/marketing/extra-fees/${id}`)
  return mockDeleteExtraFee(id)
}

// ==================== 特殊费用管理 ====================

/**
 * 获取特殊费用列表
 */
export const getSpecialFeeList = (params: ExtraFeeListParams) => {
  // return request.get('/marketing/special-fees', { params })
  // 筛选特殊费用类型
  return mockGetExtraFeeList({ ...params, type: 'special' })
}

/**
 * 创建特殊费用
 */
export const createSpecialFee = (data: Partial<ExtraFee>) => {
  // return request.post('/marketing/special-fees', data)
  return mockCreateExtraFee({ ...data, type: 'special' })
}

/**
 * 更新特殊费用
 */
export const updateSpecialFee = (id: number, data: Partial<ExtraFee>) => {
  // return request.put(`/marketing/special-fees/${id}`, data)
  return mockUpdateExtraFee(id, data)
}

/**
 * 删除特殊费用
 */
export const deleteSpecialFee = (id: number) => {
  // return request.delete(`/marketing/special-fees/${id}`)
  return mockDeleteExtraFee(id)
}

/**
 * 计算特殊费用预览
 * @param data 特殊费用配置和订单信息
 * @returns 预览结果(包含计算后的金额和分配明细)
 */
export const calculateSpecialFeePreview = (data: {
  extraFee: Partial<ExtraFee>
  pickupStoreId: number
  returnStoreId: number
}) => {
  // return request.post('/marketing/special-fees/preview', data)
  return new Promise((resolve) => {
    setTimeout(() => {
      // 这里可以调用费用分配计算工具进行预览计算
      resolve({
        code: 200,
        message: '计算成功',
        data: {
          totalAmount: 0,
          allocations: []
        }
      })
    }, 200)
  })
}

// ==================== 营销统计 ====================

/**
 * 获取营销统计
 */
export const getMarketingStats = () => {
  // return request.get('/marketing/stats')
  return mockGetMarketingStats()
}
