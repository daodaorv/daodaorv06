/**
 * 分享相关API
 * @description 分享记录、统计、邀请关系等API接口
 */

import { get, post } from '@/utils/request'
import { USE_MOCK, mockShareStats, mockShareAchievements, mockInviteRecords, mockInviteStats } from '@/mock'
import { isLoggedIn } from '@/utils/auth'
import type {
  ShareRecordResponse,
  ShareStatsResponse,
  InviteRecordsResponse,
  InviteStatsResponse,
  PosterUrlResponse,
  ShareAchievementsResponse
} from '@/types/share'

// 未登录时的空数据
const emptyStats = { totalShares: 0, totalViews: 0, totalConversions: 0, todayShares: 0, todayViews: 0, weekShares: 0, weekViews: 0 }
const emptyInviteStats = { totalInvites: 0, registeredCount: 0, orderedCount: 0, totalReward: 0, todayInvites: 0, weekInvites: 0 }

/**
 * 分享API
 */
export const shareApi = {
  /**
   * 记录分享行为
   * @param data 分享数据
   */
  recordShare(data: {
    scene: string
    method: string
    businessId: string
    shareTime: string
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: { success: true } } as any)
    }
    return post('/share/record', data)
  },

  /**
   * 记录分享访问
   * @param data 访问数据
   */
  recordShareView(data: {
    scene: string
    businessId: string
    shareFrom: string
    viewTime: string
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: { success: true } } as any)
    }
    return post('/share/view', data)
  },

  /**
   * 获取分享统计
   * @returns 分享统计数据
   */
  getShareStats(): Promise<ShareStatsResponse> {
    if (USE_MOCK) {
      const data = isLoggedIn() ? mockShareStats : emptyStats
      return Promise.resolve({ code: 0, message: 'success', data } as any)
    }
    return get('/share/stats')
  },

  /**
   * 获取分享历史记录
   * @param params 查询参数
   */
  getShareHistory(params?: {
    page?: number
    pageSize?: number
    scene?: string
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: [] } as any)
    }
    return get('/share/history', params)
  },

  /**
   * 获取邀请记录
   * @param params 查询参数
   */
  getInviteRecords(params?: {
    page?: number
    pageSize?: number
  }): Promise<InviteRecordsResponse> {
    if (USE_MOCK) {
      const data = isLoggedIn() ? mockInviteRecords : []
      return Promise.resolve({ code: 0, message: 'success', data } as any)
    }
    return get('/invite/records', params)
  },

  /**
   * 获取邀请统计
   * @returns 邀请统计数据
   */
  getInviteStats(): Promise<InviteStatsResponse> {
    if (USE_MOCK) {
      const data = isLoggedIn() ? mockInviteStats : emptyInviteStats
      return Promise.resolve({ code: 0, message: 'success', data } as any)
    }
    return get('/invite/stats')
  },

  /**
   * 生成小程序码
   * @param data 小程序码参数
   */
  generateMiniProgramCode(data: {
    scene: string
    page: string
    width?: number
  }): Promise<PosterUrlResponse> {
    if (USE_MOCK) {
      return Promise.resolve({
        code: 0,
        message: 'success',
        data: { url: 'https://picsum.photos/200/200?random=qrcode' }
      } as any)
    }
    return post('/share/mini-program-code', data)
  },

  /**
   * 绑定邀请关系
   * @param data 邀请码
   */
  bindInviteRelation(data: {
    inviteCode: string
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: { success: true } } as any)
    }
    return post('/invite/bind', data)
  },

  /**
   * 获取分享成就列表
   * @returns 成就列表
   */
  getShareAchievements(): Promise<ShareAchievementsResponse> {
    if (USE_MOCK) {
      const data = isLoggedIn() ? mockShareAchievements : []
      return Promise.resolve({ code: 0, message: 'success', data } as any)
    }
    return get('/share/achievements')
  },

  /**
   * 验证分享行为（防作弊）
   * @param data 验证数据
   */
  verifyShare(data: {
    scene: string
    businessId: string
    timestamp: number
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: { valid: true } } as any)
    }
    return post('/share/verify', data)
  },

  /**
   * 上报异常分享行为
   * @param data 异常数据
   */
  reportAbnormalShare(data: {
    scene: string
    businessId: string
    reason: string
    timestamp: number
  }): Promise<ShareRecordResponse> {
    if (USE_MOCK) {
      return Promise.resolve({ code: 0, message: 'success', data: { reported: true } } as any)
    }
    return post('/share/report-abnormal', data)
  }
}
