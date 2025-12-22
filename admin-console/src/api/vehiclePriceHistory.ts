/**
 * 车辆价格历史 API
 */
import request from '@/utils/request'
import {
  mockGetVehiclePriceHistory,
  mockCreatePriceHistory,
  mockGetPriceHistoryStats,
  mockBatchCreatePriceHistory,
} from '@/mock/vehiclePriceHistory'
import type { VehiclePriceHistory } from '@/types/system'

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.DEV

/**
 * 获取车辆价格历史记录
 */
export const getVehiclePriceHistory = async (vehicleId: number): Promise<VehiclePriceHistory[]> => {
  if (USE_MOCK) {
    const result = await mockGetVehiclePriceHistory(vehicleId)
    return result.data
  }
  const response = await request.get(`/vehicles/${vehicleId}/price-history`)
  return response.data
}

/**
 * 创建价格历史记录
 */
export const createPriceHistory = async (
  data: Omit<VehiclePriceHistory, 'id' | 'createdAt'>
): Promise<VehiclePriceHistory> => {
  if (USE_MOCK) {
    const result = await mockCreatePriceHistory(data)
    return result.data
  }
  const response = await request.post('/vehicles/price-history', data)
  return response.data
}

/**
 * 获取价格历史统计
 */
export const getPriceHistoryStats = async (): Promise<{
  totalRecords: number
  totalVehicles: number
  recentChanges: VehiclePriceHistory[]
  avgPriceChange: number
}> => {
  if (USE_MOCK) {
    const result = await mockGetPriceHistoryStats()
    return result.data
  }
  const response = await request.get('/vehicles/price-history/stats')
  return response.data
}

/**
 * 批量创建价格历史记录
 */
export const batchCreatePriceHistory = async (
  records: Array<Omit<VehiclePriceHistory, 'id' | 'createdAt'>>
): Promise<{
  created: number
  records: VehiclePriceHistory[]
}> => {
  if (USE_MOCK) {
    const result = await mockBatchCreatePriceHistory(records)
    return result.data
  }
  const response = await request.post('/vehicles/price-history/batch', { records })
  return response.data
}

// 导出类型
export type { VehiclePriceHistory }
