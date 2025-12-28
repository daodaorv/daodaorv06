/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param date 日期字符串或 Date 对象
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号，默认 '¥'
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = '¥'
): string => {
  if (amount === null || amount === undefined) return '-'
  return `${currency}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数，默认 0
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number | null | undefined, decimals: number = 0): string => {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化百分比
 * @param value 数值 (0-1 或 0-100)
 * @param decimals 小数位数，默认 2
 * @param isDecimal 是否为小数形式 (0-1)，默认 true
 * @returns 格式化后的百分比字符串
 */
export const formatPercent = (
  value: number | null | undefined,
  decimals: number = 2,
  isDecimal: boolean = true
): string => {
  if (value === null || value === undefined) return '-'
  const percent = isDecimal ? value * 100 : value
  return `${percent.toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * 格式化手机号
 * @param phone 手机号
 * @returns 格式化后的手机号 (138****8888)
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-'
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

/**
 * 格式化身份证号
 * @param idCard 身份证号
 * @returns 格式化后的身份证号 (110101********1234)
 */
export const formatIdCard = (idCard: string | null | undefined): string => {
  if (!idCard) return '-'
  if (idCard.length !== 18) return idCard
  return `${idCard.slice(0, 6)}********${idCard.slice(14)}`
}

/**
 * 格式化相对时间
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串 (刚刚、5分钟前、1小时前等)
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 格式化持续时间
 * @param seconds 秒数
 * @returns 格式化后的持续时间字符串 (1小时30分钟)
 */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || seconds === 0) return '0秒'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)

  return parts.join('')
}
