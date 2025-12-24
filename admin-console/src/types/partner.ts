/**
 * 合作商管理相关类型定义
 */

// ==================== 门店分润配置 ====================

/**
 * 配置类型
 */
export type StoreProfitConfigType = 'global' | 'store' | 'partner'

/**
 * 门店分润配置
 */
export interface StoreProfitConfig {
  id: number
  configType: StoreProfitConfigType  // 配置类型
  targetId?: number               // 目标ID（门店ID或合作商ID）
  targetName?: string             // 目标名称
  storeProfitRatio: number        // 门店分润比例（%）
  platformProfitRatio: number     // 平台分润比例（%）
  enabled: boolean                // 是否启用
  effectiveDate: string           // 生效日期
  expiryDate?: string             // 失效日期
  description?: string            // 配置说明
  priority: number                // 优先级（数字越大优先级越高）
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

/**
 * 门店分润配置历史记录
 */
export interface StoreProfitConfigHistory {
  id: number
  configId: number
  configSnapshot: StoreProfitConfig
  changeDescription: string
  operatorId: number
  operatorName: string
  createdAt: string
}

/**
 * 门店分润配置列表查询参数
 */
export interface StoreProfitConfigListParams {
  keyword?: string                // 关键词搜索
  configType?: StoreProfitConfigType  // 配置类型筛选
  enabled?: boolean               // 状态筛选
  page?: number
  pageSize?: number
}
