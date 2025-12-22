/**
 * 智能定价算法引擎
 */
import type { Vehicle } from '@/mock/vehicles'
import { CONDITION_GRADES } from '@/constants/conditionGrades'

/**
 * 市场数据接口
 */
interface MarketData {
  averagePrice: number
  competitors: Vehicle[]
  priceRange: { min: number; max: number }
}

/**
 * 智能定价引擎
 */
export class SmartPricingEngine {
  /**
   * 基于市场的定价
   */
  calculateMarketBasedPrice(vehicle: Vehicle, marketData: MarketData): number {
    // 1. 获取同车型市场价格
    const marketAverage = marketData.averagePrice

    // 2. 应用车况调整
    const conditionAdjustment = this.getConditionAdjustment(vehicle.conditionGrade || 'B')

    // 3. 应用里程调整
    const mileageAdjustment = this.getMileageAdjustment(vehicle.currentMileage || 0)

    // 4. 应用车龄调整
    const ageAdjustment = this.getAgeAdjustment(vehicle.purchaseDate || '')

    // 5. 计算建议价格
    return Math.round(marketAverage * conditionAdjustment * mileageAdjustment * ageAdjustment)
  }

  /**
   * 基于收益优化的定价
   */
  calculateRevenueOptimizedPrice(vehicle: Vehicle, targetROI: number = 0.03): number {
    // 基于目标投资回报率反推价格
    const purchasePrice = vehicle.purchasePrice || 300000
    const investmentPeriod = 5 // 年
    const annualOperatingRate = 0.30
    const operatingCostRate = 0.40

    // 计算所需年收益
    const requiredAnnualRevenue = (purchasePrice * (1 + targetROI)) / investmentPeriod

    // 计算所需日租金
    const operatingDays = 365 * annualOperatingRate
    const grossRevenue = requiredAnnualRevenue / (1 - operatingCostRate)
    const dailyPrice = grossRevenue / operatingDays

    // 应用车况调整
    const conditionAdjustment = this.getConditionAdjustment(vehicle.conditionGrade || 'B')

    return Math.round(dailyPrice * conditionAdjustment)
  }

  /**
   * 竞争力定价
   */
  calculateCompetitivePrice(vehicle: Vehicle, competitors: Vehicle[]): number {
    if (competitors.length === 0) {
      return this.calculateRevenueOptimizedPrice(vehicle)
    }

    // 分析竞品价格分布
    const competitorPrices = competitors
      .map(c => c.dailyPrice)
      .filter(p => p > 0)
      .sort((a, b) => a - b)

    if (competitorPrices.length === 0) {
      return this.calculateRevenueOptimizedPrice(vehicle)
    }

    // 计算四分位数
    const q1 = competitorPrices[Math.floor(competitorPrices.length * 0.25)]
    const q2 = competitorPrices[Math.floor(competitorPrices.length * 0.50)]
    const q3 = competitorPrices[Math.floor(competitorPrices.length * 0.75)]

    // 根据车况定位价格
    const conditionGrade = vehicle.conditionGrade || 'B'
    if (conditionGrade === 'A') return Math.round(q3) // 高端定位
    if (conditionGrade === 'B') return Math.round(q2) // 中端定位
    if (conditionGrade === 'C') return Math.round(q1) // 经济定位
    return Math.round(q1 * 0.9) // D级更低
  }

  /**
   * 平衡定价（综合多种策略）
   */
  calculateBalancedPrice(vehicle: Vehicle, marketData: MarketData): number {
    const marketPrice = this.calculateMarketBasedPrice(vehicle, marketData)
    const revenuePrice = this.calculateRevenueOptimizedPrice(vehicle, 0.03)
    const competitivePrice = this.calculateCompetitivePrice(vehicle, marketData.competitors)

    // 加权平均
    return Math.round(
      marketPrice * 0.4 +
      revenuePrice * 0.3 +
      competitivePrice * 0.3
    )
  }

  /**
   * 获取车况调整系数
   */
  private getConditionAdjustment(grade: string): number {
    const gradeConfig = CONDITION_GRADES.find(g => g.grade === grade)
    return gradeConfig?.premiumMultiplier || 1.0
  }

  /**
   * 获取里程调整系数
   */
  private getMileageAdjustment(mileage: number): number {
    // 里程越高，价格越低
    if (mileage < 50000) return 1.05 // 低里程，略微加价
    if (mileage < 100000) return 1.0 // 正常里程
    if (mileage < 150000) return 0.95 // 较高里程，略微降价
    return 0.90 // 高里程，降价
  }

  /**
   * 获取车龄调整系数
   */
  private getAgeAdjustment(purchaseDate: string): number {
    if (!purchaseDate) return 1.0

    const purchaseTime = new Date(purchaseDate).getTime()
    const now = Date.now()
    const ageMonths = Math.floor((now - purchaseTime) / (1000 * 60 * 60 * 24 * 30))

    // 车龄越大，价格越低
    if (ageMonths < 12) return 1.05 // 新车，略微加价
    if (ageMonths < 36) return 1.0 // 1-3年，正常价格
    if (ageMonths < 60) return 0.95 // 3-5年，略微降价
    return 0.90 // 5年以上，降价
  }

  /**
   * 计算置信度
   */
  calculateConfidence(
    vehicle: Vehicle,
    marketData: MarketData,
    strategy: string
  ): number {
    let confidence = 70 // 基础置信度

    // 根据市场数据质量调整
    if (marketData.competitors.length >= 5) {
      confidence += 10 // 竞品数据充足
    }

    // 根据车辆数据完整性调整
    if (vehicle.purchasePrice && vehicle.purchaseDate && vehicle.currentMileage) {
      confidence += 10 // 车辆数据完整
    }

    // 根据策略类型调整
    if (strategy === 'balanced') {
      confidence += 10 // 平衡策略更可靠
    }

    return Math.min(confidence, 95) // 最高95%
  }

  /**
   * 生成定价理由
   */
  generateReasoning(
    vehicle: Vehicle,
    marketData: MarketData,
    strategy: string,
    suggestedPrice: number
  ): string[] {
    const reasoning: string[] = []

    if (strategy === 'market_based') {
      reasoning.push(`同车型市场平均价格为 ${marketData.averagePrice} 元`)
      const conditionGrade = vehicle.conditionGrade || 'B'
      const premium = this.getConditionAdjustment(conditionGrade)
      reasoning.push(`根据车况评级 ${conditionGrade} 级，应用 ${premium} 倍溢价`)

      const mileageAdj = this.getMileageAdjustment(vehicle.currentMileage || 0)
      if (mileageAdj !== 1.0) {
        reasoning.push(`考虑里程因素，调整系数 ${mileageAdj.toFixed(2)}`)
      }

      const ageAdj = this.getAgeAdjustment(vehicle.purchaseDate || '')
      if (ageAdj !== 1.0) {
        reasoning.push(`考虑车龄因素，调整系数 ${ageAdj.toFixed(2)}`)
      }

      reasoning.push(`最终建议价格：${suggestedPrice} 元`)
    } else if (strategy === 'revenue_optimized') {
      reasoning.push(`购买价格 ${vehicle.purchasePrice || 300000} 元，目标投资回报率 3%`)
      reasoning.push('投资周期 5 年，年运营率 30%')
      reasoning.push('运营成本占比 40%')
      reasoning.push(`计算得出最优日租金：${suggestedPrice} 元`)
    } else if (strategy === 'competitive') {
      reasoning.push(`分析 ${marketData.competitors.length} 辆同车型竞品价格`)
      reasoning.push(`价格区间：${marketData.priceRange.min}-${marketData.priceRange.max} 元`)
      reasoning.push(`中位数价格：${marketData.averagePrice} 元`)
      const conditionGrade = vehicle.conditionGrade || 'B'
      const position = conditionGrade === 'A' ? '高端' : conditionGrade === 'B' ? '中高端' : '经济'
      reasoning.push(`根据 ${conditionGrade} 级车况，定位于${position}：${suggestedPrice} 元`)
    } else if (strategy === 'balanced') {
      const marketPrice = this.calculateMarketBasedPrice(vehicle, marketData)
      const revenuePrice = this.calculateRevenueOptimizedPrice(vehicle)
      const competitivePrice = this.calculateCompetitivePrice(vehicle, marketData.competitors)

      reasoning.push('综合市场定价、收益优化、竞争定价三种策略')
      reasoning.push(`市场定价权重 40%：${marketPrice} 元`)
      reasoning.push(`收益优化权重 30%：${revenuePrice} 元`)
      reasoning.push(`竞争定价权重 30%：${competitivePrice} 元`)
      reasoning.push(`加权平均：${suggestedPrice} 元`)
    }

    return reasoning
  }

  /**
   * 评估预期影响
   */
  evaluateImpact(
    currentPrice: number,
    suggestedPrice: number,
    marketData: MarketData
  ): {
    revenueChange: number
    competitiveness: 'high' | 'medium' | 'low'
    marketPosition: string
  } {
    // 计算收益变化
    const revenueChange = ((suggestedPrice - currentPrice) / currentPrice) * 100

    // 评估竞争力
    let competitiveness: 'high' | 'medium' | 'low' = 'medium'
    const avgPrice = marketData.averagePrice
    const priceRatio = suggestedPrice / avgPrice

    if (priceRatio < 0.9) {
      competitiveness = 'high' // 价格优势明显
    } else if (priceRatio > 1.1) {
      competitiveness = 'low' // 价格偏高
    }

    // 市场定位
    let marketPosition = '与市场平均水平持平'
    if (priceRatio < 0.85) {
      marketPosition = '低于市场平均，性价比优势明显'
    } else if (priceRatio < 0.95) {
      marketPosition = '略低于市场平均，具有价格优势'
    } else if (priceRatio > 1.15) {
      marketPosition = '高于市场平均，高端定位'
    } else if (priceRatio > 1.05) {
      marketPosition = '略高于市场平均，中高端定位'
    }

    return {
      revenueChange: Math.round(revenueChange * 10) / 10,
      competitiveness,
      marketPosition,
    }
  }
}

// 导出单例
export const smartPricingEngine = new SmartPricingEngine()
