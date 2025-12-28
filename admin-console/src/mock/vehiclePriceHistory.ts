/**
 * 车辆价格历史记录 Mock 数据
 */
import type { VehiclePriceHistory } from '@/types/system'

// 价格历史记录存储
const priceHistoryStore: VehiclePriceHistory[] = [
  {
    id: 1,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    oldPrice: 0,
    newPrice: 500,
    priceChange: 500,
    priceChangePercent: 0,
    changeReason: 'system',
    changeReasonText: '初始价格设置',
    priceSource: 'manual',
    operatorName: '系统管理员',
    createdAt: '2024-01-15 10:00:00',
  },
  {
    id: 2,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    oldPrice: 500,
    newPrice: 550,
    priceChange: 50,
    priceChangePercent: 10,
    changeReason: 'manual',
    changeReasonText: '手动调整价格',
    priceSource: 'manual',
    operatorName: '张三',
    createdAt: '2024-02-20 14:30:00',
  },
  {
    id: 3,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    oldPrice: 550,
    newPrice: 898,
    priceChange: 348,
    priceChangePercent: 63,
    changeReason: 'calculator',
    changeReasonText: '使用基础租金计算器计算',
    priceSource: 'calculated',
    calculationParams: {
      targetAnnualReturn: 0.03,
      residualValueRate: 0.3,
      annualOperatingRate: 0.3,
      operatingCostRate: 0.4,
      conditionPremium: 1.15,
      calculatedAt: '2024-03-10 09:15:00',
    },
    operatorName: '李四',
    createdAt: '2024-03-10 09:15:00',
  },
]

let nextId = 4

/**
 * 获取车辆价格历史记录
 */
export const mockGetVehiclePriceHistory = (
  vehicleId: number
): Promise<{
  code: number
  message: string
  data: VehiclePriceHistory[]
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const history = priceHistoryStore
        .filter(h => h.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      resolve({
        code: 200,
        message: '获取成功',
        data: history,
      })
    }, 300)
  })
}

/**
 * 创建价格历史记录
 */
export const mockCreatePriceHistory = (
  data: Omit<VehiclePriceHistory, 'id' | 'createdAt'>
): Promise<{
  code: number
  message: string
  data: VehiclePriceHistory
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newHistory: VehiclePriceHistory = {
        ...data,
        id: nextId++,
        createdAt: new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          .replace(/\//g, '-'),
      }

      priceHistoryStore.push(newHistory)

      resolve({
        code: 200,
        message: '创建成功',
        data: newHistory,
      })
    }, 200)
  })
}

/**
 * 获取所有车辆的价格历史统计
 */
export const mockGetPriceHistoryStats = (): Promise<{
  code: number
  message: string
  data: {
    totalRecords: number
    totalVehicles: number
    recentChanges: VehiclePriceHistory[]
    avgPriceChange: number
  }
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const uniqueVehicles = new Set(priceHistoryStore.map(h => h.vehicleId))
      const recentChanges = priceHistoryStore
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)

      const totalPriceChange = priceHistoryStore.reduce(
        (sum, h) => sum + Math.abs(h.priceChange),
        0
      )
      const avgPriceChange =
        priceHistoryStore.length > 0 ? Math.round(totalPriceChange / priceHistoryStore.length) : 0

      resolve({
        code: 200,
        message: '获取成功',
        data: {
          totalRecords: priceHistoryStore.length,
          totalVehicles: uniqueVehicles.size,
          recentChanges,
          avgPriceChange,
        },
      })
    }, 300)
  })
}

/**
 * 批量创建价格历史记录
 */
export const mockBatchCreatePriceHistory = (
  records: Array<Omit<VehiclePriceHistory, 'id' | 'createdAt'>>
): Promise<{
  code: number
  message: string
  data: {
    created: number
    records: VehiclePriceHistory[]
  }
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const createdRecords: VehiclePriceHistory[] = []
      const now = new Date()
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(/\//g, '-')

      records.forEach(record => {
        const newHistory: VehiclePriceHistory = {
          ...record,
          id: nextId++,
          createdAt: now,
        }
        priceHistoryStore.push(newHistory)
        createdRecords.push(newHistory)
      })

      resolve({
        code: 200,
        message: `批量创建成功，共 ${createdRecords.length} 条记录`,
        data: {
          created: createdRecords.length,
          records: createdRecords,
        },
      })
    }, 500)
  })
}
