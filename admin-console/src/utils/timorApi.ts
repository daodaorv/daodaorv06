/**
 * Timor API 调用工具
 * 用于获取中国法定节假日数据
 * API文档: https://timor.tech/api/holiday
 */

/**
 * Timor API 返回的节假日数据结构
 */
export interface TimorHolidayData {
  holiday: boolean // 是否为节假日
  name: string // 节假日名称
  wage: number // 薪资倍数（1=正常，2=双倍，3=三倍）
  date: string // 日期 YYYY-MM-DD
  rest: number // 连休天数
}

/**
 * Timor API 年度节假日响应
 */
export interface TimorYearHolidayResponse {
  code: number // 0表示成功
  holiday: Record<string, TimorHolidayData> // key为 MM-DD 格式
}

/**
 * API 调用错误
 */
export class TimorApiError extends Error {
  constructor(
    message: string,
    public code?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'TimorApiError'
  }
}

/**
 * 调用 Timor API 获取指定年份的节假日数据
 * @param year 年份
 * @param retryCount 重试次数（默认3次）
 * @returns 节假日数据
 */
export async function fetchTimorHolidays(
  year: number,
  retryCount = 3
): Promise<TimorYearHolidayResponse> {
  const url = `https://timor.tech/api/holiday/year/${year}`

  let lastError: Error | null = null

  // 重试机制
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new TimorApiError(
          `HTTP错误: ${response.status} ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json() as TimorYearHolidayResponse

      // 验证返回数据格式
      if (typeof data.code !== 'number') {
        throw new TimorApiError('API返回数据格式错误：缺少code字段', undefined, data)
      }

      if (data.code !== 0) {
        throw new TimorApiError(
          `API返回错误代码: ${data.code}`,
          data.code,
          data
        )
      }

      if (!data.holiday || typeof data.holiday !== 'object') {
        throw new TimorApiError('API返回数据格式错误：缺少holiday字段', undefined, data)
      }

      return data
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === retryCount) {
        break
      }

      // 等待后重试（指数退避：5秒、10秒、15秒）
      const waitTime = attempt * 5000
      console.warn(`Timor API调用失败（第${attempt}次），${waitTime/1000}秒后重试...`, error)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // 所有重试都失败
  throw new TimorApiError(
    `Timor API调用失败（已重试${retryCount}次）: ${lastError?.message}`,
    undefined,
    lastError
  )
}

/**
 * 批量获取多个年份的节假日数据
 * @param years 年份数组
 * @returns 年份到节假日数据的映射
 */
export async function fetchMultipleYearsHolidays(
  years: number[]
): Promise<Map<number, TimorYearHolidayResponse>> {
  const results = new Map<number, TimorYearHolidayResponse>()
  const errors: Array<{ year: number; error: Error }> = []

  // 串行调用（避免并发请求过多）
  for (const year of years) {
    try {
      const data = await fetchTimorHolidays(year)
      results.set(year, data)
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push({ year, error: err })
      console.error(`获取${year}年节假日数据失败:`, err)
    }
  }

  // 如果所有年份都失败，抛出错误
  if (errors.length === years.length) {
    throw new TimorApiError(
      `所有年份的节假日数据获取均失败`,
      undefined,
      errors
    )
  }

  // 如果部分失败，记录警告但继续
  if (errors.length > 0) {
    console.warn(`部分年份节假日数据获取失败:`, errors)
  }

  return results
}

/**
 * 计算需要同步的年份范围
 * 规则：当前日期向后1年的所有年份
 * 例如：2025-12-19 → 同步 2025年和2026年
 * @returns 年份数组
 */
export function calculateSyncYears(): number[] {
  const now = new Date()
  const currentYear = now.getFullYear()

  // 计算1年后的日期（365天后）
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
  const endYear = oneYearLater.getFullYear()

  // 生成年份范围
  const years: number[] = []
  for (let year = currentYear; year <= endYear; year++) {
    years.push(year)
  }

  return years
}

/**
 * 解析 Timor API 返回的节假日数据
 * 提取真正的法定节假日（holiday=true）
 * @param apiData Timor API 返回的数据
 * @param year 年份
 * @returns 解析后的节假日列表
 */
export interface ParsedHoliday {
  name: string // 节假日名称
  year: number // 年份
  startDate: string // 开始日期 YYYY-MM-DD
  endDate: string // 结束日期 YYYY-MM-DD
  restDays: number // 连休天数
  wage: number // 薪资倍数
}

export function parseTimorHolidays(
  apiData: TimorYearHolidayResponse,
  year: number
): ParsedHoliday[] {
  // 使用 Map 来合并同名节假日
  const holidayMap = new Map<string, ParsedHoliday>()

  // 遍历所有日期
  for (const [_dateKey, holidayData] of Object.entries(apiData.holiday)) {
    // 只保留真正的法定节假日
    if (!holidayData.holiday) {
      continue
    }

    const currentDate = holidayData.date

    // 验证日期格式
    if (!currentDate || typeof currentDate !== 'string') {
      console.warn('跳过无效的节假日数据（缺少日期）:', holidayData)
      continue
    }

    const holidayName = holidayData.name

    // 如果这个节假日已经存在，更新结束日期
    if (holidayMap.has(holidayName)) {
      const existing = holidayMap.get(holidayName)!

      // 比较日期，更新最早的开始日期和最晚的结束日期
      if (currentDate < existing.startDate) {
        existing.startDate = currentDate
      }
      if (currentDate > existing.endDate) {
        existing.endDate = currentDate
      }

      // 重新计算连休天数
      const [startYear, startMonth, startDay] = existing.startDate.split('-').map(Number)
      const [endYear, endMonth, endDay] = existing.endDate.split('-').map(Number)

      const start = new Date(startYear, startMonth - 1, startDay)
      const end = new Date(endYear, endMonth - 1, endDay)

      existing.restDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } else {
      // 新节假日，添加到 Map
      // 使用更安全的日期解析方式
      const [yearStr, monthStr, dayStr] = currentDate.split('-')
      const start = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))

      // 验证日期是否有效
      if (isNaN(start.getTime())) {
        console.warn('跳过无效的节假日数据（日期格式错误）:', holidayData)
        continue
      }

      // 初始时，开始日期和结束日期相同
      holidayMap.set(holidayName, {
        name: holidayName,
        year,
        startDate: currentDate,
        endDate: currentDate,
        restDays: 1, // 初始为1天，后续会更新
        wage: holidayData.wage
      })
    }
  }

  // 将 Map 转换为数组，并按开始日期排序
  const holidays = Array.from(holidayMap.values()).sort((a, b) => {
    return a.startDate.localeCompare(b.startDate)
  })

  return holidays
}

/**
 * 验证年份是否有效
 * @param year 年份
 * @returns 是否有效
 */
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear()
  // 只允许查询过去5年到未来5年的数据
  return year >= currentYear - 5 && year <= currentYear + 5
}

/**
 * 格式化同步结果
 * @param results 同步结果
 * @returns 格式化的结果摘要
 */
export function formatSyncResults(results: {
  syncedYears: number[]
  totalHolidays: number
  newCount: number
  updatedCount: number
  skippedCount: number
  errors: Array<{ year: number; error: Error }>
}): string {
  const lines: string[] = []

  lines.push(`同步年份: ${results.syncedYears.join('、')}`)
  lines.push(`获取节假日: ${results.totalHolidays}个`)
  lines.push(`新增: ${results.newCount}个`)
  lines.push(`更新: ${results.updatedCount}个`)
  lines.push(`跳过: ${results.skippedCount}个`)

  if (results.errors.length > 0) {
    lines.push(`失败: ${results.errors.length}个年份`)
    results.errors.forEach(({ year, error }) => {
      lines.push(`  - ${year}年: ${error.message}`)
    })
  }

  return lines.join('\n')
}
