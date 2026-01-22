/**
 * 积分系统 API
 * 包含积分余额、积分记录、积分规则等接口
 * @status 联调中 - 使用Mock数据
 */

import { request } from '@/utils/request'
import { USE_MOCK, mockPointsBalance, mockPointsRecords, mockPointsRules, mockPointsStatistics, emptyPointsBalance, emptyPointsStatistics } from '@/mock'
import { isLoggedIn } from '@/utils/auth'

// ==================== 类型定义 ====================

/**
 * 积分余额信息
 */
export interface PointsBalance {
	/** 当前积分余额 */
	balance: number
	/** 累计获得积分 */
	totalEarned: number
	/** 累计使用积分 */
	totalUsed: number
	/** 即将过期积分 */
	expiringSoon: number
	/** 过期时间 */
	expiringDate?: string
}

/**
 * 积分记录类型
 */
export type PointsRecordType =
	| 'HOSTING_INCOME'    // 托管收益
	| 'RATING'            // 评价反馈
	| 'SIGN_IN'           // 签到打卡
	| 'ACTIVITY'          // 活动参与
	| 'REFERRAL'          // 推荐好友
	| 'RENTAL'            // 租车消费
	| 'EXCHANGE'          // 积分兑换
	| 'EXPIRE'            // 积分过期
	| 'REFUND'            // 退款返还

/**
 * 积分记录
 */
export interface PointsRecord {
	/** 记录ID */
	id: string
	/** 积分变动类型 */
	type: PointsRecordType
	/** 积分变动数量（正数为增加，负数为减少） */
	amount: number
	/** 变动后余额 */
	balance: number
	/** 描述 */
	description: string
	/** 关联订单ID */
	orderId?: string
	/** 创建时间 */
	createdAt: string
}

/**
 * 积分规则
 */
export interface PointsRule {
	/** 规则ID */
	id: string
	/** 规则类型 */
	type: PointsRecordType
	/** 规则名称 */
	name: string
	/** 规则描述 */
	description: string
	/** 积分数量 */
	points: number | string
	/** 是否启用 */
	enabled: boolean
	/** 用户类型限制 */
	userTypeLimit?: string[]
}

/**
 * 积分统计
 */
export interface PointsStatistics {
	/** 本月获得积分 */
	monthEarned: number
	/** 本月使用积分 */
	monthUsed: number
	/** 本年获得积分 */
	yearEarned: number
	/** 本年使用积分 */
	yearUsed: number
	/** 获得积分趋势（最近7天） */
	earnedTrend: Array<{ date: string; amount: number }>
	/** 使用积分趋势（最近7天） */
	usedTrend: Array<{ date: string; amount: number }>
}

// ==================== API 函数 ====================

/**
 * 获取积分余额
 */
export async function getPointsBalance(): Promise<PointsBalance> {
	if (USE_MOCK) {
		const data = isLoggedIn() ? mockPointsBalance : emptyPointsBalance
		return Promise.resolve(data)
	}
	const response = await request<PointsBalance>({
		url: '/points/balance',
		method: 'GET'
	})
	return response.data
}

/**
 * 获取积分记录
 * @param type 记录类型（可选）
 * @param page 页码
 * @param pageSize 每页数量
 */
export async function getPointsRecords(
	type?: PointsRecordType,
	page: number = 1,
	pageSize: number = 20
): Promise<{ records: PointsRecord[]; total: number }> {
	if (USE_MOCK) {
		if (!isLoggedIn()) {
			return Promise.resolve({ records: [], total: 0 })
		}
		let records = [...mockPointsRecords]
		if (type) {
			records = records.filter(r => r.type === type)
		}
		const start = (page - 1) * pageSize
		const end = start + pageSize
		return Promise.resolve({
			records: records.slice(start, end),
			total: records.length
		})
	}
	const response = await request<{ records: PointsRecord[]; total: number }>({
		url: '/points/records',
		method: 'GET',
		data: { type, page, pageSize }
	})
	return response.data
}

/**
 * 获取积分规则
 */
export async function getPointsRules(): Promise<PointsRule[]> {
	if (USE_MOCK) {
		return Promise.resolve(mockPointsRules)
	}
	const response = await request<PointsRule[]>({
		url: '/points/rules',
		method: 'GET'
	})
	return response.data
}

/**
 * 获取积分统计
 */
export async function getPointsStatistics(): Promise<PointsStatistics> {
	if (USE_MOCK) {
		const data = isLoggedIn() ? mockPointsStatistics : emptyPointsStatistics
		return Promise.resolve(data)
	}
	const response = await request<PointsStatistics>({
		url: '/points/statistics',
		method: 'GET'
	})
	return response.data
}

/**
 * 每日签到
 */
export async function dailySignIn(): Promise<{ points: number; continuousDays: number }> {
	if (USE_MOCK) {
		if (!isLoggedIn()) {
			return Promise.reject(new Error('请先登录'))
		}
		return Promise.resolve({ points: 10, continuousDays: 3 })
	}
	const response = await request<{ points: number; continuousDays: number }>({
		url: '/points/sign-in',
		method: 'POST'
	})
	return response.data
}
