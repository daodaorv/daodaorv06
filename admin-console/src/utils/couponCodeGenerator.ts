/**
 * 优惠码生成器
 * 格式：{PREFIX}{YYYYMMDD}{RANDOM}
 * 示例：COUP20250121ABCD
 */

/**
 * 优惠码生成选项
 */
export interface CodeGenerateOptions {
  prefix?: string // 前缀，默认 'COUP'
  randomLength?: number // 随机码长度，默认 4
  includeDate?: boolean // 是否包含日期，默认 true
}

/**
 * 格式化日期为 YYYYMMDD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * 生成单个优惠码
 */
export function generateCouponCode(options: CodeGenerateOptions = {}): string {
  const { prefix = 'COUP', randomLength = 4, includeDate = true } = options

  let code = prefix.toUpperCase()

  // 添加日期部分
  if (includeDate) {
    const dateStr = formatDate(new Date())
    code += dateStr
  }

  // 添加随机码部分（大写字母和数字，排除易混淆字符 0OIL1）
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  for (let i = 0; i < randomLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
 * 批量生成优惠码（保证唯一性）
 */
export function generateUniqueCouponCodes(
  count: number,
  options: CodeGenerateOptions = {},
  existingCodes: Set<string> = new Set()
): string[] {
  const codes: string[] = []
  const maxAttempts = count * 10 // 最大尝试次数
  let attempts = 0

  while (codes.length < count && attempts < maxAttempts) {
    const code = generateCouponCode(options)

    // 检查是否重复
    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code)
      existingCodes.add(code)
    }

    attempts++
  }

  if (codes.length < count) {
    throw new Error(`无法生成足够的唯一优惠码，仅生成了 ${codes.length}/${count} 个`)
  }

  return codes
}

/**
 * 验证优惠码格式
 */
export function validateCouponCode(code: string): boolean {
  // 基本格式验证：4-20位大写字母和数字
  const regex = /^[A-Z0-9]{4,20}$/
  return regex.test(code)
}

/**
 * 检查优惠码唯一性（需要调用 API）
 */
export async function checkCodeUniqueness(_code: string): Promise<boolean> {
  // TODO: 调用后端 API 检查
  // import { checkCouponCodeExists } from '@/api/marketing'
  // const res = await checkCouponCodeExists(code)
  // return !res.exists

  // Mock 实现：总是返回唯一
  return Promise.resolve(true)
}

/**
 * 生成带唯一性检查的优惠码
 */
export async function generateUniqueCode(
  options: CodeGenerateOptions = {},
  maxRetries: number = 10
): Promise<string> {
  let attempts = 0

  while (attempts < maxRetries) {
    const code = generateCouponCode(options)
    const isUnique = await checkCodeUniqueness(code)

    if (isUnique) {
      return code
    }

    attempts++
  }

  throw new Error(`生成唯一优惠码失败，已尝试 ${maxRetries} 次`)
}
