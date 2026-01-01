/**
 * Timor API 调试工具
 * 用于测试和调试节假日同步功能
 */

import { calculateSyncYears, fetchTimorHolidays, parseTimorHolidays } from './timorApi'

/**
 * 测试年份计算
 */
export function testCalculateSyncYears() {
  console.log('=== 测试年份计算 ===')
  const now = new Date()
  console.log('当前日期:', now.toISOString())
  console.log('当前年份:', now.getFullYear())
  console.log('当前时间戳:', now.getTime())

  // 计算1年后
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
  console.log('1年后日期:', oneYearLater.toISOString())
  console.log('1年后年份:', oneYearLater.getFullYear())

  const years = calculateSyncYears()
  console.log('计算的年份范围:', years)
  console.log('年份数量:', years.length)

  return years
}

/**
 * 测试 API 调用
 */
export async function testFetchTimorHolidays(year: number) {
  console.log(`=== 测试获取 ${year} 年节假日数据 ===`)
  console.log('API URL:', `https://timor.tech/api/holiday/year/${year}`)

  try {
    console.log('开始调用 API...')
    const data = await fetchTimorHolidays(year, 1) // 只重试1次，快速测试
    console.log('API 调用成功')
    console.log('API 返回数据:', data)
    console.log('返回的节假日数量:', Object.keys(data.holiday || {}).length)

    console.log('开始解析节假日数据...')
    const holidays = parseTimorHolidays(data, year)
    console.log('解析成功')
    console.log('解析后的节假日:', holidays)
    console.log('法定节假日数量:', holidays.length)

    return { success: true, data, holidays }
  } catch (error) {
    console.error('❌ API 调用失败')
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('错误消息:', error instanceof Error ? error.message : String(error))
    console.error('完整错误:', error)
    return { success: false, error }
  }
}

/**
 * 测试完整同步流程
 */
export async function testFullSync() {
  console.log('=== 测试完整同步流程 ===')

  // 1. 测试年份计算
  const years = testCalculateSyncYears()

  // 2. 测试 API 调用
  const results = []
  for (const year of years) {
    const result = await testFetchTimorHolidays(year)
    results.push({ year, ...result })
  }

  console.log('=== 同步测试完成 ===')
  console.log('结果汇总:', results)

  return results
}

/**
 * 在浏览器控制台中暴露调试函数
 */
if (typeof window !== 'undefined') {
  (window as any).debugTimorApi = {
    testCalculateSyncYears,
    testFetchTimorHolidays,
    testFullSync,
  }
  console.log('调试工具已加载，可以在控制台使用以下命令：')
  console.log('- window.debugTimorApi.testCalculateSyncYears()')
  console.log('- window.debugTimorApi.testFetchTimorHolidays(2025)')
  console.log('- window.debugTimorApi.testFullSync()')
}
