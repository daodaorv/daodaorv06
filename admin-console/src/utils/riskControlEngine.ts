/**
 * 风控引擎
 * 检测异常订单、刷单行为，保护平台分润安全
 */

import { RiskLevel, RiskAction } from '@/types/profit'
import type { RiskAssessment } from '@/types/profit'

/**
 * 订单风控检测参数
 */
export interface OrderRiskParams {
  /** 订单ID */
  orderId: number
  /** 用户ID */
  userId: number
  /** 订单金额 */
  amount: number
  /** 是否新用户 */
  isNewUser: boolean
  /** 用户近期订单数 */
  userRecentOrderCount: number
  /** 是否存在循环推广 */
  hasCircularPromotion: boolean
}

/**
 * 风控引擎类
 */
export class RiskControlEngine {
  /**
   * 检测异常订单
   */
  detectAbnormalOrder(params: OrderRiskParams): RiskAssessment {
    let riskScore = 0
    const riskFactors: string[] = []

    // 1. 短时间内多次下单
    if (params.userRecentOrderCount > 5) {
      riskScore += 30
      riskFactors.push('短时间内多次下单')
    }

    // 2. 订单金额异常
    if (params.amount > 50000 || params.amount < 100) {
      riskScore += 20
      riskFactors.push('订单金额异常')
    }

    // 3. 新用户大额订单
    if (params.isNewUser && params.amount > 10000) {
      riskScore += 25
      riskFactors.push('新用户大额订单')
    }

    // 4. 推广关系异常
    if (params.hasCircularPromotion) {
      riskScore += 40
      riskFactors.push('推广关系异常')
    }

    return {
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      riskFactors,
      actionRecommended: this.getRecommendedAction(riskScore),
    }
  }

  /**
   * 获取风险等级
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL
    if (score >= 60) return RiskLevel.HIGH
    if (score >= 40) return RiskLevel.MEDIUM
    return RiskLevel.LOW
  }

  /**
   * 获取建议动作
   */
  private getRecommendedAction(score: number): RiskAction {
    if (score >= 80) return RiskAction.BLOCK
    if (score >= 60) return RiskAction.FREEZE
    if (score >= 40) return RiskAction.WARNING
    return RiskAction.NONE
  }
}
