/**
 * 法定节假日同步服务
 * 负责从 Timor API 获取节假日数据并同步到系统
 */

import {
  fetchMultipleYearsHolidays,
  calculateSyncYears,
  parseTimorHolidays,
  formatSyncResults,
  type ParsedHoliday
} from '@/utils/timorApi'
import type {
  NationalHoliday,
  NationalHolidayFormData,
  HolidaySyncLog
} from '@/types/timeFactor'
import {
  getNationalHolidayList,
  createNationalHoliday,
  updateNationalHoliday
} from '@/api/timeFactor'

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean
  message: string
  syncedYears: number[]
  totalHolidays: number
  newCount: number
  updatedCount: number
  skippedCount: number
  errors: Array<{ year: number; error: Error }>
  syncLog?: HolidaySyncLog
}

/**
 * 同步选项
 */
export interface SyncOptions {
  years?: number[] // 指定要同步的年份，不指定则自动计算
  forceOverwrite?: boolean // 是否强制覆盖已有数据
  defaultAdjustmentValue?: number // 默认调整值（百分比）
  onProgress?: (progress: { current: number; total: number; message: string }) => void // 进度回调
}

/**
 * 比较两个节假日是否相同（用于判断是否需要更新）
 */
function isSameHoliday(
  existing: NationalHoliday,
  parsed: ParsedHoliday
): boolean {
  return (
    existing.name === parsed.name &&
    existing.year === parsed.year &&
    existing.startDate === parsed.startDate &&
    existing.endDate === parsed.endDate
  )
}

/**
 * 将 ParsedHoliday 转换为 NationalHolidayFormData
 */
function convertToFormData(
  parsed: ParsedHoliday,
  defaultAdjustmentValue: number
): NationalHolidayFormData {
  return {
    name: parsed.name,
    type: 'national',
    year: parsed.year,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    adjustmentType: 'percentage',
    adjustmentValue: defaultAdjustmentValue,
    remark: `${parsed.year}年${parsed.name}，连休${parsed.restDays}天，价格上浮${defaultAdjustmentValue}%`,
    status: 'active'
  }
}

/**
 * 执行节假日数据同步
 */
export async function syncNationalHolidays(
  options: SyncOptions = {}
): Promise<SyncResult> {
  const {
    years: specifiedYears,
    forceOverwrite = false,
    defaultAdjustmentValue = 30,
    onProgress
  } = options

  // 步骤1：计算需要同步的年份
  const yearsToSync = specifiedYears || calculateSyncYears()

  onProgress?.({
    current: 0,
    total: yearsToSync.length,
    message: `准备同步 ${yearsToSync.join('、')} 年的节假日数据...`
  })

  const result: SyncResult = {
    success: false,
    message: '',
    syncedYears: [],
    totalHolidays: 0,
    newCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errors: []
  }

  try {
    // 步骤2：调用 Timor API 获取数据
    onProgress?.({
      current: 1,
      total: yearsToSync.length + 3,
      message: '正在从 Timor API 获取节假日数据...'
    })

    const apiResults = await fetchMultipleYearsHolidays(yearsToSync)

    // 记录获取失败的年份
    for (const year of yearsToSync) {
      if (!apiResults.has(year)) {
        result.errors.push({
          year,
          error: new Error('API 调用失败')
        })
      }
    }

    // 步骤3：解析节假日数据
    const allParsedHolidays: ParsedHoliday[] = []
    for (const [year, apiData] of apiResults.entries()) {
      const parsed = parseTimorHolidays(apiData, year)
      allParsedHolidays.push(...parsed)
      result.syncedYears.push(year)
    }

    result.totalHolidays = allParsedHolidays.length

    onProgress?.({
      current: 2,
      total: yearsToSync.length + 3,
      message: `成功获取 ${result.totalHolidays} 个节假日，正在同步到系统...`
    })

    // 步骤4：获取系统中已有的节假日数据
    const existingHolidaysResponse = await getNationalHolidayList({
      page: 1,
      pageSize: 1000,
      type: 'national'
    })
    const existingHolidays = existingHolidaysResponse.list

    // 步骤5：数据对比和同步
    for (let i = 0; i < allParsedHolidays.length; i++) {
      const parsed = allParsedHolidays[i]

      onProgress?.({
        current: 3 + i,
        total: yearsToSync.length + 3 + allParsedHolidays.length,
        message: `正在同步 ${parsed.name} (${parsed.startDate})...`
      })

      // 查找是否已存在相同的节假日（相同年份+名称）
      const existing = existingHolidays.find(
        h => h.year === parsed.year && h.name === parsed.name
      )

      if (existing) {
        // 已存在
        if (isSameHoliday(existing, parsed)) {
          // 数据完全相同，跳过
          result.skippedCount++
        } else if (forceOverwrite) {
          // 数据有变化且强制覆盖，更新
          try {
            const formData = convertToFormData(parsed, defaultAdjustmentValue)
            await updateNationalHoliday(existing.id, formData)
            result.updatedCount++
          } catch (error: unknown) {
            console.error(`更新节假日失败: ${parsed.name}`, error)
            result.errors.push({
              year: parsed.year,
              error: error instanceof Error ? error : new Error(String(error))
            })
          }
        } else {
          // 数据有变化但不强制覆盖，跳过
          result.skippedCount++
        }
      } else {
        // 不存在，新增
        try {
          const formData = convertToFormData(parsed, defaultAdjustmentValue)
          await createNationalHoliday(formData)
          result.newCount++
        } catch (error: unknown) {
          console.error(`创建节假日失败: ${parsed.name}`, error)
          result.errors.push({
            year: parsed.year,
            error: error instanceof Error ? error : new Error(String(error))
          })
        }
      }
    }

    // 步骤6：生成同步结果
    result.success = result.errors.length === 0 || result.newCount + result.updatedCount > 0
    result.message = formatSyncResults(result)

    onProgress?.({
      current: yearsToSync.length + 3 + allParsedHolidays.length,
      total: yearsToSync.length + 3 + allParsedHolidays.length,
      message: '同步完成！'
    })

    // 步骤7：生成同步日志
    result.syncLog = {
      id: Date.now(),
      year: yearsToSync[0], // 主要年份
      syncStatus: result.success ? 'success' : result.errors.length === yearsToSync.length ? 'failed' : 'partial',
      syncedCount: result.newCount + result.updatedCount,
      skippedCount: result.skippedCount,
      failedCount: result.errors.length,
      errorMessage: result.errors.length > 0 ? result.errors.map(e => `${e.year}年: ${e.error.message}`).join('; ') : undefined,
      dataSource: 'Timor API',
      syncedBy: 'system',
      syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    return result
  } catch (error: unknown) {
    // 捕获所有未处理的错误
    const err = error instanceof Error ? error : new Error(String(error))

    result.success = false
    result.message = `同步失败: ${err.message}`
    result.errors.push({
      year: yearsToSync[0],
      error: err
    })

    result.syncLog = {
      id: Date.now(),
      year: yearsToSync[0],
      syncStatus: 'failed',
      syncedCount: 0,
      skippedCount: 0,
      failedCount: yearsToSync.length,
      errorMessage: err.message,
      dataSource: 'Timor API',
      syncedBy: 'system',
      syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    return result
  }
}

/**
 * 获取上次同步时间
 * 从 localStorage 读取
 */
export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem('holiday_last_sync_time')
  } catch {
    return null
  }
}

/**
 * 保存同步时间
 * 存储到 localStorage
 */
export function saveLastSyncTime(time: string): void {
  try {
    localStorage.setItem('holiday_last_sync_time', time)
  } catch (error) {
    console.error('保存同步时间失败:', error)
  }
}

/**
 * 获取同步日志列表
 * 从 localStorage 读取
 */
export function getSyncLogs(): HolidaySyncLog[] {
  try {
    const logs = localStorage.getItem('holiday_sync_logs')
    return logs ? JSON.parse(logs) : []
  } catch {
    return []
  }
}

/**
 * 保存同步日志
 * 存储到 localStorage，最多保留最近10条
 */
export function saveSyncLog(log: HolidaySyncLog): void {
  try {
    const logs = getSyncLogs()
    logs.unshift(log) // 添加到开头

    // 只保留最近10条
    const trimmedLogs = logs.slice(0, 10)

    localStorage.setItem('holiday_sync_logs', JSON.stringify(trimmedLogs))
  } catch (error) {
    console.error('保存同步日志失败:', error)
  }
}

/**
 * 清理过期的节假日数据
 * 删除2年前的数据
 */
export async function cleanupExpiredHolidays(): Promise<{
  success: boolean
  deletedCount: number
  message: string
}> {
  try {
    const currentYear = new Date().getFullYear()
    const cutoffYear = currentYear - 2

    // 获取所有节假日
    const response = await getNationalHolidayList({
      page: 1,
      pageSize: 1000,
      type: 'national'
    })

    // 筛选出过期的节假日
    const expiredHolidays = response.list.filter(h => h.year < cutoffYear)

    // 删除过期数据（这里暂时只是模拟，实际需要调用删除API）
    // for (const holiday of expiredHolidays) {
    //   await deleteNationalHoliday(holiday.id)
    // }

    return {
      success: true,
      deletedCount: expiredHolidays.length,
      message: `成功清理 ${expiredHolidays.length} 条过期节假日数据（${cutoffYear}年之前）`
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    return {
      success: false,
      deletedCount: 0,
      message: `清理失败: ${err.message}`
    }
  }
}

/**
 * 计算下次自动同步时间
 * 每月1日凌晨2点
 */
export function calculateNextSyncTime(): Date {
  const now = new Date()
  const nextSync = new Date(now)

  // 设置为下个月1日凌晨2点
  nextSync.setMonth(now.getMonth() + 1)
  nextSync.setDate(1)
  nextSync.setHours(2, 0, 0, 0)

  return nextSync
}

/**
 * 格式化下次同步时间
 */
export function formatNextSyncTime(): string {
  const nextSync = calculateNextSyncTime()

  const year = nextSync.getFullYear()
  const month = String(nextSync.getMonth() + 1).padStart(2, '0')
  const day = String(nextSync.getDate()).padStart(2, '0')
  const hour = String(nextSync.getHours()).padStart(2, '0')
  const minute = String(nextSync.getMinutes()).padStart(2, '0')

  return `${year}/${month}/${day} ${hour}:${minute}`
}
