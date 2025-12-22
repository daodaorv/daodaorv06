/**
 * 车型价格管理相关类型定义
 */

/**
 * 价格变更类型
 */
export type PriceChangeType = 'manual' | 'batch'

/**
 * 车型价格变更历史
 * 用途：审计追踪，记录每次价格调整
 */
export interface VehicleModelPriceHistory {
  id: number
  modelId: number // 车型ID
  modelName: string // 车型名称
  oldPrice: number // 原价格
  newPrice: number // 新价格
  changeType: PriceChangeType // 变更类型
  changeReason: string // 变更原因
  remark?: string // 备注
  changedBy: string // 变更人
  changedAt: string // 变更时间
}

/**
 * 车型价格变更历史列表查询参数
 */
export interface VehicleModelPriceHistoryListParams {
  page?: number
  pageSize?: number
  modelId?: number
  startDate?: string
  endDate?: string
  changeType?: PriceChangeType
  operatorId?: number
  keyword?: string
}

/**
 * 车型价格变更历史列表响应
 */
export interface VehicleModelPriceHistoryListResponse {
  list: VehicleModelPriceHistory[]
  total: number
  page: number
  pageSize: number
}

/**
 * 更新车型价格请求
 */
export interface UpdateModelPriceRequest {
  modelId: number
  newPrice: number
  changeReason: string
  remark?: string
}

/**
 * 更新车型价格响应
 */
export interface UpdateModelPriceResponse {
  success: boolean
  data: {
    model: any // VehicleModel 类型在 vehicles.ts 中定义
    priceHistory: VehicleModelPriceHistory
  }
  message: string
}

/**
 * 批量调价方式
 */
export type BatchAdjustType = 'percentage' | 'fixed' | 'unified'

/**
 * 批量更新车型价格请求
 */
export interface BatchUpdatePriceRequest {
  modelIds: number[]
  adjustType: BatchAdjustType
  adjustValue: number
  changeReason: string
  remark?: string
}

/**
 * 批量更新车型价格响应
 */
export interface BatchUpdatePriceResponse {
  success: boolean
  data: {
    successCount: number
    failureCount: number
    successModels: any[] // VehicleModel[]
    failureModels: Array<{
      modelId: number
      modelName: string
      reason: string
    }>
    priceHistories: VehicleModelPriceHistory[]
  }
  message: string
}
