/**
 * 系统配置模块 Mock 数据
 */
import type { BaseRentalCalculationConfig } from '@/types/system'

/**
 * 基础租金计算参数配置 Mock 数据
 */
export const mockCalculationConfigs: BaseRentalCalculationConfig[] = [
  // 财务参数
  {
    id: 1,
    configKey: 'TARGET_ANNUAL_RETURN',
    configName: '目标年化收益率',
    configValue: 3.0,
    unit: '%',
    description: '投资回报的目标年化收益率',
    category: 'financial',
    isEditable: true,
    updatedAt: '2024-12-21 10:00:00',
    updatedBy: '系统管理员',
  },
  {
    id: 2,
    configKey: 'INVESTMENT_PERIOD',
    configName: '投资周期',
    configValue: 5,
    unit: '年',
    description: '车辆投资的预期使用年限',
    category: 'financial',
    isEditable: true,
    updatedAt: '2024-12-21 10:00:00',
    updatedBy: '系统管理员',
  },
  {
    id: 3,
    configKey: 'RESIDUAL_VALUE_RATE',
    configName: '残值率',
    configValue: 30.0,
    unit: '%',
    description: '车辆在投资周期结束后的残值占购买价格的比例',
    category: 'financial',
    isEditable: true,
    updatedAt: '2024-12-21 10:00:00',
    updatedBy: '系统管理员',
  },

  // 运营参数
  {
    id: 4,
    configKey: 'ANNUAL_OPERATING_RATE',
    configName: '年运营率',
    configValue: 30.0,
    unit: '%',
    description: '车辆每年实际出租天数占全年的比例(365天×30%=109.5天)',
    category: 'operational',
    isEditable: true,
    updatedAt: '2024-12-21 10:00:00',
    updatedBy: '系统管理员',
  },
  {
    id: 5,
    configKey: 'OPERATING_COST_RATE',
    configName: '运营成本占比',
    configValue: 40.0,
    unit: '%',
    description: '运营成本(维护、保险、管理等)占总营收的比例',
    category: 'operational',
    isEditable: true,
    updatedAt: '2024-12-21 10:00:00',
    updatedBy: '系统管理员',
  },
]

/**
 * 获取计算参数配置列表
 */
export const mockGetCalculationConfigs = (params?: {
  category?: 'financial' | 'operational' | 'condition'
}) => {
  let filteredData = [...mockCalculationConfigs]

  if (params?.category) {
    filteredData = filteredData.filter(item => item.category === params.category)
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: filteredData,
  })
}

/**
 * 更新计算参数配置
 */
export const mockUpdateCalculationConfig = (
  id: number,
  data: { configValue: number; updatedBy: string }
) => {
  const index = mockCalculationConfigs.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '配置项不存在',
    })
  }

  // 参数范围验证
  const config = mockCalculationConfigs[index]
  if (config.configKey === 'TARGET_ANNUAL_RETURN' && (data.configValue < 0 || data.configValue > 50)) {
    return Promise.reject({
      code: 400,
      message: '目标年化收益率必须在0-50%之间',
    })
  }

  if (config.configKey === 'RESIDUAL_VALUE_RATE' && (data.configValue < 0 || data.configValue > 100)) {
    return Promise.reject({
      code: 400,
      message: '残值率必须在0-100%之间',
    })
  }

  if (config.configKey === 'ANNUAL_OPERATING_RATE' && (data.configValue <= 0 || data.configValue > 100)) {
    return Promise.reject({
      code: 400,
      message: '年运营率必须在0-100%之间',
    })
  }

  if (config.configKey === 'OPERATING_COST_RATE' && (data.configValue < 0 || data.configValue >= 100)) {
    return Promise.reject({
      code: 400,
      message: '运营成本占比必须在0-100%之间(不含100%)',
    })
  }

  mockCalculationConfigs[index] = {
    ...mockCalculationConfigs[index],
    configValue: data.configValue,
    updatedAt: new Date().toLocaleString('zh-CN'),
    updatedBy: data.updatedBy,
  }

  return Promise.resolve({
    code: 200,
    message: '更新成功',
    data: mockCalculationConfigs[index],
  })
}

/**
 * 重置计算参数配置为默认值
 */
export const mockResetCalculationConfig = (id: number) => {
  const index = mockCalculationConfigs.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '配置项不存在',
    })
  }

  const config = mockCalculationConfigs[index]
  const defaultValues: Record<string, number> = {
    TARGET_ANNUAL_RETURN: 3.0,
    INVESTMENT_PERIOD: 5,
    RESIDUAL_VALUE_RATE: 30.0,
    ANNUAL_OPERATING_RATE: 30.0,
    OPERATING_COST_RATE: 40.0,
  }

  const defaultValue = defaultValues[config.configKey]
  if (defaultValue === undefined) {
    return Promise.reject({
      code: 400,
      message: '该配置项没有默认值',
    })
  }

  mockCalculationConfigs[index] = {
    ...mockCalculationConfigs[index],
    configValue: defaultValue,
    updatedAt: new Date().toLocaleString('zh-CN'),
    updatedBy: '系统',
  }

  return Promise.resolve({
    code: 200,
    message: '重置成功',
    data: mockCalculationConfigs[index],
  })
}

/**
 * 批量重置所有参数为默认值
 */
export const mockResetAllCalculationConfigs = () => {
  const defaultValues: Record<string, number> = {
    TARGET_ANNUAL_RETURN: 3.0,
    INVESTMENT_PERIOD: 5,
    RESIDUAL_VALUE_RATE: 30.0,
    ANNUAL_OPERATING_RATE: 30.0,
    OPERATING_COST_RATE: 40.0,
  }

  mockCalculationConfigs.forEach((config, index) => {
    const defaultValue = defaultValues[config.configKey]
    if (defaultValue !== undefined) {
      mockCalculationConfigs[index] = {
        ...config,
        configValue: defaultValue,
        updatedAt: new Date().toLocaleString('zh-CN'),
        updatedBy: '系统',
      }
    }
  })

  return Promise.resolve({
    code: 200,
    message: '批量重置成功',
    data: mockCalculationConfigs,
  })
}
