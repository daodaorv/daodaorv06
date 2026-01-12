/**
 * 特惠商城管理 API
 */
import request from '@/utils/request'

// ==================== 类型定义 ====================

/**
 * 展示位置
 */
export type DisplayPosition = 'newbie' | 'hot' | 'limited'

/**
 * 产品状态
 */
export type ProductStatus = 'active' | 'inactive'

/**
 * 获取方式类型
 */
export type MethodType = 'free' | 'points' | 'cash' | 'combo' | 'share' | 'invite'

/**
 * 优惠券产品
 */
export interface CouponProduct {
  id: number
  coupon_id: number
  product_title: string
  product_description: string
  product_image: string
  display_position: DisplayPosition
  special_tags: string[]
  display_order: number
  status: ProductStatus
  created_at: string
  updated_at: string
  // 关联的优惠券信息
  coupon_name?: string
  coupon_type?: string
  coupon_amount?: number
}

/**
 * 优惠券产品详情
 */
export interface CouponProductDetail extends CouponProduct {
  acquisition_methods: AcquisitionMethod[]
  inventory: CouponInventory | null
  purchase_limits: PurchaseLimit[]
}

/**
 * 获取方式配置
 */
export interface AcquisitionMethod {
  id: number
  coupon_product_id: number
  method_type: MethodType
  method_config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 优惠券库存
 */
export interface CouponInventory {
  id: number
  coupon_product_id: number
  total_stock: number
  available_stock: number
  sold_count: number
  reserved_count: number
  created_at: string
  updated_at: string
}

/**
 * 限购规则
 */
export interface PurchaseLimit {
  id: number
  coupon_product_id: number
  limit_type: 'daily' | 'weekly' | 'monthly' | 'total'
  limit_count: number
  created_at: string
  updated_at: string
}

/**
 * 销售概览
 */
export interface SalesOverview {
  total_sales_amount: number
  total_points_spent: number
  total_sales_count: number
  conversion_rate: number
}

/**
 * 获取方式销售统计
 */
export interface MethodSalesStats {
  method_type: MethodType
  sales_count: number
  sales_amount: number
  points_spent: number
  conversion_rate: number
}

// ==================== 请求参数类型 ====================

export interface CouponProductListParams {
  status?: ProductStatus
  display_position?: DisplayPosition
  page?: number
  pageSize?: number
}

export interface CreateCouponProductParams {
  coupon_id: number
  product_title: string
  product_description: string
  product_image: string
  display_position: DisplayPosition
  special_tags: string[]
  display_order: number
  status: ProductStatus
}

export interface UpdateCouponProductParams extends Partial<CreateCouponProductParams> {}

export interface CreateAcquisitionMethodParams {
  method_type: MethodType
  method_config: Record<string, any>
  is_active: boolean
}

export interface UpdateAcquisitionMethodParams extends Partial<CreateAcquisitionMethodParams> {}

export interface CreateInventoryParams {
  total_stock: number
  available_stock: number
}

export interface UpdateInventoryParams extends Partial<CreateInventoryParams> {}

export interface ReplenishInventoryParams {
  quantity: number
}

export interface CreatePurchaseLimitParams {
  limit_type: 'daily' | 'weekly' | 'monthly' | 'total'
  limit_count: number
}

export interface SalesQueryParams {
  product_id?: number
  start_date?: string
  end_date?: string
}

// ==================== API 函数 ====================

/**
 * 1. 优惠券产品管理
 */

// 获取优惠券产品列表
export const getCouponProductList = (params: CouponProductListParams) => {
  return request({
    url: '/v1/admin/coupon-products',
    method: 'get',
    params,
  })
}

// 获取优惠券产品详情
export const getCouponProductDetail = (id: number) => {
  return request({
    url: `/v1/admin/coupon-products/${id}`,
    method: 'get',
  })
}

// 创建优惠券产品
export const createCouponProduct = (data: CreateCouponProductParams) => {
  return request({
    url: '/v1/admin/coupon-products',
    method: 'post',
    data,
  })
}

// 更新优惠券产品
export const updateCouponProduct = (id: number, data: UpdateCouponProductParams) => {
  return request({
    url: `/v1/admin/coupon-products/${id}`,
    method: 'put',
    data,
  })
}

// 删除优惠券产品
export const deleteCouponProduct = (id: number) => {
  return request({
    url: `/v1/admin/coupon-products/${id}`,
    method: 'delete',
  })
}

// 批量更新产品状态
export const batchUpdateProductStatus = (ids: number[], status: ProductStatus) => {
  return request({
    url: '/v1/admin/coupon-products/batch-status',
    method: 'post',
    data: { ids, status },
  })
}

// 调整产品排序
export const reorderProducts = (orders: { id: number; display_order: number }[]) => {
  return request({
    url: '/v1/admin/coupon-products/reorder',
    method: 'post',
    data: { orders },
  })
}

/**
 * 2. 获取方式配置
 */

// 获取产品的获取方式列表
export const getAcquisitionMethods = (productId: number) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/acquisition-methods`,
    method: 'get',
  })
}

// 创建获取方式
export const createAcquisitionMethod = (productId: number, data: CreateAcquisitionMethodParams) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/acquisition-methods`,
    method: 'post',
    data,
  })
}

// 更新获取方式
export const updateAcquisitionMethod = (
  productId: number,
  methodId: number,
  data: UpdateAcquisitionMethodParams
) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/acquisition-methods/${methodId}`,
    method: 'put',
    data,
  })
}

// 切换获取方式状态
export const toggleAcquisitionMethod = (productId: number, methodId: number) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/acquisition-methods/${methodId}/toggle`,
    method: 'post',
  })
}

/**
 * 3. 库存与限购配置
 */

// 获取产品库存信息
export const getInventory = (productId: number) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/inventory`,
    method: 'get',
  })
}

// 创建库存配置
export const createInventory = (productId: number, data: CreateInventoryParams) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/inventory`,
    method: 'post',
    data,
  })
}

// 更新库存配置
export const updateInventory = (productId: number, data: UpdateInventoryParams) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/inventory`,
    method: 'put',
    data,
  })
}

// 补充库存
export const replenishInventory = (productId: number, data: ReplenishInventoryParams) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/inventory/replenish`,
    method: 'post',
    data,
  })
}

// 获取限购规则
export const getPurchaseLimits = (productId: number) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/purchase-limits`,
    method: 'get',
  })
}

// 创建限购规则
export const createPurchaseLimit = (productId: number, data: CreatePurchaseLimitParams) => {
  return request({
    url: `/v1/admin/coupon-products/${productId}/purchase-limits`,
    method: 'post',
    data,
  })
}

/**
 * 4. 销售数据统计
 */

// 获取销售概览
export const getSalesOverview = (params: SalesQueryParams) => {
  return request({
    url: '/v1/admin/coupon-products/sales/overview',
    method: 'get',
    params,
  })
}

// 获取获取方式销售统计
export const getMethodSalesStats = (params: SalesQueryParams) => {
  return request({
    url: '/v1/admin/coupon-products/sales/by-method',
    method: 'get',
    params,
  })
}
