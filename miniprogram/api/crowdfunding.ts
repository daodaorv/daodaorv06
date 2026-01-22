import { get, post } from '@/utils/request'
import { USE_MOCK } from '@/mock'
import crowdfundingMock from './mock/crowdfunding'
import type {
  CrowdfundingVehicleModel,
  CrowdfundingProject,
  CrowdfundingShare,
  ShareTransaction,
  CrowdfundingStats,
  CrowdfundingIncomeRecord,
  CreateCrowdfundingParams,
  ParticipateCrowdfundingParams,
  ListShareForSaleParams,
  CrowdfundingProjectQuery,
  ShareMarketQuery
} from '@/types/crowdfunding'
import type { PaginatedResponse } from '@/types/common'

/**
 * 众筹托管API
 * @status 联调中 - 使用Mock数据
 */

// ==================== 众筹车型相关 ====================

/**
 * 获取众筹推荐车型列表
 */
export const getCrowdfundingModels = (params?: { page?: number; pageSize?: number }) => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingModels(params)
  }
  return get<PaginatedResponse<CrowdfundingVehicleModel>>('/crowdfunding/models', params)
}

/**
 * 获取众筹车型详情
 */
export const getCrowdfundingModelDetail = (id: string) => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingModelDetail(id)
  }
  return get<CrowdfundingVehicleModel>(`/crowdfunding/models/${id}`)
}

// ==================== 众筹项目相关 ====================

/**
 * 发起众筹项目
 */
export const createCrowdfundingProject = (data: CreateCrowdfundingParams) => {
  if (USE_MOCK) {
    return crowdfundingMock.createCrowdfundingProject(data)
  }
  return post<CrowdfundingProject>('/crowdfunding/projects', data)
}

/**
 * 获取众筹项目列表
 */
export const getCrowdfundingProjects = (params?: CrowdfundingProjectQuery) => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingProjects(params)
  }
  return get<PaginatedResponse<CrowdfundingProject>>('/crowdfunding/projects', params)
}

/**
 * 获取众筹项目详情
 */
export const getCrowdfundingProjectDetail = (id: string) => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingProjectDetail(id)
  }
  return get<CrowdfundingProject>(`/crowdfunding/projects/${id}`)
}

/**
 * 参与众筹
 */
export const participateCrowdfunding = (data: ParticipateCrowdfundingParams) => {
  if (USE_MOCK) {
    return crowdfundingMock.participateCrowdfunding(data)
  }
  return post('/crowdfunding/participate', data)
}

/**
 * 获取我参与的众筹项目
 */
export const getMyCrowdfundingProjects = () => {
  if (USE_MOCK) {
    return crowdfundingMock.getMyCrowdfundingProjects()
  }
  return get<CrowdfundingProject[]>('/crowdfunding/my-projects')
}

// ==================== 份额管理相关 ====================

/**
 * 获取我的众筹份额
 */
export const getMyCrowdfundingShares = () => {
  if (USE_MOCK) {
    return crowdfundingMock.getMyCrowdfundingShares()
  }
  return get<CrowdfundingShare[]>('/crowdfunding/my-shares')
}

/**
 * 获取份额详情
 */
export const getShareDetail = (id: string) => {
  if (USE_MOCK) {
    return crowdfundingMock.getShareDetail(id)
  }
  return get<CrowdfundingShare>(`/crowdfunding/shares/${id}`)
}

// ==================== 份额交易相关 ====================

/**
 * 挂出份额交易
 */
export const listShareForSale = (data: ListShareForSaleParams) => {
  if (USE_MOCK) {
    return crowdfundingMock.listShareForSale(data)
  }
  return post<ShareTransaction>('/crowdfunding/shares/sell', data)
}

/**
 * 获取份额交易市场
 */
export const getShareMarket = (params?: ShareMarketQuery) => {
  if (USE_MOCK) {
    return crowdfundingMock.getShareMarket(params)
  }
  return get<PaginatedResponse<ShareTransaction>>('/crowdfunding/share-market', params)
}

/**
 * 购买份额
 */
export const buyShare = (transactionId: string, paymentMethod: string) => {
  if (USE_MOCK) {
    return crowdfundingMock.buyShare(transactionId, paymentMethod)
  }
  return post(`/crowdfunding/shares/buy/${transactionId}`, { paymentMethod })
}

/**
 * 取消挂单
 */
export const cancelShareListing = (transactionId: string) => {
  if (USE_MOCK) {
    return crowdfundingMock.cancelShareListing(transactionId)
  }
  return post(`/crowdfunding/shares/cancel/${transactionId}`)
}

// ==================== 收益管理相关 ====================

/**
 * 获取众筹统计数据
 */
export const getCrowdfundingStats = () => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingStats()
  }
  return get<CrowdfundingStats>('/crowdfunding/stats')
}

/**
 * 获取众筹收益记录
 */
export const getCrowdfundingIncome = (params?: { projectId?: string; page?: number; pageSize?: number }) => {
  if (USE_MOCK) {
    return crowdfundingMock.getCrowdfundingIncome(params)
  }
  return get<PaginatedResponse<CrowdfundingIncomeRecord>>('/crowdfunding/income', params)
}

/**
 * 提现众筹收益
 */
export const withdrawCrowdfundingIncome = (data: { amount: number; method: string; account: string }) => {
  if (USE_MOCK) {
    return crowdfundingMock.withdrawCrowdfundingIncome(data)
  }
  return post('/crowdfunding/withdraw', data)
}

export default {
  getCrowdfundingModels,
  getCrowdfundingModelDetail,
  createCrowdfundingProject,
  getCrowdfundingProjects,
  getCrowdfundingProjectDetail,
  participateCrowdfunding,
  getMyCrowdfundingProjects,
  getMyCrowdfundingShares,
  getShareDetail,
  listShareForSale,
  getShareMarket,
  buyShare,
  cancelShareListing,
  getCrowdfundingStats,
  getCrowdfundingIncome,
  withdrawCrowdfundingIncome
}
