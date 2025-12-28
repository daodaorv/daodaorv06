/**
 * 分润管理 API
 */
import request from '@/utils/request'
import type {
  PromotionRelation,
  PromotionProfitConfig,
  PromotionProfitRecord,
  HostingProfitConfig,
  HostingProfitRecord,
  CampsiteProfitConfig,
  CampsiteProfitRecord,
  TourProfitConfig,
  TourProfitRecord,
  ProfitCalculationLog,
  ProfitSimulatorInput,
  ProfitSimulatorOutput,
  BalanceRecord,
  WithdrawalRequest,
  RiskControlRule,
  RiskControlRecord,
  ProfitStatistics,
  UserProfitRanking,
  ProductType,
  HostingType,
  ProfitStatus,
  WithdrawalStatus,
} from '@/types/profit'
import {
  mockGetPromotionRelations,
  mockGetPromotionProfitConfigs,
  mockGetPromotionProfitRecords,
  mockGetPromotionProfitStatistics,
  mockGetHostingProfitConfigs,
  mockGetHostingProfitRecords,
  mockGetHostingProfitStatistics,
  mockGetCampsiteProfitConfigs,
  mockGetCampsiteProfitRecords,
  mockGetCampsiteProfitStatistics,
  mockGetTourProfitConfigs,
  mockGetTourProfitRecords,
  mockGetTourProfitStatistics,
  mockSimulateProfit,
  mockGetBalanceRecords,
  mockGetWithdrawalRequests,
  mockGetRiskControlRules,
  mockGetRiskControlRecords,
} from '@/mock/profit'

// 是否使用 Mock 数据（开发环境默认使用）
const USE_MOCK = import.meta.env.DEV

// ==================== 推广分润相关 ====================

/**
 * 获取推广关系列表
 */
export function getPromotionRelations(params: {
  page: number
  pageSize: number
  userId?: string
  level1PromoterUserId?: string
  level2PromoterUserId?: string
}) {
  if (USE_MOCK) {
    return mockGetPromotionRelations(params) as any
  }
  return request.get<{
    list: PromotionRelation[]
    total: number
  }>('/profit/promotion/relations', { params })
}

/**
 * 获取推广关系树
 */
export function getPromotionTree(userId: string) {
  return request.get<PromotionRelation[]>(`/profit/promotion/tree/${userId}`)
}

/**
 * 获取推广分润配置列表
 */
export function getPromotionProfitConfigs() {
  if (USE_MOCK) {
    return mockGetPromotionProfitConfigs() as any
  }
  return request.get<PromotionProfitConfig[]>('/profit/promotion/configs')
}

/**
 * 更新推广分润配置
 */
export function updatePromotionProfitConfig(id: string, data: Partial<PromotionProfitConfig>) {
  return request.put(`/profit/promotion/configs/${id}`, data)
}

/**
 * 获取推广分润记录
 */
export function getPromotionProfitRecords(params: {
  page: number
  pageSize: number
  promoterUserId?: string
  productType?: ProductType
  status?: ProfitStatus
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetPromotionProfitRecords(params as any) as any
  }
  return request.get<{
    list: PromotionProfitRecord[]
    total: number
  }>('/profit/promotion/records', { params })
}

/**
 * 获取推广分润统计
 */
export function getPromotionProfitStatistics(params: {
  promoterUserId?: string
  productType?: ProductType
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetPromotionProfitStatistics(params as any) as any
  }
  return request.get<{
    totalProfit: number
    vehicleRentalProfit: number
    campsiteProfit: number
    tourProfit: number
    orderCount: number
    level1Profit: number
    level2Profit: number
    plusMemberReward: number
  }>('/profit/promotion/statistics', { params })
}

// ==================== 托管车主分润相关 ====================

/**
 * 获取托管分润配置列表
 */
export function getHostingProfitConfigs() {
  if (USE_MOCK) {
    return mockGetHostingProfitConfigs() as any
  }
  return request.get<HostingProfitConfig[]>('/profit/hosting/configs')
}

/**
 * 更新托管分润配置
 */
export function updateHostingProfitConfig(id: string, data: Partial<HostingProfitConfig>) {
  return request.put(`/profit/hosting/configs/${id}`, data)
}

/**
 * 获取托管分润记录
 */
export function getHostingProfitRecords(params: {
  page: number
  pageSize: number
  ownerId?: string
  vehicleId?: string
  hostingType?: HostingType
  status?: ProfitStatus
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetHostingProfitRecords(params as any) as any
  }
  return request.get<{
    list: HostingProfitRecord[]
    total: number
  }>('/profit/hosting/records', { params })
}

/**
 * 获取托管分润统计
 */
export function getHostingProfitStatistics(params: {
  ownerId?: string
  vehicleId?: string
  hostingType?: HostingType
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetHostingProfitStatistics(params as any) as any
  }
  return request.get<{
    totalProfit: number
    totalSubsidy: number
    orderCount: number
    avgProfitPerOrder: number
    ownCarProfit: number
    newCarProfit: number
    crowdfundingProfit: number
  }>('/profit/hosting/statistics', { params })
}

/**
 * 计算月度补贴
 */
export function calculateMonthlySubsidy(params: {
  ownerId: string
  month: string // YYYY-MM
}) {
  return request.post<{
    totalProfit: number
    subsidyAmount: number
    shouldSubsidy: boolean
  }>('/profit/hosting/subsidy/calculate', params)
}

// ==================== 营地产品分润相关 ====================

/**
 * 获取营地分润配置列表
 */
export function getCampsiteProfitConfigs() {
  if (USE_MOCK) {
    return mockGetCampsiteProfitConfigs() as any
  }
  return request.get<CampsiteProfitConfig[]>('/profit/campsite/configs')
}

/**
 * 更新营地分润配置
 */
export function updateCampsiteProfitConfig(id: string, data: Partial<CampsiteProfitConfig>) {
  return request.put(`/profit/campsite/configs/${id}`, data)
}

/**
 * 获取营地分润记录
 */
export function getCampsiteProfitRecords(params: {
  page: number
  pageSize: number
  ownerId?: string
  campsiteId?: string
  status?: ProfitStatus
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetCampsiteProfitRecords(params as any) as any
  }
  return request.get<{
    list: CampsiteProfitRecord[]
    total: number
  }>('/profit/campsite/records', { params })
}

/**
 * 获取营地分润统计
 */
export function getCampsiteProfitStatistics(params: {
  ownerId?: string
  campsiteId?: string
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetCampsiteProfitStatistics(params as any) as any
  }
  return request.get<{
    totalProfit: number
    orderCount: number
    bundledOrderCount: number
    avgProfitPerOrder: number
  }>('/profit/campsite/statistics', { params })
}

// ==================== 房车旅游产品分润相关 ====================

/**
 * 获取旅游分润配置列表
 */
export function getTourProfitConfigs() {
  if (USE_MOCK) {
    return mockGetTourProfitConfigs() as any
  }
  return request.get<TourProfitConfig[]>('/profit/tour/configs')
}

/**
 * 更新旅游分润配置
 */
export function updateTourProfitConfig(id: string, data: Partial<TourProfitConfig>) {
  return request.put(`/profit/tour/configs/${id}`, data)
}

/**
 * 获取旅游分润记录
 */
export function getTourProfitRecords(params: {
  page: number
  pageSize: number
  providerId?: string
  tourId?: string
  status?: ProfitStatus
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetTourProfitRecords(params as any) as any
  }
  return request.get<{
    list: TourProfitRecord[]
    total: number
  }>('/profit/tour/records', { params })
}

/**
 * 获取旅游分润统计
 */
export function getTourProfitStatistics(params: {
  providerId?: string
  tourId?: string
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetTourProfitStatistics(params as any) as any
  }
  return request.get<{
    totalProfit: number
    orderCount: number
    avgRating: number
    avgProfitPerOrder: number
  }>('/profit/tour/statistics', { params })
}

// ==================== 通用功能相关 ====================

/**
 * 获取分润计算日志
 */
export function getProfitCalculationLogs(params: {
  page: number
  pageSize: number
  orderId?: string
  productType?: ProductType
  startDate?: string
  endDate?: string
}) {
  return request.get<{
    list: ProfitCalculationLog[]
    total: number
  }>('/profit/calculation-logs', { params })
}

/**
 * 获取分润计算日志详情
 */
export function getProfitCalculationLogDetail(id: string) {
  return request.get<ProfitCalculationLog>(`/profit/calculation-logs/${id}`)
}

/**
 * 分润模拟器
 */
export function simulateProfit(input: ProfitSimulatorInput) {
  if (USE_MOCK) {
    return mockSimulateProfit(input) as any
  }
  return request.post<ProfitSimulatorOutput>('/profit/simulator', input)
}

/**
 * 获取余额记录
 */
export function getBalanceRecords(params: {
  page: number
  pageSize: number
  userId?: string
  minBalance?: number
}) {
  if (USE_MOCK) {
    return mockGetBalanceRecords(params) as any
  }
  return request.get<{
    list: BalanceRecord[]
    total: number
  }>('/profit/balance/records', { params })
}

/**
 * 获取用户余额详情
 */
export function getUserBalance(userId: string) {
  return request.get<BalanceRecord>(`/profit/balance/${userId}`)
}

/**
 * 获取提现申请列表
 */
export function getWithdrawalRequests(params: {
  page: number
  pageSize: number
  userId?: string
  status?: WithdrawalStatus
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetWithdrawalRequests(params as any) as any
  }
  return request.get<{
    list: WithdrawalRequest[]
    total: number
  }>('/profit/withdrawal/requests', { params })
}

/**
 * 审核提现申请
 */
export function reviewWithdrawalRequest(
  id: string,
  data: {
    status: WithdrawalStatus
    reason?: string
  }
) {
  return request.post(`/profit/withdrawal/requests/${id}/review`, data)
}

/**
 * 完成提现
 */
export function completeWithdrawal(id: string) {
  return request.post(`/profit/withdrawal/requests/${id}/complete`)
}

/**
 * 获取风控规则列表
 */
export function getRiskControlRules() {
  if (USE_MOCK) {
    return mockGetRiskControlRules() as any
  }
  return request.get<RiskControlRule[]>('/profit/risk-control/rules')
}

/**
 * 创建风控规则
 */
export function createRiskControlRule(data: Omit<RiskControlRule, 'id' | 'updatedAt'>) {
  return request.post('/profit/risk-control/rules', data)
}

/**
 * 更新风控规则
 */
export function updateRiskControlRule(id: string, data: Partial<RiskControlRule>) {
  return request.put(`/profit/risk-control/rules/${id}`, data)
}

/**
 * 删除风控规则
 */
export function deleteRiskControlRule(id: string) {
  return request.delete(`/profit/risk-control/rules/${id}`)
}

/**
 * 获取风控记录
 */
export function getRiskControlRecords(params: {
  page: number
  pageSize: number
  userId?: string
  ruleId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  if (USE_MOCK) {
    return mockGetRiskControlRecords(params) as any
  }
  return request.get<{
    list: RiskControlRecord[]
    total: number
  }>('/profit/risk-control/records', { params })
}

/**
 * 处理风控记录
 */
export function handleRiskControlRecord(
  id: string,
  data: {
    status: 'confirmed' | 'dismissed'
    note?: string
  }
) {
  return request.post(`/profit/risk-control/records/${id}/handle`, data)
}

/**
 * 获取分润统计
 */
export function getProfitStatistics(params: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}) {
  return request.get<ProfitStatistics[]>('/profit/statistics', { params })
}

/**
 * 获取用户分润排行
 */
export function getUserProfitRankings(params: {
  period: string // YYYY-MM
  limit?: number
  userType?: string
}) {
  return request.get<UserProfitRanking[]>('/profit/rankings', { params })
}

/**
 * 批量支付分润
 */
export function batchPayProfit(data: { recordIds: string[]; productType: ProductType }) {
  return request.post('/profit/batch-pay', data)
}

/**
 * 冻结分润
 */
export function freezeProfit(data: { recordIds: string[]; reason: string }) {
  return request.post('/profit/freeze', data)
}

/**
 * 解冻分润
 */
export function unfreezeProfit(data: { recordIds: string[] }) {
  return request.post('/profit/unfreeze', data)
}
