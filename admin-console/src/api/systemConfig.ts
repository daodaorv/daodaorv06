/**
 * 系统配置 API
 */
import request from '@/utils/request'
import {
  mockGetCalculationConfigs,
  mockUpdateCalculationConfig,
  mockResetCalculationConfig,
  mockResetAllCalculationConfigs,
} from '@/mock/systemConfig'
import type { BaseRentalCalculationConfig } from '@/types/system'

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.DEV

/**
 * 获取基础租金计算参数配置列表
 */
export const getCalculationConfigs = async (params?: {
  category?: 'financial' | 'operational' | 'condition'
}): Promise<BaseRentalCalculationConfig[]> => {
  if (USE_MOCK) {
    const result = await mockGetCalculationConfigs(params)
    return result.data
  }
  const response = await request.get('/system/calculation-configs', { params })
  return response.data
}

/**
 * 更新计算参数配置
 */
export const updateCalculationConfig = async (
  id: number,
  data: { configValue: number; updatedBy: string }
): Promise<BaseRentalCalculationConfig> => {
  if (USE_MOCK) {
    const result = await mockUpdateCalculationConfig(id, data)
    return result.data
  }
  const response = await request.put(`/system/calculation-configs/${id}`, data)
  return response.data
}

/**
 * 重置单个参数为默认值
 */
export const resetCalculationConfig = async (id: number): Promise<BaseRentalCalculationConfig> => {
  if (USE_MOCK) {
    const result = await mockResetCalculationConfig(id)
    return result.data
  }
  const response = await request.post(`/system/calculation-configs/${id}/reset`)
  return response.data
}

/**
 * 批量重置所有参数为默认值
 */
export const resetAllCalculationConfigs = async (): Promise<BaseRentalCalculationConfig[]> => {
  if (USE_MOCK) {
    const result = await mockResetAllCalculationConfigs()
    return result.data
  }
  const response = await request.post('/system/calculation-configs/reset-all')
  return response.data
}

// 导出类型
export type { BaseRentalCalculationConfig }
