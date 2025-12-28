/**
 * 小程序资源管理 API
 */
import request from '@/utils/request'
import type {
  Banner,
  PromoCard,
  Notice,
  Agreement,
  AgreementType,
  MembershipConfig,
  ServiceMenuItem,
  AppConfig,
} from '@/types/miniprogramResources'

// Mock 数据导入
import {
  mockGetBanners,
  mockCreateBanner,
  mockUpdateBanner,
  mockDeleteBanner,
  mockGetPromoCards,
  mockCreatePromoCard,
  mockUpdatePromoCard,
  mockDeletePromoCard,
  mockGetNotices,
  mockCreateNotice,
  mockUpdateNotice,
  mockDeleteNotice,
  mockGetAgreement,
  mockUpdateAgreement,
  mockGetMembershipConfig,
  mockUpdateMembershipConfig,
  mockGetServiceMenu,
  mockUpdateServiceMenu,
  mockGetAppConfig,
  mockUpdateAppConfig,
} from '@/mock/miniprogramResources'

// 开发环境使用 Mock 数据
const USE_MOCK = import.meta.env.DEV

// ==================== 轮播图管理 ====================

/**
 * 获取轮播图列表
 * @param type 轮播图类型：home-首页，hosting-托管中心
 */
export const getBanners = async (type: 'home' | 'hosting') => {
  if (USE_MOCK) {
    return mockGetBanners(type)
  }
  return request.get<Banner[]>('/miniprogram/banners', { params: { type } })
}

/**
 * 创建轮播图
 */
export const createBanner = async (data: Partial<Banner>) => {
  if (USE_MOCK) {
    return mockCreateBanner(data)
  }
  return request.post<Banner>('/miniprogram/banners', data)
}

/**
 * 更新轮播图
 */
export const updateBanner = async (id: number, data: Partial<Banner>) => {
  if (USE_MOCK) {
    return mockUpdateBanner(id, data)
  }
  return request.put<Banner>(`/miniprogram/banners/${id}`, data)
}

/**
 * 删除轮播图
 */
export const deleteBanner = async (id: number) => {
  if (USE_MOCK) {
    return mockDeleteBanner(id)
  }
  return request.delete(`/miniprogram/banners/${id}`)
}

// ==================== 推广卡片管理 ====================

/**
 * 获取推广卡片列表
 */
export const getPromoCards = async () => {
  if (USE_MOCK) {
    return mockGetPromoCards()
  }
  return request.get<PromoCard[]>('/miniprogram/promo-cards')
}

/**
 * 创建推广卡片
 */
export const createPromoCard = async (data: Partial<PromoCard>) => {
  if (USE_MOCK) {
    return mockCreatePromoCard(data)
  }
  return request.post<PromoCard>('/miniprogram/promo-cards', data)
}

/**
 * 更新推广卡片
 */
export const updatePromoCard = async (id: number, data: Partial<PromoCard>) => {
  if (USE_MOCK) {
    return mockUpdatePromoCard(id, data)
  }
  return request.put<PromoCard>(`/miniprogram/promo-cards/${id}`, data)
}

/**
 * 删除推广卡片
 */
export const deletePromoCard = async (id: number) => {
  if (USE_MOCK) {
    return mockDeletePromoCard(id)
  }
  return request.delete(`/miniprogram/promo-cards/${id}`)
}

// ==================== 公告管理 ====================

/**
 * 获取公告列表
 */
export const getNotices = async () => {
  if (USE_MOCK) {
    return mockGetNotices()
  }
  return request.get<Notice[]>('/miniprogram/notices')
}

/**
 * 创建公告
 */
export const createNotice = async (data: Partial<Notice>) => {
  if (USE_MOCK) {
    return mockCreateNotice(data)
  }
  return request.post<Notice>('/miniprogram/notices', data)
}

/**
 * 更新公告
 */
export const updateNotice = async (id: number, data: Partial<Notice>) => {
  if (USE_MOCK) {
    return mockUpdateNotice(id, data)
  }
  return request.put<Notice>(`/miniprogram/notices/${id}`, data)
}

/**
 * 删除公告
 */
export const deleteNotice = async (id: number) => {
  if (USE_MOCK) {
    return mockDeleteNotice(id)
  }
  return request.delete(`/miniprogram/notices/${id}`)
}

// ==================== 协议管理 ====================

/**
 * 获取协议内容
 * @param type 协议类型
 */
export const getAgreement = async (type: AgreementType) => {
  if (USE_MOCK) {
    return mockGetAgreement(type)
  }
  return request.get<Agreement>(`/miniprogram/agreements/${type}`)
}

/**
 * 更新协议内容
 */
export const updateAgreement = async (type: AgreementType, data: Partial<Agreement>) => {
  if (USE_MOCK) {
    return mockUpdateAgreement(type, data)
  }
  return request.put<Agreement>(`/miniprogram/agreements/${type}`, data)
}

// ==================== 会员配置管理 ====================

/**
 * 获取会员配置
 */
export const getMembershipConfig = async () => {
  if (USE_MOCK) {
    return mockGetMembershipConfig()
  }
  return request.get<MembershipConfig>('/miniprogram/membership-config')
}

/**
 * 更新会员配置
 */
export const updateMembershipConfig = async (data: MembershipConfig) => {
  if (USE_MOCK) {
    return mockUpdateMembershipConfig(data)
  }
  return request.put<MembershipConfig>('/miniprogram/membership-config', data)
}

// ==================== 服务菜单配置 ====================

/**
 * 获取服务菜单配置
 */
export const getServiceMenu = async () => {
  if (USE_MOCK) {
    return mockGetServiceMenu()
  }
  return request.get<ServiceMenuItem[]>('/miniprogram/service-menu')
}

/**
 * 更新服务菜单配置
 */
export const updateServiceMenu = async (data: ServiceMenuItem[]) => {
  if (USE_MOCK) {
    return mockUpdateServiceMenu(data)
  }
  return request.put<ServiceMenuItem[]>('/miniprogram/service-menu', data)
}

// ==================== 应用配置管理 ====================

/**
 * 获取应用配置
 */
export const getAppConfig = async () => {
  if (USE_MOCK) {
    return mockGetAppConfig()
  }
  return request.get<AppConfig>('/miniprogram/app-config')
}

/**
 * 更新应用配置
 */
export const updateAppConfig = async (data: AppConfig) => {
  if (USE_MOCK) {
    return mockUpdateAppConfig(data)
  }
  return request.put<AppConfig>('/miniprogram/app-config', data)
}
