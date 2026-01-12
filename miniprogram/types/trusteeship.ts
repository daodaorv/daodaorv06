/**
 * 委托方案相关类型定义
 */

/** 委托方案类型 */
export enum TrusteeshipPlan {
  /** 方案A：叨叨参与众筹 */
  DAODAO_PARTICIPATE = 'A',
  /** 方案B：叨叨仅受托 */
  DAODAO_TRUSTEE = 'B',
  /** 方案C：用户自行委托 */
  USER_SELF = 'C'
}

/** 委托方案详情 */
export interface TrusteeshipPlanInfo {
  plan: TrusteeshipPlan
  name: string
  description: string
  vehicleRegistration: string
  daodaoInvest: boolean
  daodaoIncome: string
  riskNote: string
  isRecommended: boolean
}

/** 委托方案配置数据 */
export const TRUSTEESHIP_PLANS: TrusteeshipPlanInfo[] = [
  {
    plan: TrusteeshipPlan.DAODAO_PARTICIPATE,
    name: '叨叨参与众筹',
    description: '叨叨房车出资占股，与您共担风险、共享收益',
    vehicleRegistration: '叨叨房车名下',
    daodaoInvest: true,
    daodaoIncome: '按股份分红 + 运营服务费',
    riskNote: '叨叨风险共担',
    isRecommended: false
  },
  {
    plan: TrusteeshipPlan.DAODAO_TRUSTEE,
    name: '叨叨仅受托',
    description: '叨叨房车代持车辆，专业运营，您享全部收益',
    vehicleRegistration: '叨叨房车名下',
    daodaoInvest: false,
    daodaoIncome: '仅运营服务费',
    riskNote: '叨叨承担代持风险',
    isRecommended: true
  },
  {
    plan: TrusteeshipPlan.USER_SELF,
    name: '用户自行委托',
    description: '车辆登记在指定用户名下，自主管理更灵活',
    vehicleRegistration: '指定用户名下',
    daodaoInvest: false,
    daodaoIncome: '仅运营服务费（可选）',
    riskNote: '用户自担风险',
    isRecommended: false
  }
]
