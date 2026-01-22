/**
 * 积分系统 Mock 数据
 */

import type { PointsBalance, PointsRecord, PointsRule, PointsStatistics } from '@/api/points'

// 积分余额 Mock 数据
export const mockPointsBalance: PointsBalance = {
	balance: 1580,
	totalEarned: 5680,
	totalUsed: 4100,
	expiringSoon: 200,
	expiringDate: '2026-02-28'
}

// 积分记录 Mock 数据
export const mockPointsRecords: PointsRecord[] = [
	{
		id: '1',
		type: 'RENTAL',
		amount: 100,
		balance: 1580,
		description: '租车消费奖励',
		orderId: 'ORD202601150001',
		createdAt: '2026-01-15 14:30:00'
	},
	{
		id: '2',
		type: 'SIGN_IN',
		amount: 10,
		balance: 1480,
		description: '每日签到',
		createdAt: '2026-01-14 09:00:00'
	},
	{
		id: '3',
		type: 'EXCHANGE',
		amount: -500,
		balance: 1470,
		description: '兑换50元优惠券',
		createdAt: '2026-01-13 16:20:00'
	},
	{
		id: '4',
		type: 'REFERRAL',
		amount: 200,
		balance: 1970,
		description: '推荐好友注册奖励',
		createdAt: '2026-01-12 11:00:00'
	},
	{
		id: '5',
		type: 'RATING',
		amount: 20,
		balance: 1770,
		description: '订单评价奖励',
		orderId: 'ORD202601100002',
		createdAt: '2026-01-10 18:45:00'
	},
	{
		id: '6',
		type: 'HOSTING_INCOME',
		amount: 300,
		balance: 1750,
		description: '托管收益积分',
		createdAt: '2026-01-08 10:00:00'
	},
	{
		id: '7',
		type: 'ACTIVITY',
		amount: 50,
		balance: 1450,
		description: '参与新年活动奖励',
		createdAt: '2026-01-01 00:00:00'
	}
]

// 积分规则 Mock 数据
export const mockPointsRules: PointsRule[] = [
	{
		id: '1',
		type: 'RENTAL',
		name: '租车消费',
		description: '每消费1元获得1积分',
		points: '1积分/元',
		enabled: true
	},
	{
		id: '2',
		type: 'SIGN_IN',
		name: '每日签到',
		description: '每日签到可获得积分，连续签到奖励更多',
		points: '10-50',
		enabled: true
	},
	{
		id: '3',
		type: 'RATING',
		name: '评价反馈',
		description: '完成订单评价可获得积分',
		points: 20,
		enabled: true
	},
	{
		id: '4',
		type: 'REFERRAL',
		name: '推荐好友',
		description: '推荐好友注册并完成首单',
		points: 200,
		enabled: true
	},
	{
		id: '5',
		type: 'HOSTING_INCOME',
		name: '托管收益',
		description: '托管车辆产生收益时获得积分',
		points: '收益的1%',
		enabled: true
	},
	{
		id: '6',
		type: 'ACTIVITY',
		name: '活动参与',
		description: '参与平台活动可获得积分',
		points: '活动定义',
		enabled: true
	}
]

// 积分统计 Mock 数据
export const mockPointsStatistics: PointsStatistics = {
	monthEarned: 680,
	monthUsed: 500,
	yearEarned: 5680,
	yearUsed: 4100,
	earnedTrend: [
		{ date: '01-15', amount: 100 },
		{ date: '01-16', amount: 10 },
		{ date: '01-17', amount: 0 },
		{ date: '01-18', amount: 20 },
		{ date: '01-19', amount: 50 },
		{ date: '01-20', amount: 10 },
		{ date: '01-21', amount: 0 }
	],
	usedTrend: [
		{ date: '01-15', amount: 0 },
		{ date: '01-16', amount: 500 },
		{ date: '01-17', amount: 0 },
		{ date: '01-18', amount: 0 },
		{ date: '01-19', amount: 0 },
		{ date: '01-20', amount: 0 },
		{ date: '01-21', amount: 0 }
	]
}

// 未登录时的空数据
export const emptyPointsBalance: PointsBalance = {
	balance: 0,
	totalEarned: 0,
	totalUsed: 0,
	expiringSoon: 0
}

export const emptyPointsStatistics: PointsStatistics = {
	monthEarned: 0,
	monthUsed: 0,
	yearEarned: 0,
	yearUsed: 0,
	earnedTrend: [],
	usedTrend: []
}
