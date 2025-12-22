/**
 * 价格策略相关类型定义
 * 包含：城市因子、时间因子、其他因子、价格计算等
 */

import type { City } from '@/mock/stores'

/**
 * 调整方式
 */
export type AdjustmentType = 'percentage' | 'fixed'

/**
 * 因子类型
 */
export type FactorType = 'city' | 'time' | 'other'

/**
 * 城市分级状态
 */
export type CityTierStatus = 'active' | 'inactive'

/**
 * 城市因子状态
 */
export type CityFactorStatus = 'active' | 'inactive'

// ==================== 城市因子相关类型 ====================

/**
 * 城市分级
 */
export interface CityTier {
  id: number
  tierName: string // 分级名称（如：一线城市、二线城市）
  tierLevel: number // 分级等级（1-5）
  adjustmentType: AdjustmentType // 调整方式
  adjustmentValue: number // 调整值
  description: string // 描述
  status: CityTierStatus // 状态
  cityCount: number // 城市数量
  createdAt: string
  updatedAt: string
}

/**
 * 城市分级列表项
 */
export interface CityTierListItem extends CityTier {
  cities?: City[] // 关联的城市列表（引用 stores.ts 的 City 类型）
}

/**
 * 城市分级表单数据
 */
export interface CityTierFormData {
  tierName: string
  tierLevel: number
  adjustmentType: AdjustmentType
  adjustmentValue: number
  description: string
  status: CityTierStatus
}

/**
 * 自定义城市因子
 */
export interface CityFactor {
  id: number
  factorName: string // 因子名称
  cityIds: number[] // 关联城市ID列表
  cityNames: string[] // 关联城市名称列表
  priority: number // 优先级（1-10，数字越大优先级越高）
  adjustmentType: AdjustmentType // 调整方式
  adjustmentValue: number // 调整值
  startDate: string // 生效日期
  endDate: string // 失效日期
  status: CityFactorStatus // 状态
  remark: string // 备注
  createdBy: string // 创建人
  createdAt: string
  updatedAt: string
}

/**
 * 自定义城市因子列表项
 */
export interface CityFactorListItem extends CityFactor {}

/**
 * 自定义城市因子表单数据
 */
export interface CityFactorFormData {
  factorName: string
  cityIds: number[]
  priority: number
  adjustmentType: AdjustmentType
  adjustmentValue: number
  startDate: string
  endDate: string
  status: CityFactorStatus
  remark: string
}

/**
 * 城市分级列表查询参数
 */
export interface CityTierListParams {
  page?: number
  pageSize?: number
  status?: CityTierStatus
  tierLevel?: number
  keyword?: string
}

/**
 * 城市因子列表查询参数
 */
export interface CityFactorListParams {
  page?: number
  pageSize?: number
  status?: CityFactorStatus
  cityId?: number
  keyword?: string
  startDate?: string
  endDate?: string
}

/**
 * 城市列表查询参数
 */
export interface CityListParams {
  page?: number
  pageSize?: number
  provinceId?: number
  tierId?: number
  isHot?: boolean
  keyword?: string
  status?: 'active' | 'inactive'
}

/**
 * 城市分级列表响应
 */
export interface CityTierListResponse {
  list: CityTierListItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 城市因子列表响应
 */
export interface CityFactorListResponse {
  list: CityFactorListItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 城市列表响应
 */
export interface CityListResponse {
  list: City[]
  total: number
  page: number
  pageSize: number
}

/**
 * 修改城市分级请求数据
 */
export interface UpdateCityTierRequest {
  adjustmentType: AdjustmentType
  adjustmentValue: number
  changeReason: string // 变更原因
  status?: CityTierStatus
}

// ==================== 价格计算相关类型 ====================

/**
 * 价格计算请求
 */
export interface PriceCalculationRequest {
  modelId: number // 车型ID
  cityId: number // 城市ID
  startDate: string // 租车开始日期 YYYY-MM-DD
  endDate: string // 租车结束日期 YYYY-MM-DD

  // 可选参数（用于其他因子判断）
  userId?: number // 用户ID
  memberLevel?: string // 会员等级
  couponCode?: string // 优惠券代码
}

/**
 * 因子详情
 */
export interface FactorDetail {
  factorId: number
  factorName: string
  factorType: FactorType
  adjustmentType: AdjustmentType
  configValue: number // 配置值（百分比或固定金额）
  calculatedAmount: number // 计算后的金额
  priority?: number // 优先级（仅城市和时间因子）
}

/**
 * 每日价格详情
 */
export interface DailyPriceDetail {
  date: string // 日期 YYYY-MM-DD
  basePrice: number // 车型基础价
  cityFactor?: FactorDetail // 城市因子
  timeFactor?: FactorDetail // 时间因子
  otherFactors?: FactorDetail[] // 其他因子
  dailyRental: number // 当日租金
  isHoliday?: boolean // 是否节假日
  holidayName?: string // 节假日名称
}

/**
 * 时间因子详情
 */
export interface TimeFactorDetail {
  averageAmount: number // 平均金额（整个租期）
  dailyDetails: DailyPriceDetail[] // 每天详情
}

/**
 * 价格计算结果
 */
export interface PriceCalculationResult {
  // 基础信息
  modelId: number
  modelName: string
  basePrice: number // 车型基础价
  cityId: number
  cityName: string
  startDate: string
  endDate: string
  rentalDays: number // 租期天数

  // 城市因子
  cityFactor?: FactorDetail

  // 时间因子（使用 timeFactorSummary 以保持向后兼容）
  timeFactorSummary: TimeFactorDetail

  // 其他因子
  otherFactors: FactorDetail[]

  // 计算结果
  averageDailyRental: number // 平均每日租金
  totalPrice: number // 订单总价

  // 计算说明
  calculationExplanation: string // 人类可读的计算过程

  // 计算时间
  calculatedAt: string
}

/**
 * 价格计算响应
 */
export interface PriceCalculationResponse {
  success: boolean
  data: PriceCalculationResult
  message: string
}

/**
 * 价格计算日志
 * 用途：记录每次价格计算，用于问题排查和数据分析
 */
export interface PriceCalculationLog {
  id: number
  orderId?: number // 订单ID（如果是订单计算）
  userId?: number // 用户ID

  // 计算请求
  request: PriceCalculationRequest

  // 计算结果
  result: PriceCalculationResult

  // 元数据
  calculatedBy: string // 计算人（system=系统自动）
  calculatedAt: string // 计算时间
  ipAddress?: string // IP地址
}

/**
 * 价格计算日志列表查询参数
 */
export interface PriceCalculationLogListParams {
  page?: number
  pageSize?: number
  orderId?: number
  userId?: number
  modelId?: number
  startDate?: string
  endDate?: string
  keyword?: string
}

/**
 * 价格计算日志列表响应
 */
export interface PriceCalculationLogListResponse {
  list: PriceCalculationLog[]
  total: number
  page: number
  pageSize: number
}

/**
 * 价格预览请求（用于前端实时预览）
 */
export interface PricePreviewRequest extends PriceCalculationRequest {
  // 继承所有字段
}

/**
 * 价格预览响应
 */
export interface PricePreviewResponse {
  success: boolean
  data: {
    dailyRental: number // 每日租金
    rentalDays: number // 租期天数
    totalPrice: number // 订单总价
    breakdown: {
      basePrice: number
      cityFactorAmount: number
      timeFactorAmount: number
      otherFactorsAmount: number
    }
  }
  message: string
}

/**
 * 价格计算统计
 */
export interface PriceCalculationStatistics {
  totalCalculations: number // 总计算次数
  averagePrice: number // 平均价格
  maxPrice: number // 最高价格
  minPrice: number // 最低价格
  popularModels: Array<{
    modelId: number
    modelName: string
    calculationCount: number
  }>
  popularCities: Array<{
    cityId: number
    cityName: string
    calculationCount: number
  }>
}

/**
 * 价格计算统计查询参数
 */
export interface PriceCalculationStatisticsParams {
  startDate: string
  endDate: string
  modelId?: number
  cityId?: number
}

/**
 * 价格计算统计响应
 */
export interface PriceCalculationStatisticsResponse {
  success: boolean
  data: PriceCalculationStatistics
  message: string
}
