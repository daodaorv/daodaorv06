/**
 * 车况评级配置常量
 */
import type { ConditionGradeConfig } from '@/types/system'

/**
 * 车况评级配置
 */
export const CONDITION_GRADES: ConditionGradeConfig[] = [
  {
    grade: 'A',
    name: '优秀',
    ageRange: { min: 0, max: 12 },
    premiumMultiplier: 1.30,
    description: '新车，0-12个月',
  },
  {
    grade: 'B',
    name: '良好',
    ageRange: { min: 13, max: 36 },
    premiumMultiplier: 1.15,
    description: '次新车，13-36个月',
  },
  {
    grade: 'C',
    name: '一般',
    ageRange: { min: 37, max: 60 },
    premiumMultiplier: 0.90,
    description: '中等车龄，37-60个月',
  },
  {
    grade: 'D',
    name: '较旧',
    ageRange: { min: 61, max: 999 },
    premiumMultiplier: 0.75,
    description: '老旧车辆，60个月以上',
  },
]

/**
 * 默认财务参数
 */
export const DEFAULT_FINANCIAL_PARAMS = {
  TARGET_ANNUAL_RETURN: 0.03, // 目标年化收益率 3%
  INVESTMENT_PERIOD: 5, // 投资周期 5年
  RESIDUAL_VALUE_RATE: 0.30, // 残值率 30%
}

/**
 * 默认运营参数
 */
export const DEFAULT_OPERATIONAL_PARAMS = {
  ANNUAL_OPERATING_RATE: 0.30, // 年运营率 30% (365天×30%=109.5天)
  OPERATING_COST_RATE: 0.40, // 运营成本占比 40%
}
