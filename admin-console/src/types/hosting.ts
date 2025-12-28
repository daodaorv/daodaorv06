/**
 * 托管管理相关类型定义
 */

// ==================== 车主自用费用配置 ====================

/**
 * 车主自用费用配置
 */
export interface OwnerUsageFeeConfig {
  id: number
  configName: string // 配置名称
  serviceFeeMin: number // 服务费最小值（元）
  serviceFeeMax: number // 服务费最大值（元）
  serviceFeeDefault: number // 默认服务费（元）
  relocationFee: number // 异地还车费（元）
  relocationFreeCount: number // 每月免费异地还车次数
  maxUsageDaysPerMonth: number // 每月最大自用天数
  advanceNoticeDays: number // 提前申请天数
  enabled: boolean // 是否启用
  effectiveDate: string // 生效日期
  expiryDate?: string // 失效日期
  description?: string // 配置说明
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

/**
 * 车主自用费用配置历史记录
 */
export interface OwnerUsageFeeConfigHistory {
  id: number
  configId: number
  configSnapshot: OwnerUsageFeeConfig // 配置快照
  changeDescription: string // 变更说明
  operatorId: number
  operatorName: string
  createdAt: string
}

/**
 * 车主自用费用配置列表查询参数
 */
export interface OwnerUsageFeeConfigListParams {
  keyword?: string // 关键词搜索
  enabled?: boolean // 状态筛选
  effectiveDateStart?: string // 生效日期开始
  effectiveDateEnd?: string // 生效日期结束
  page?: number
  pageSize?: number
}

// ==================== 淡季补贴配置 ====================

/**
 * 淡季补贴配置
 */
export interface SeasonalSubsidyConfig {
  id: number
  configName: string // 配置名称
  seasonStartDate: string // 淡季开始日期（MM-DD格式）
  seasonEndDate: string // 淡季结束日期（MM-DD格式）
  maxSubsidyAmount: number // 最高补贴金额（元/月）
  calculationFormula: string // 计算公式描述
  minOccupancyRate: number // 最低出租率要求（%）
  enabled: boolean // 是否启用
  effectiveYear: number // 生效年份
  description?: string // 配置说明
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

/**
 * 淡季补贴配置历史记录
 */
export interface SeasonalSubsidyConfigHistory {
  id: number
  configId: number
  configSnapshot: SeasonalSubsidyConfig
  changeDescription: string
  operatorId: number
  operatorName: string
  createdAt: string
}

/**
 * 淡季补贴配置列表查询参数
 */
export interface SeasonalSubsidyConfigListParams {
  keyword?: string // 关键词搜索
  enabled?: boolean // 状态筛选
  effectiveYear?: number // 生效年份筛选
  page?: number
  pageSize?: number
}

/**
 * 补贴计算规则
 */
export interface SubsidyCalculationRule {
  occupancyRate: number // 出租率（%）
  subsidyAmount: number // 补贴金额（元）
}
