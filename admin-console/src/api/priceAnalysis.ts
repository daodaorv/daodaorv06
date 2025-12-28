/**
 * 价格分析 API
 */
import request from '@/utils/request'
import {
  mockGetPriceAnalysisStats,
  mockGetVehiclePricingAnalysis,
  mockGetRevenueForecast,
  mockGetPriceTrendData,
  mockGetSmartPricingSuggestion,
  mockGetBatchPricingSuggestions,
  mockApplySmartPricing,
  mockBatchApplySmartPricing,
} from '@/mock/priceAnalysis'
import type {
  PriceAnalysisStats,
  VehiclePricingAnalysis,
  RevenueForecast,
  PriceTrendData,
  SmartPricingSuggestion,
  BatchPricingSuggestion,
} from '@/types/system'

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.DEV

/**
 * 获取价格分析统计数据
 */
export const getPriceAnalysisStats = async (): Promise<PriceAnalysisStats> => {
  if (USE_MOCK) {
    const result = await mockGetPriceAnalysisStats()
    return result.data
  }
  const response = await request.get('/price-analysis/stats')
  return response.data
}

/**
 * 获取车辆定价分析
 */
export const getVehiclePricingAnalysis = async (params?: {
  modelId?: number
  deviationLevel?: 'normal' | 'high' | 'low'
}): Promise<VehiclePricingAnalysis[]> => {
  if (USE_MOCK) {
    const result = await mockGetVehiclePricingAnalysis(params)
    return result.data
  }
  const response = await request.get('/price-analysis/vehicle-pricing', { params })
  return response.data
}

/**
 * 获取收益预测
 */
export const getRevenueForecast = async (params?: {
  vehicleId?: number
  sortBy?: 'revenue' | 'roi' | 'payback'
}): Promise<RevenueForecast[]> => {
  if (USE_MOCK) {
    const result = await mockGetRevenueForecast(params)
    return result.data
  }
  const response = await request.get('/price-analysis/revenue-forecast', { params })
  return response.data
}

/**
 * 获取价格趋势数据
 */
export const getPriceTrendData = async (params: {
  vehicleId?: number
  modelId?: number
  startDate?: string
  endDate?: string
}): Promise<PriceTrendData[]> => {
  if (USE_MOCK) {
    const result = await mockGetPriceTrendData(params)
    return result.data
  }
  const response = await request.get('/price-analysis/price-trend', { params })
  return response.data
}

/**
 * 获取智能定价建议
 */
export const getSmartPricingSuggestion = async (
  vehicleId: number
): Promise<SmartPricingSuggestion> => {
  if (USE_MOCK) {
    const result = await mockGetSmartPricingSuggestion(vehicleId)
    return result.data
  }
  const response = await request.get(`/smart-pricing/suggestion/${vehicleId}`)
  return response.data
}

/**
 * 批量获取智能定价建议
 */
export const getBatchPricingSuggestions = async (
  vehicleIds: number[]
): Promise<BatchPricingSuggestion> => {
  if (USE_MOCK) {
    const result = await mockGetBatchPricingSuggestions(vehicleIds)
    return result.data
  }
  const response = await request.post('/smart-pricing/batch-suggestions', { vehicleIds })
  return response.data
}

/**
 * 应用智能定价建议
 */
export const applySmartPricing = async (vehicleId: number, strategy: string): Promise<void> => {
  if (USE_MOCK) {
    await mockApplySmartPricing(vehicleId, strategy)
    return
  }
  await request.post('/smart-pricing/apply', { vehicleId, strategy })
}

/**
 * 批量应用智能定价
 */
export const batchApplySmartPricing = async (
  applications: Array<{ vehicleId: number; strategy: string }>
): Promise<void> => {
  if (USE_MOCK) {
    await mockBatchApplySmartPricing(applications)
    return
  }
  await request.post('/smart-pricing/batch-apply', { applications })
}

// 导出类型
export type {
  PriceAnalysisStats,
  VehiclePricingAnalysis,
  RevenueForecast,
  PriceTrendData,
  SmartPricingSuggestion,
  BatchPricingSuggestion,
}
