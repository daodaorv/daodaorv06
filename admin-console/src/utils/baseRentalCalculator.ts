/**
 * 基础租金计算器
 *
 * 优化后的基础租金计算逻辑
 *
 * 步骤1: 计算期望总资产
 * 期望总资产 = 购买价格 × (1 + 年化收益率 × 投资年限)
 *
 * 步骤2: 计算需要净收入
 * 需要净收入 = 期望总资产 - 残值
 * 残值 = 购买价格 × 残值率
 *
 * 步骤3: 计算总营收需求(考虑运营成本)
 * 总营收 = 需要净收入 / (1 - 运营成本率)
 *
 * 步骤4: 计算年均营收
 * 年均营收 = 总营收 / 投资年限
 *
 * 步骤5: 计算实际年运营天数
 * 实际年运营天数 = 365天 × 年运营率
 *
 * 步骤6: 计算基础日租金(应用车况溢价)
 * 基础日租金 = (年均营收 / 实际年运营天数) × 车况溢价系数
 *
 * ⚠️ 关键: 车况好的车辆租金更高,所以是乘以溢价系数
 */

import type { CalculationParams, CalculationResult } from '@/types/system'
import { CONDITION_GRADES, DEFAULT_FINANCIAL_PARAMS, DEFAULT_OPERATIONAL_PARAMS } from '@/constants/conditionGrades'

/**
 * 计算车龄(月)
 */
export function calculateAgeInMonths(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const diffTime = now.getTime() - purchase.getTime()
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44))
  return Math.max(0, diffMonths)
}

/**
 * 根据车龄自动检测车况评级
 */
export function detectConditionGrade(purchaseDate: string): 'A' | 'B' | 'C' | 'D' {
  const ageInMonths = calculateAgeInMonths(purchaseDate)

  for (const grade of CONDITION_GRADES) {
    if (ageInMonths >= grade.ageRange.min && ageInMonths <= grade.ageRange.max) {
      return grade.grade
    }
  }

  return 'D' // 默认返回D级
}

/**
 * 验证日期格式
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 计算基础租金
 */
export function calculateBaseRental(params: CalculationParams): CalculationResult {
  // 1. 参数验证
  if (params.purchasePrice <= 0) {
    throw new Error('购买价格必须大于0')
  }

  if (!isValidDate(params.purchaseDate)) {
    throw new Error('购买日期格式无效')
  }

  // 2. 获取配置参数(使用默认值或传入值)
  const targetReturn = params.targetAnnualReturn ?? DEFAULT_FINANCIAL_PARAMS.TARGET_ANNUAL_RETURN
  const period = params.investmentPeriod ?? DEFAULT_FINANCIAL_PARAMS.INVESTMENT_PERIOD
  const residualRate = params.residualValueRate ?? DEFAULT_FINANCIAL_PARAMS.RESIDUAL_VALUE_RATE
  const operatingRate = params.annualOperatingRate ?? DEFAULT_OPERATIONAL_PARAMS.ANNUAL_OPERATING_RATE
  const costRate = params.operatingCostRate ?? DEFAULT_OPERATIONAL_PARAMS.OPERATING_COST_RATE

  // 3. 参数范围验证
  const warnings: string[] = []

  if (targetReturn < 0 || targetReturn > 0.5) {
    warnings.push('目标年化收益率超出合理范围(0-50%)')
  }

  if (residualRate < 0 || residualRate > 1) {
    throw new Error('残值率必须在0-100%之间')
  }

  if (operatingRate <= 0 || operatingRate > 1) {
    throw new Error('年运营率必须在0-100%之间')
  }

  if (costRate < 0 || costRate >= 1) {
    throw new Error('运营成本占比必须在0-100%之间(不含100%)')
  }

  // 4. 获取车况溢价系数
  const gradeConfig = CONDITION_GRADES.find(g => g.grade === params.conditionGrade)
  if (!gradeConfig) {
    throw new Error(`无效的车况评级: ${params.conditionGrade}`)
  }
  const conditionPremium = gradeConfig.premiumMultiplier

  // 5. 验证车况评级是否匹配车龄
  const ageInMonths = calculateAgeInMonths(params.purchaseDate)
  if (ageInMonths < gradeConfig.ageRange.min || ageInMonths > gradeConfig.ageRange.max) {
    warnings.push(
      `警告：当前车龄${ageInMonths}个月，不在${gradeConfig.name}(${params.conditionGrade}级)的推荐范围${gradeConfig.ageRange.min}-${gradeConfig.ageRange.max}个月内`
    )
  }

  // 6. 执行计算
  const expectedTotalAsset = params.purchasePrice * (1 + targetReturn * period)
  const residualValue = params.purchasePrice * residualRate
  const requiredNetIncome = expectedTotalAsset - residualValue
  const totalRevenue = requiredNetIncome / (1 - costRate)
  const annualRevenue = totalRevenue / period
  const operatingDays = 365 * operatingRate
  const baseDailyPrice = annualRevenue / operatingDays
  const suggestedDailyPrice = Math.round(baseDailyPrice * conditionPremium)

  // 7. 检查计算结果合理性
  if (suggestedDailyPrice <= 0) {
    warnings.push('计算结果为负数或零，请检查参数设置')
  }

  const dailyPriceRatio = suggestedDailyPrice / params.purchasePrice
  if (dailyPriceRatio > 0.02) {
    warnings.push(`警告：日租金占购买价格比例${(dailyPriceRatio * 100).toFixed(2)}%，可能过高`)
  }
  if (dailyPriceRatio < 0.0005) {
    warnings.push(`警告：日租金占购买价格比例${(dailyPriceRatio * 100).toFixed(4)}%，可能过低`)
  }

  // 8. 生成计算过程说明
  const explanation = [
    `购买价格：¥${params.purchasePrice.toLocaleString()}`,
    `期望总资产：¥${Math.round(expectedTotalAsset).toLocaleString()} (${period}年后，年化${(targetReturn * 100).toFixed(1)}%)`,
    `残值：¥${Math.round(residualValue).toLocaleString()} (残值率${(residualRate * 100).toFixed(0)}%)`,
    `需要净收入：¥${Math.round(requiredNetIncome).toLocaleString()}`,
    `总营收需求：¥${Math.round(totalRevenue).toLocaleString()} (扣除${(costRate * 100).toFixed(0)}%运营成本)`,
    `年均营收：¥${Math.round(annualRevenue).toLocaleString()}`,
    `实际年运营天数：${Math.round(operatingDays)}天 (年运营率${(operatingRate * 100).toFixed(0)}%)`,
    `基础日租金：¥${Math.round(baseDailyPrice)}`,
    `车况评级：${gradeConfig.name}(${params.conditionGrade}级)，溢价系数${conditionPremium}`,
    `建议日租金：¥${suggestedDailyPrice}`,
  ]

  return {
    suggestedDailyPrice,
    breakdown: {
      expectedTotalAsset,
      residualValue,
      requiredNetIncome,
      totalRevenue,
      annualRevenue,
      operatingDays,
      baseDailyPrice,
      conditionPremium,
    },
    explanation,
    warnings,
  }
}
