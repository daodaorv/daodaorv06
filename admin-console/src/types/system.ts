/**
 * 系统配置相关类型定义
 */

/**
 * 基础租金计算参数配置
 */
export interface BaseRentalCalculationConfig {
  id: number
  configKey: string // 配置键名
  configName: string // 配置名称
  configValue: number // 配置值
  unit: string // 单位(%、年、天等)
  description: string // 说明
  category: 'financial' | 'operational' | 'condition' // 分类
  isEditable: boolean // 是否可编辑
  updatedAt: string
  updatedBy: string
}

/**
 * 车况评级配置
 */
export interface ConditionGradeConfig {
  grade: 'A' | 'B' | 'C' | 'D'
  name: string // 评级名称
  ageRange: { min: number; max: number } // 车龄范围(月)
  premiumMultiplier: number // 溢价系数
  description: string
}

/**
 * 基础租金计算参数
 */
export interface CalculationParams {
  purchasePrice: number // 购买价格
  purchaseDate: string // 购买日期
  conditionGrade: 'A' | 'B' | 'C' | 'D' // 车况评级
  targetAnnualReturn?: number // 目标年化收益率(默认3%)
  investmentPeriod?: number // 投资周期(默认5年)
  residualValueRate?: number // 残值率(默认30%)
  annualOperatingRate?: number // 年运营率(默认30%)
  operatingCostRate?: number // 运营成本占比(默认40%)
}

/**
 * 基础租金计算结果
 */
export interface CalculationResult {
  suggestedDailyPrice: number // 建议日租金
  breakdown: {
    expectedTotalAsset: number // 期望总资产
    residualValue: number // 残值
    requiredNetIncome: number // 需要净收入
    totalRevenue: number // 总营收需求
    annualRevenue: number // 年均营收
    operatingDays: number // 实际年运营天数
    baseDailyPrice: number // 基础日租金(未应用车况溢价)
    conditionPremium: number // 车况溢价系数
  }
  explanation: string[] // 计算过程说明
  warnings: string[] // 警告信息
}

/**
 * 车辆价格历史记录
 */
export interface VehiclePriceHistory {
  id: number
  vehicleId: number
  vehicleNumber: string
  oldPrice: number
  newPrice: number
  priceChange: number
  priceChangePercent: number
  changeReason: 'manual' | 'calculator' | 'batch_calculator' | 'system'
  changeReasonText: string
  priceSource: 'calculated' | 'manual' | 'inherited'
  calculationParams?: {
    targetAnnualReturn: number
    residualValueRate: number
    annualOperatingRate: number
    operatingCostRate: number
    conditionPremium: number
    calculatedAt: string
  }
  operatorId?: number
  operatorName: string
  createdAt: string
}

/**
 * 价格分析统计数据
 */
export interface PriceAnalysisStats {
  // 价格分布
  priceDistribution: {
    range: string // 价格区间，如 "500-600"
    count: number // 车辆数量
    percentage: number // 占比
  }[]

  // 价格统计
  priceStats: {
    average: number // 平均价格
    median: number // 中位数
    max: number // 最高价
    min: number // 最低价
    standardDeviation: number // 标准差
  }

  // 价格来源分析
  priceSourceAnalysis: {
    source: 'calculated' | 'manual' | 'inherited'
    sourceName: string
    count: number
    averagePrice: number
    percentage: number
  }[]

  // 车况评级分析
  conditionGradeAnalysis: {
    grade: 'A' | 'B' | 'C' | 'D'
    count: number
    averagePrice: number
    expectedPremium: number // 预期溢价系数
    actualPremium: number // 实际平均溢价系数
  }[]
}

/**
 * 车辆定价分析
 */
export interface VehiclePricingAnalysis {
  vehicleId: number
  vehicleNumber: string
  modelName: string
  currentPrice: number
  modelAveragePrice: number // 同车型平均价格
  deviation: number // 偏离度（百分比）
  deviationLevel: 'normal' | 'high' | 'low' // 偏离程度
  conditionGrade: string
  expectedPrice: number // 基于车况的预期价格
  pricingStatus: 'reasonable' | 'overpriced' | 'underpriced'
  suggestion: string // 定价建议
}

/**
 * 收益预测
 */
export interface RevenueForecast {
  vehicleId: number
  vehicleNumber: string
  modelName: string
  currentPrice: number
  purchasePrice: number
  annualOperatingDays: number // 年运营天数
  expectedAnnualRevenue: number // 预期年收益
  expectedROI: number // 预期投资回报率
  paybackPeriod: number // 回本周期（年）
  optimizedPrice: number // 优化后的建议价格
  optimizedRevenue: number // 优化后的预期收益
  revenueIncrease: number // 收益增长（百分比）
}

/**
 * 价格趋势数据
 */
export interface PriceTrendData {
  date: string
  price: number
  changeReason: string
  operator: string
}

/**
 * 智能定价建议
 */
export interface SmartPricingSuggestion {
  vehicleId: number
  vehicleNumber: string
  modelName: string
  currentPrice: number

  // 建议价格（多种策略）
  suggestions: {
    strategy: 'market_based' | 'revenue_optimized' | 'competitive' | 'balanced'
    strategyName: string
    suggestedPrice: number
    confidence: number // 置信度 0-100
    reasoning: string[] // 定价理由
    expectedImpact: {
      revenueChange: number // 收益变化（百分比）
      competitiveness: 'high' | 'medium' | 'low' // 竞争力
      marketPosition: string // 市场定位
    }
  }[]

  // 市场对比
  marketComparison: {
    averagePrice: number // 市场平均价
    priceRange: { min: number; max: number } // 价格区间
    position: 'above' | 'at' | 'below' // 当前价格位置
    competitorCount: number // 竞品数量
  }

  // 历史参考
  historicalReference: {
    averageHistoricalPrice: number
    priceChangeFrequency: number // 调价频率（次/年）
    lastAdjustmentDate: string
    lastAdjustmentReason: string
  }
}

/**
 * 批量定价建议
 */
export interface BatchPricingSuggestion {
  totalVehicles: number
  suggestions: SmartPricingSuggestion[]
  summary: {
    averageCurrentPrice: number
    averageSuggestedPrice: number
    totalRevenueImpact: number
    vehiclesNeedAdjustment: number
  }
}
