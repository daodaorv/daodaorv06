/**
 * 积分系统 API
 * 包含积分余额、积分记录、积分规则、积分商城等接口
 */

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
 * 兑换商品类型
 */
export type ExchangeItemType = 'COUPON' | 'GIFT' | 'SERVICE'

/**
 * 兑换商品
 */
export interface ExchangeItem {
	/** 商品ID */
	id: string
	/** 商品类型 */
	type: ExchangeItemType
	/** 商品名称 */
	name: string
	/** 商品描述 */
	description: string
	/** 商品图片 */
	image: string
	/** 所需积分 */
	points: number
	/** 商品价值（元） */
	value: number
	/** 库存数量 */
	stock: number
	/** 已兑换数量 */
	exchangedCount: number
	/** 是否热门 */
	isHot: boolean
	/** 是否推荐 */
	isRecommended: boolean
	/** 有效期（天） */
	validDays?: number
	/** 使用说明 */
	usage?: string
}

/**
 * 兑换记录
 */
export interface ExchangeRecord {
	/** 记录ID */
	id: string
	/** 商品ID */
	itemId: string
	/** 商品名称 */
	itemName: string
	/** 商品类型 */
	itemType: ExchangeItemType
	/** 消耗积分 */
	points: number
	/** 兑换状态 */
	status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'USED' | 'EXPIRED'
	/** 兑换时间 */
	exchangedAt: string
	/** 使用时间 */
	usedAt?: string
	/** 过期时间 */
	expiredAt?: string
	/** 优惠券码（如果是优惠券） */
	couponCode?: string
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
export function getPointsBalance(): Promise<PointsBalance> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('[Mock] 获取积分余额')
			resolve({
				balance: 1580,
				totalEarned: 2350,
				totalUsed: 770,
				expiringSoon: 0,
				expiringDate: undefined
			})
		}, 500)
	})
}

/**
 * 获取积分记录
 * @param type 记录类型（可选）
 * @param page 页码
 * @param pageSize 每页数量
 */
export function getPointsRecords(
	type?: PointsRecordType,
	page: number = 1,
	pageSize: number = 20
): Promise<{ records: PointsRecord[]; total: number }> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`[Mock] 获取积分记录 - 类型: ${type || '全部'}, 页码: ${page}`)

			// Mock 数据
			const allRecords: PointsRecord[] = [
				{
					id: '1',
					type: 'HOSTING_INCOME',
					amount: 500,
					balance: 1580,
					description: '托管收益转化积分（11月收益5000元的1%）',
					orderId: 'HOST001',
					createdAt: '2025-12-01 10:30:00'
				},
				{
					id: '2',
					type: 'RATING',
					amount: 50,
					balance: 1080,
					description: '优质评价奖励',
					orderId: 'ORDER123',
					createdAt: '2025-11-28 15:20:00'
				},
				{
					id: '3',
					type: 'SIGN_IN',
					amount: 2,
					balance: 1030,
					description: '每日签到奖励',
					createdAt: '2025-11-28 09:00:00'
				},
				{
					id: '4',
					type: 'EXCHANGE',
					amount: -200,
					balance: 1028,
					description: '兑换200元优惠券',
					orderId: 'EX001',
					createdAt: '2025-11-27 14:30:00'
				},
				{
					id: '5',
					type: 'ACTIVITY',
					amount: 100,
					balance: 1228,
					description: '参与双十一活动奖励',
					createdAt: '2025-11-11 20:00:00'
				},
				{
					id: '6',
					type: 'REFERRAL',
					amount: 50,
					balance: 1128,
					description: '推荐好友注册奖励',
					createdAt: '2025-11-10 16:45:00'
				},
				{
					id: '7',
					type: 'RENTAL',
					amount: 15,
					balance: 1078,
					description: '租车消费返积分（消费1500元）',
					orderId: 'ORDER120',
					createdAt: '2025-11-05 11:20:00'
				},
				{
					id: '8',
					type: 'RATING',
					amount: 70,
					balance: 1063,
					description: '优质评价+图片奖励（50+20）',
					orderId: 'ORDER118',
					createdAt: '2025-11-03 09:15:00'
				},
				{
					id: '9',
					type: 'SIGN_IN',
					amount: 5,
					balance: 993,
					description: '连续签到7天额外奖励',
					createdAt: '2025-11-01 09:00:00'
				},
				{
					id: '10',
					type: 'EXCHANGE',
					amount: -100,
					balance: 988,
					description: '兑换100元优惠券',
					orderId: 'EX002',
					createdAt: '2025-10-28 16:30:00'
				}
			]

			// 根据类型筛选
			const filteredRecords = type
				? allRecords.filter(r => r.type === type)
				: allRecords

			// 分页
			const start = (page - 1) * pageSize
			const end = start + pageSize
			const records = filteredRecords.slice(start, end)

			resolve({
				records,
				total: filteredRecords.length
			})
		}, 500)
	})
}

/**
 * 获取积分规则
 */
export function getPointsRules(): Promise<PointsRule[]> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('[Mock] 获取积分规则')
			resolve([
				{
					id: '1',
					type: 'HOSTING_INCOME',
					name: '托管收益',
					description: '托管车主每月收益的1%转化为消费积分（仅首次托管）',
					points: '收益的1%',
					enabled: true,
					userTypeLimit: ['HOST']
				},
				{
					id: '2',
					type: 'RATING',
					name: '评价反馈',
					description: '优质评价获得10-50积分，图片评价额外20积分',
					points: '10-50',
					enabled: true,
					userTypeLimit: ['HOST']
				},
				{
					id: '3',
					type: 'SIGN_IN',
					name: '签到打卡',
					description: '每日签到获得2积分，连续签到额外奖励',
					points: '2',
					enabled: true,
					userTypeLimit: ['HOST']
				},
				{
					id: '4',
					type: 'ACTIVITY',
					name: '活动参与',
					description: '参与平台活动获得5-100积分',
					points: '5-100',
					enabled: true,
					userTypeLimit: ['HOST']
				},
				{
					id: '5',
					type: 'REFERRAL',
					name: '推荐好友',
					description: '成功推荐新用户注册获得50积分',
					points: '50',
					enabled: true,
					userTypeLimit: ['HOST']
				},
				{
					id: '6',
					type: 'RENTAL',
					name: '租车消费',
					description: '普通用户租车消费100元返1积分',
					points: '消费100元返1积分',
					enabled: true,
					userTypeLimit: ['NORMAL', 'PLUS']
				}
			])
		}, 500)
	})
}

/**
 * 获取兑换商品列表
 * @param type 商品类型（可选）
 * @param page 页码
 * @param pageSize 每页数量
 */
export function getExchangeItems(
	type?: ExchangeItemType,
	page: number = 1,
	pageSize: number = 20
): Promise<{ items: ExchangeItem[]; total: number }> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`[Mock] 获取兑换商品列表 - 类型: ${type || '全部'}, 页码: ${page}`)

			// Mock 数据
			const allItems: ExchangeItem[] = [
				{
					id: '1',
					type: 'COUPON',
					name: '50元租车优惠券',
					description: '适用于所有房车租赁订单，满500元可用',
					image: '/static/images/coupon-50.png',
					points: 50,
					value: 50,
					stock: 1000,
					exchangedCount: 235,
					isHot: true,
					isRecommended: true,
					validDays: 30,
					usage: '下单时自动抵扣，不可与其他优惠叠加使用'
				},
				{
					id: '2',
					type: 'COUPON',
					name: '100元租车优惠券',
					description: '适用于所有房车租赁订单，满1000元可用',
					image: '/static/images/coupon-100.png',
					points: 100,
					value: 100,
					stock: 500,
					exchangedCount: 128,
					isHot: true,
					isRecommended: true,
					validDays: 30,
					usage: '下单时自动抵扣，不可与其他优惠叠加使用'
				},
				{
					id: '3',
					type: 'COUPON',
					name: '200元租车优惠券',
					description: '适用于所有房车租赁订单，满2000元可用',
					image: '/static/images/coupon-200.png',
					points: 200,
					value: 200,
					stock: 300,
					exchangedCount: 67,
					isHot: false,
					isRecommended: true,
					validDays: 30,
					usage: '下单时自动抵扣，不可与其他优惠叠加使用'
				},
				{
					id: '4',
					type: 'COUPON',
					name: '500元租车优惠券',
					description: '适用于所有房车租赁订单，满5000元可用',
					image: '/static/images/coupon-500.png',
					points: 500,
					value: 500,
					stock: 100,
					exchangedCount: 23,
					isHot: false,
					isRecommended: false,
					validDays: 30,
					usage: '下单时自动抵扣，不可与其他优惠叠加使用'
				},
				{
					id: '5',
					type: 'COUPON',
					name: '营地住宿8折券',
					description: '适用于所有营地预订，无门槛使用',
					image: '/static/images/coupon-camp.png',
					points: 150,
					value: 200,
					stock: 200,
					exchangedCount: 45,
					isHot: true,
					isRecommended: false,
					validDays: 30,
					usage: '预订营地时自动抵扣，不可与其他优惠叠加使用'
				},
				{
					id: '6',
					type: 'COUPON',
					name: '旅游线路9折券',
					description: '适用于所有房车旅游线路，满3000元可用',
					image: '/static/images/coupon-tour.png',
					points: 300,
					value: 400,
					stock: 150,
					exchangedCount: 32,
					isHot: false,
					isRecommended: false,
					validDays: 60,
					usage: '预订旅游线路时自动抵扣，不可与其他优惠叠加使用'
				}
			]

			// 根据类型筛选
			const filteredItems = type
				? allItems.filter(item => item.type === type)
				: allItems

			// 分页
			const start = (page - 1) * pageSize
			const end = start + pageSize
			const items = filteredItems.slice(start, end)

			resolve({
				items,
				total: filteredItems.length
			})
		}, 500)
	})
}

/**
 * 兑换商品
 * @param itemId 商品ID
 * @param quantity 兑换数量
 */
export function exchangeItem(itemId: string, quantity: number = 1): Promise<ExchangeRecord> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log(`[Mock] 兑换商品 - 商品ID: ${itemId}, 数量: ${quantity}`)

			// 模拟兑换成功
			resolve({
				id: `EX${Date.now()}`,
				itemId,
				itemName: '50元租车优惠券',
				itemType: 'COUPON',
				points: 50,
				status: 'SUCCESS',
				exchangedAt: new Date().toISOString(),
				expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				couponCode: `COUPON${Date.now()}`
			})
		}, 800)
	})
}

/**
 * 获取兑换记录
 * @param page 页码
 * @param pageSize 每页数量
 */
export function getExchangeRecords(
	page: number = 1,
	pageSize: number = 20
): Promise<{ records: ExchangeRecord[]; total: number }> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`[Mock] 获取兑换记录 - 页码: ${page}`)

			// Mock 数据
			const allRecords: ExchangeRecord[] = [
				{
					id: 'EX001',
					itemId: '2',
					itemName: '100元租车优惠券',
					itemType: 'COUPON',
					points: 100,
					status: 'USED',
					exchangedAt: '2025-11-27 14:30:00',
					usedAt: '2025-11-28 10:20:00',
					expiredAt: '2025-12-27 14:30:00',
					couponCode: 'COUPON1732689000'
				},
				{
					id: 'EX002',
					itemId: '1',
					itemName: '50元租车优惠券',
					itemType: 'COUPON',
					points: 50,
					status: 'SUCCESS',
					exchangedAt: '2025-11-25 16:30:00',
					expiredAt: '2025-12-25 16:30:00',
					couponCode: 'COUPON1732516200'
				},
				{
					id: 'EX003',
					itemId: '5',
					itemName: '营地住宿8折券',
					itemType: 'COUPON',
					points: 150,
					status: 'SUCCESS',
					exchangedAt: '2025-11-20 11:15:00',
					expiredAt: '2025-12-20 11:15:00',
					couponCode: 'COUPON1732075500'
				},
				{
					id: 'EX004',
					itemId: '1',
					itemName: '50元租车优惠券',
					itemType: 'COUPON',
					points: 50,
					status: 'EXPIRED',
					exchangedAt: '2025-10-15 09:00:00',
					expiredAt: '2025-11-15 09:00:00',
					couponCode: 'COUPON1728968400'
				}
			]

			// 分页
			const start = (page - 1) * pageSize
			const end = start + pageSize
			const records = allRecords.slice(start, end)

			resolve({
				records,
				total: allRecords.length
			})
		}, 500)
	})
}

/**
 * 获取积分统计
 */
export function getPointsStatistics(): Promise<PointsStatistics> {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('[Mock] 获取积分统计')
			resolve({
				monthEarned: 720,
				monthUsed: 300,
				yearEarned: 2350,
				yearUsed: 770,
				earnedTrend: [
					{ date: '11-25', amount: 50 },
					{ date: '11-26', amount: 2 },
					{ date: '11-27', amount: 0 },
					{ date: '11-28', amount: 52 },
					{ date: '11-29', amount: 2 },
					{ date: '11-30', amount: 2 },
					{ date: '12-01', amount: 500 }
				],
				usedTrend: [
					{ date: '11-25', amount: 0 },
					{ date: '11-26', amount: 0 },
					{ date: '11-27', amount: 200 },
					{ date: '11-28', amount: 0 },
					{ date: '11-29', amount: 0 },
					{ date: '11-30', amount: 0 },
					{ date: '12-01', amount: 0 }
				]
			})
		}, 500)
	})
}

/**
 * 每日签到
 */
export function dailySignIn(): Promise<{ points: number; continuousDays: number }> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('[Mock] 每日签到')

			// 模拟签到成功
			const continuousDays = Math.floor(Math.random() * 7) + 1
			const points = continuousDays === 7 ? 5 : 2

			resolve({
				points,
				continuousDays
			})
		}, 500)
	})
}
