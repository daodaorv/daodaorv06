/**
 * 价格分析 Mock 数据
 */
import type {
  PriceAnalysisStats,
  VehiclePricingAnalysis,
  RevenueForecast,
  PriceTrendData,
  SmartPricingSuggestion,
  BatchPricingSuggestion,
} from '@/types/system'

/**
 * 获取价格分析统计数据
 */
export const mockGetPriceAnalysisStats = (): Promise<{
  code: number
  message: string
  data: PriceAnalysisStats
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          // 价格分布
          priceDistribution: [
            { range: '400-500', count: 3, percentage: 15 },
            { range: '500-600', count: 5, percentage: 25 },
            { range: '600-700', count: 4, percentage: 20 },
            { range: '700-800', count: 3, percentage: 15 },
            { range: '800-900', count: 3, percentage: 15 },
            { range: '900-1000', count: 2, percentage: 10 },
          ],

          // 价格统计
          priceStats: {
            average: 680,
            median: 650,
            max: 980,
            min: 450,
            standardDeviation: 145,
          },

          // 价格来源分析
          priceSourceAnalysis: [
            {
              source: 'calculated',
              sourceName: '计算得出',
              count: 12,
              averagePrice: 720,
              percentage: 60,
            },
            {
              source: 'manual',
              sourceName: '手动设置',
              count: 6,
              averagePrice: 620,
              percentage: 30,
            },
            {
              source: 'inherited',
              sourceName: '继承车型',
              count: 2,
              averagePrice: 650,
              percentage: 10,
            },
          ],

          // 车况评级分析
          conditionGradeAnalysis: [
            {
              grade: 'A',
              count: 5,
              averagePrice: 850,
              expectedPremium: 1.30,
              actualPremium: 1.28,
            },
            {
              grade: 'B',
              count: 8,
              averagePrice: 680,
              expectedPremium: 1.15,
              actualPremium: 1.12,
            },
            {
              grade: 'C',
              count: 5,
              averagePrice: 550,
              expectedPremium: 0.90,
              actualPremium: 0.92,
            },
            {
              grade: 'D',
              count: 2,
              averagePrice: 480,
              expectedPremium: 0.75,
              actualPremium: 0.78,
            },
          ],
        },
      })
    }, 300)
  })
}

/**
 * 获取车辆定价分析
 */
export const mockGetVehiclePricingAnalysis = (params?: {
  modelId?: number
  deviationLevel?: 'normal' | 'high' | 'low'
}): Promise<{
  code: number
  message: string
  data: VehiclePricingAnalysis[]
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allData: VehiclePricingAnalysis[] = [
        {
          vehicleId: 1,
          vehicleNumber: '京A12345',
          modelName: '大通 RV80',
          currentPrice: 898,
          modelAveragePrice: 750,
          deviation: 19.7,
          deviationLevel: 'normal',
          conditionGrade: 'B',
          expectedPrice: 862,
          pricingStatus: 'reasonable',
          suggestion: '价格合理，略高于平均水平，符合车况评级',
        },
        {
          vehicleId: 2,
          vehicleNumber: '京B67890',
          modelName: '大通 RV80',
          currentPrice: 950,
          modelAveragePrice: 750,
          deviation: 26.7,
          deviationLevel: 'high',
          conditionGrade: 'A',
          expectedPrice: 975,
          pricingStatus: 'underpriced',
          suggestion: '建议提价至 975 元，当前定价偏低',
        },
        {
          vehicleId: 3,
          vehicleNumber: '京C11111',
          modelName: '依维柯 C型',
          currentPrice: 780,
          modelAveragePrice: 680,
          deviation: 14.7,
          deviationLevel: 'normal',
          conditionGrade: 'B',
          expectedPrice: 782,
          pricingStatus: 'reasonable',
          suggestion: '价格合理，与预期价格基本一致',
        },
        {
          vehicleId: 4,
          vehicleNumber: '京D22222',
          modelName: '依维柯 C型',
          currentPrice: 870,
          modelAveragePrice: 680,
          deviation: 27.9,
          deviationLevel: 'high',
          conditionGrade: 'B',
          expectedPrice: 782,
          pricingStatus: 'overpriced',
          suggestion: '建议降价至 782 元，当前定价偏高',
        },
        {
          vehicleId: 5,
          vehicleNumber: '京E33333',
          modelName: '福特 全顺',
          currentPrice: 920,
          modelAveragePrice: 800,
          deviation: 15.0,
          deviationLevel: 'normal',
          conditionGrade: 'A',
          expectedPrice: 1040,
          pricingStatus: 'underpriced',
          suggestion: '建议提价至 1040 元，A级车况应有更高溢价',
        },
      ]

      // 根据参数筛选
      let filteredData = allData
      if (params?.deviationLevel) {
        filteredData = filteredData.filter(
          (item) => item.deviationLevel === params.deviationLevel
        )
      }

      resolve({
        code: 200,
        message: '获取成功',
        data: filteredData,
      })
    }, 300)
  })
}

/**
 * 获取收益预测
 */
export const mockGetRevenueForecast = (params?: {
  vehicleId?: number
  sortBy?: 'revenue' | 'roi' | 'payback'
}): Promise<{
  code: number
  message: string
  data: RevenueForecast[]
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data: RevenueForecast[] = [
        {
          vehicleId: 1,
          vehicleNumber: '京A12345',
          modelName: '大通 RV80',
          currentPrice: 898,
          purchasePrice: 300000,
          annualOperatingDays: 110,
          expectedAnnualRevenue: 98780,
          expectedROI: 0.0329,
          paybackPeriod: 3.04,
          optimizedPrice: 950,
          optimizedRevenue: 104500,
          revenueIncrease: 5.8,
        },
        {
          vehicleId: 2,
          vehicleNumber: '京B67890',
          modelName: '大通 RV80',
          currentPrice: 950,
          purchasePrice: 320000,
          annualOperatingDays: 110,
          expectedAnnualRevenue: 104500,
          expectedROI: 0.0327,
          paybackPeriod: 3.06,
          optimizedPrice: 980,
          optimizedRevenue: 107800,
          revenueIncrease: 3.2,
        },
        {
          vehicleId: 3,
          vehicleNumber: '京C11111',
          modelName: '依维柯 C型',
          currentPrice: 780,
          purchasePrice: 280000,
          annualOperatingDays: 110,
          expectedAnnualRevenue: 85800,
          expectedROI: 0.0306,
          paybackPeriod: 3.26,
          optimizedPrice: 820,
          optimizedRevenue: 90200,
          revenueIncrease: 5.1,
        },
        {
          vehicleId: 4,
          vehicleNumber: '京D22222',
          modelName: '依维柯 C型',
          currentPrice: 870,
          purchasePrice: 290000,
          annualOperatingDays: 110,
          expectedAnnualRevenue: 95700,
          expectedROI: 0.0330,
          paybackPeriod: 3.03,
          optimizedPrice: 850,
          optimizedRevenue: 93500,
          revenueIncrease: -2.3,
        },
        {
          vehicleId: 5,
          vehicleNumber: '京E33333',
          modelName: '福特 全顺',
          currentPrice: 920,
          purchasePrice: 350000,
          annualOperatingDays: 110,
          expectedAnnualRevenue: 101200,
          expectedROI: 0.0289,
          paybackPeriod: 3.46,
          optimizedPrice: 1000,
          optimizedRevenue: 110000,
          revenueIncrease: 8.7,
        },
      ]

      // 根据参数排序
      if (params?.sortBy === 'revenue') {
        data = data.sort((a, b) => b.expectedAnnualRevenue - a.expectedAnnualRevenue)
      } else if (params?.sortBy === 'roi') {
        data = data.sort((a, b) => b.expectedROI - a.expectedROI)
      } else if (params?.sortBy === 'payback') {
        data = data.sort((a, b) => a.paybackPeriod - b.paybackPeriod)
      }

      // 根据 vehicleId 筛选
      if (params?.vehicleId) {
        data = data.filter((item) => item.vehicleId === params.vehicleId)
      }

      resolve({
        code: 200,
        message: '获取成功',
        data,
      })
    }, 300)
  })
}

/**
 * 获取价格趋势数据
 */
export const mockGetPriceTrendData = (_params: {
  vehicleId?: number
  modelId?: number
  startDate?: string
  endDate?: string
}): Promise<{
  code: number
  message: string
  data: PriceTrendData[]
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟单个车辆的价格趋势数据
      const data: PriceTrendData[] = [
        {
          date: '2024-01-15',
          price: 500,
          changeReason: '初始价格设置',
          operator: '系统管理员',
        },
        {
          date: '2024-02-20',
          price: 550,
          changeReason: '手动调整价格',
          operator: '张三',
        },
        {
          date: '2024-03-10',
          price: 898,
          changeReason: '使用基础租金计算器计算',
          operator: '李四',
        },
        {
          date: '2024-04-05',
          price: 920,
          changeReason: '季节性调价',
          operator: '王五',
        },
        {
          date: '2024-05-12',
          price: 880,
          changeReason: '市场竞争调整',
          operator: '赵六',
        },
      ]

      resolve({
        code: 200,
        message: '获取成功',
        data,
      })
    }, 300)
  })
}

/**
 * 获取智能定价建议
 */
export const mockGetSmartPricingSuggestion = (vehicleId: number): Promise<{
  code: number
  message: string
  data: SmartPricingSuggestion
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          vehicleId,
          vehicleNumber: '京A12345',
          modelName: '大通 RV80',
          currentPrice: 898,

          suggestions: [
            {
              strategy: 'market_based',
              strategyName: '市场定价',
              suggestedPrice: 920,
              confidence: 85,
              reasoning: [
                '同车型市场平均价格为 750 元',
                '根据车况评级 B 级，应用 1.15 倍溢价',
                '考虑车龄和里程因素，调整系数 1.05',
                '最终建议价格：750 × 1.15 × 1.05 = 920 元',
              ],
              expectedImpact: {
                revenueChange: 2.4,
                competitiveness: 'high',
                marketPosition: '高于市场平均水平，具有竞争力',
              },
            },
            {
              strategy: 'revenue_optimized',
              strategyName: '收益优化',
              suggestedPrice: 950,
              confidence: 90,
              reasoning: [
                '购买价格 300,000 元，目标投资回报率 3%',
                '投资周期 5 年，年运营率 30%',
                '运营成本占比 40%',
                '计算得出最优日租金：950 元',
              ],
              expectedImpact: {
                revenueChange: 5.8,
                competitiveness: 'medium',
                marketPosition: '略高于市场，收益最大化',
              },
            },
            {
              strategy: 'competitive',
              strategyName: '竞争定价',
              suggestedPrice: 880,
              confidence: 80,
              reasoning: [
                '分析 8 辆同车型竞品价格',
                '价格区间：650-980 元',
                '中位数价格：750 元',
                '根据 B 级车况，定位于中高端：880 元',
              ],
              expectedImpact: {
                revenueChange: -2.0,
                competitiveness: 'high',
                marketPosition: '中高端定位，性价比优势',
              },
            },
            {
              strategy: 'balanced',
              strategyName: '平衡定价',
              suggestedPrice: 915,
              confidence: 88,
              reasoning: [
                '综合市场定价、收益优化、竞争定价三种策略',
                '市场定价权重 40%：920 元',
                '收益优化权重 30%：950 元',
                '竞争定价权重 30%：880 元',
                '加权平均：915 元',
              ],
              expectedImpact: {
                revenueChange: 1.9,
                competitiveness: 'high',
                marketPosition: '平衡收益与竞争力的最优选择',
              },
            },
          ],

          marketComparison: {
            averagePrice: 750,
            priceRange: { min: 650, max: 980 },
            position: 'above',
            competitorCount: 8,
          },

          historicalReference: {
            averageHistoricalPrice: 782,
            priceChangeFrequency: 2.5,
            lastAdjustmentDate: '2024-03-10',
            lastAdjustmentReason: '使用基础租金计算器计算',
          },
        },
      })
    }, 500)
  })
}

/**
 * 批量获取智能定价建议
 */
export const mockGetBatchPricingSuggestions = (vehicleIds: number[]): Promise<{
  code: number
  message: string
  data: BatchPricingSuggestion
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions: SmartPricingSuggestion[] = vehicleIds.map((id) => ({
        vehicleId: id,
        vehicleNumber: `京A${10000 + id}`,
        modelName: '大通 RV80',
        currentPrice: 800 + id * 20,

        suggestions: [
          {
            strategy: 'balanced',
            strategyName: '平衡定价',
            suggestedPrice: 850 + id * 20,
            confidence: 85,
            reasoning: ['综合多种策略的平衡定价'],
            expectedImpact: {
              revenueChange: 5.0,
              competitiveness: 'high',
              marketPosition: '平衡收益与竞争力',
            },
          },
        ],

        marketComparison: {
          averagePrice: 750,
          priceRange: { min: 650, max: 980 },
          position: 'above',
          competitorCount: 8,
        },

        historicalReference: {
          averageHistoricalPrice: 780,
          priceChangeFrequency: 2.0,
          lastAdjustmentDate: '2024-03-10',
          lastAdjustmentReason: '批量计算',
        },
      }))

      const currentPrices = suggestions.map((s) => s.currentPrice)
      const suggestedPrices = suggestions.map((s) => s.suggestions[0].suggestedPrice)

      resolve({
        code: 200,
        message: '获取成功',
        data: {
          totalVehicles: vehicleIds.length,
          suggestions,
          summary: {
            averageCurrentPrice: Math.round(
              currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length
            ),
            averageSuggestedPrice: Math.round(
              suggestedPrices.reduce((a, b) => a + b, 0) / suggestedPrices.length
            ),
            totalRevenueImpact: 5.2,
            vehiclesNeedAdjustment: vehicleIds.length,
          },
        },
      })
    }, 800)
  })
}

/**
 * 应用智能定价建议
 */
export const mockApplySmartPricing = (
  _vehicleId: number,
  _strategy: string
): Promise<{
  code: number
  message: string
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '应用成功',
      })
    }, 300)
  })
}

/**
 * 批量应用智能定价
 */
export const mockBatchApplySmartPricing = (
  applications: Array<{ vehicleId: number; strategy: string }>
): Promise<{
  code: number
  message: string
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: `成功应用 ${applications.length} 辆车的智能定价`,
      })
    }, 500)
  })
}
