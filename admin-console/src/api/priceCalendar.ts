/**
 * 价格日历 API
 * 提供价格日历查询、单日价格详情、批量调价等功能
 */

import type { PriceCalculationRequest, PriceCalculationResult } from '@/utils/pricingHelper'

import type { DailyPriceDetail } from '@/types/pricing'

/**
 * 价格日历查询参数
 */
export interface PriceCalendarQuery {
  modelId: number // 车型ID
  storeId: number // 门店ID（通过门店获取cityId）
  startDate: string // 开始日期 YYYY-MM-DD
  endDate: string // 结束日期 YYYY-MM-DD
}

/**
 * 价格日历响应
 */
export interface PriceCalendarResponse {
  success: boolean
  data: {
    modelInfo: {
      id: number
      name: string
      basePrice: number
    }
    storeInfo: {
      id: number
      name: string
      cityId: number
      cityName: string
    }
    calendar: DailyPriceDetail[]
    summary: {
      avgPrice: number // 平均价格
      maxPrice: number // 最高价格
      minPrice: number // 最低价格
      totalDays: number // 总天数
    }
  }
  message: string
}

/**
 * 单日价格详情查询参数
 */
export interface DayPriceDetailQuery {
  modelId: number
  cityId: number
  date: string // YYYY-MM-DD
}

/**
 * 批量调价请求
 */
export interface BatchAdjustRequest {
  modelId: number
  storeId: number // 门店ID（通过门店获取cityId）
  dates: string[] // 日期数组
  adjustType: 'add_factor' | 'override_price' // 调整方式
  factorConfig?: {
    factorName: string
    adjustmentType: 'percentage' | 'fixed'
    adjustmentValue: number
    priority: number
  }
  overridePrice?: number // 覆盖价格（当 adjustType 为 override_price 时使用）
  changeReason: string // 变更原因
}

/**
 * 批量调价响应
 */
export interface BatchAdjustResponse {
  success: boolean
  data: {
    affectedDates: string[]
    affectedCount: number
    previewData: Array<{
      date: string
      oldPrice: number
      newPrice: number
      changeAmount: number
      changePercentage: number
    }>
  }
  message: string
}

/**
 * 获取价格日历
 * @param query 查询参数
 * @returns 价格日历数据
 */
export async function getPriceCalendar(query: PriceCalendarQuery): Promise<PriceCalendarResponse> {
  // Mock 实现：动态计算价格日历
  const { modelId, storeId, startDate, endDate } = query

  // 模拟从其他 API 获取数据
  const { getVehicleModelDetail } = await import('./vehicle')
  const { getStoreDetail } = await import('./store')
  const { getTimeFactorCalendar } = await import('./timeFactor')
  const { calculateMultiFactorPrice } = await import('@/utils/pricingHelper')

  try {
    // 获取车型信息
    const modelRes = await getVehicleModelDetail(modelId)
    const model = modelRes.data

    // 获取门店信息
    const storeRes = (await getStoreDetail(storeId)) as any
    const store = storeRes.data

    // 获取时间因子日历（包括法定节假日和自定义规则）
    const timeFactorRes = await getTimeFactorCalendar({ startDate, endDate })
    const timeFactorCalendar = timeFactorRes.calendar

    // 生成日期范围
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    // 计算每日价格
    const calendar: DailyPriceDetail[] = []
    let totalPrice = 0

    for (const date of dates) {
      // 获取当日的时间因子
      const timeFactorItem = timeFactorCalendar.find(item => item.date === date)

      // 构建时间因子数组
      const timeFactors =
        timeFactorItem?.appliedRules
          .filter(rule => rule.ruleType === 'holiday' || rule.ruleType === 'custom')
          .map(rule => ({
            id: rule.ruleId,
            name: rule.ruleName,
            date,
            adjustmentType: rule.adjustmentType,
            adjustmentValue: rule.adjustmentValue,
            priority: rule.priority,
          })) || []

      const request: PriceCalculationRequest = {
        modelId,
        modelName: model.modelName,
        basePrice: model.dailyPrice,
        cityId: store.cityId,
        cityName: store.cityName,
        startDate: date,
        endDate: date,
        timeFactors,
      }

      // 调用价格计算引擎
      const result = calculateMultiFactorPrice(request)

      // 从 dailyDetails 中获取当日价格
      const dailyDetail = result.timeFactorSummary.dailyDetails[0]

      calendar.push({
        date,
        basePrice: model.dailyPrice,
        cityFactor: result.cityFactor,
        timeFactor: dailyDetail?.timeFactor,
        otherFactors: dailyDetail?.otherFactors || [],
        dailyRental: dailyDetail?.dailyRental || model.dailyPrice,
        // 添加节假日信息
        isHoliday: timeFactorItem?.isHoliday || false,
        holidayName: timeFactorItem?.holidayName,
      })

      totalPrice += dailyDetail?.dailyRental || model.dailyPrice
    }

    // 计算统计数据
    const prices = calendar.map(c => c.dailyRental)
    const summary = {
      avgPrice: Math.round(totalPrice / dates.length),
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
      totalDays: dates.length,
    }

    return {
      success: true,
      data: {
        modelInfo: {
          id: model.id,
          name: model.modelName,
          basePrice: model.dailyPrice,
        },
        storeInfo: {
          id: store.id,
          name: store.name,
          cityId: store.cityId,
          cityName: store.cityName,
        },
        calendar,
        summary,
      },
      message: '获取价格日历成功',
    }
  } catch (error) {
    console.error('获取价格日历失败:', error)
    return {
      success: false,
      data: {
        modelInfo: { id: 0, name: '', basePrice: 0 },
        storeInfo: { id: 0, name: '', cityId: 0, cityName: '' },
        calendar: [],
        summary: { avgPrice: 0, maxPrice: 0, minPrice: 0, totalDays: 0 },
      },
      message: '获取价格日历失败',
    }
  }
}

/**
 * 获取单日价格详情
 * @param query 查询参数
 * @returns 单日价格详情
 */
export async function getDayPriceDetail(query: DayPriceDetailQuery): Promise<{
  success: boolean
  data: PriceCalculationResult
  message: string
}> {
  const { modelId, cityId, date } = query

  const { calculateMultiFactorPrice } = await import('@/utils/pricingHelper')
  const { getVehicleModelDetail } = await import('./vehicle')
  const { getStoreList } = await import('./store')

  try {
    // 获取车型信息
    const modelRes = await getVehicleModelDetail(modelId)
    const model = modelRes.data

    // 通过门店列表获取城市信息
    const storesRes = (await getStoreList({ page: 1, pageSize: 100 })) as any
    const store = storesRes.data.list.find((s: any) => s.cityId === cityId)
    const cityName = store?.cityName || '未知城市'

    const request: PriceCalculationRequest = {
      modelId,
      modelName: model.modelName,
      basePrice: model.dailyPrice,
      cityId,
      cityName,
      startDate: date,
      endDate: date,
    }

    const result = calculateMultiFactorPrice(request)

    return {
      success: true,
      data: result,
      message: '获取单日价格详情成功',
    }
  } catch (error) {
    console.error('获取单日价格详情失败:', error)
    throw error
  }
}

/**
 * 批量调价
 * @param request 批量调价请求
 * @returns 批量调价结果
 */
export async function batchAdjustPrice(request: BatchAdjustRequest): Promise<BatchAdjustResponse> {
  const { dates, adjustType, factorConfig, overridePrice, changeReason } = request

  // Mock 实现：模拟批量调价
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 生成预览数据
  const previewData = dates.map(date => {
    const oldPrice = 500 + Math.random() * 200 // 模拟旧价格
    let newPrice = oldPrice

    if (adjustType === 'add_factor' && factorConfig) {
      if (factorConfig.adjustmentType === 'percentage') {
        newPrice = oldPrice * (1 + factorConfig.adjustmentValue / 100)
      } else {
        newPrice = oldPrice + factorConfig.adjustmentValue
      }
    } else if (adjustType === 'override_price' && overridePrice) {
      newPrice = overridePrice
    }

    return {
      date,
      oldPrice: Math.round(oldPrice),
      newPrice: Math.round(newPrice),
      changeAmount: Math.round(newPrice - oldPrice),
      changePercentage: Math.round(((newPrice - oldPrice) / oldPrice) * 100),
    }
  })

  return {
    success: true,
    data: {
      affectedDates: dates,
      affectedCount: dates.length,
      previewData,
    },
    message: `批量调价成功，共影响 ${dates.length} 天，原因：${changeReason}`,
  }
}
