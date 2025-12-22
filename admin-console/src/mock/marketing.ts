/**
 * 营销管理 Mock 数据
 */

// ==================== 价格策略管理 ====================

// 价格策略类型
export type PricingStrategyType = 'seasonal' | 'holiday' | 'demand' | 'promotion'

// 价格策略状态
export type PricingStrategyStatus = 'active' | 'inactive' | 'expired'

// 价格策略信息
export interface PricingStrategy {
  id: number
  name: string
  type: PricingStrategyType
  status: PricingStrategyStatus
  vehicleTypes: string[]
  adjustmentType: 'percentage' | 'fixed'
  adjustmentValue: number
  startDate: string
  endDate: string
  priority: number
  targetUserTags: number[]  // 目标用户标签ID数组（双向关联）
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 价格策略数据
const mockPricingStrategies: PricingStrategy[] = [
  {
    id: 1,
    name: '春节假期价格上浮',
    type: 'holiday',
    status: 'active',
    vehicleTypes: ['C型房车', 'B型房车', '拖挂房车'],
    adjustmentType: 'percentage',
    adjustmentValue: 50,
    startDate: '2025-01-28',
    endDate: '2025-02-04',
    priority: 1,
    targetUserTags: [],  // 所有用户
    description: '春节假期期间价格上浮50%',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    name: '淡季优惠策略',
    type: 'seasonal',
    status: 'active',
    vehicleTypes: ['所有车型'],
    adjustmentType: 'percentage',
    adjustmentValue: -20,
    startDate: '2025-11-15',
    endDate: '2026-03-15',
    priority: 2,
    targetUserTags: [3],  // 新用户标签
    description: '淡季期间价格下调20%',
    createdBy: '运营经理-张三',
    createdAt: '2024-11-01T10:00:00.000Z',
    updatedAt: '2024-11-01T10:00:00.000Z'
  },
  {
    id: 3,
    name: '周末价格调整',
    type: 'demand',
    status: 'active',
    vehicleTypes: ['所有车型'],
    adjustmentType: 'percentage',
    adjustmentValue: 30,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    priority: 3,
    targetUserTags: [],  // 所有用户
    description: '周末价格上浮30%',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  }
]

// 价格策略列表查询参数
export interface PricingStrategyListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: PricingStrategyType
  status?: PricingStrategyStatus
}

// Mock 获取价格策略列表
export const mockGetPricingStrategyList = (params: PricingStrategyListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockPricingStrategies]

      if (params.keyword) {
        filtered = filtered.filter(s => s.name.includes(params.keyword!))
      }
      if (params.type) {
        filtered = filtered.filter(s => s.type === params.type)
      }
      if (params.status) {
        filtered = filtered.filter(s => s.status === params.status)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 优惠券管理 ====================

// 优惠券类型
export type CouponType = 'discount' | 'cash' | 'gift' | 'daily_rental'

// 优惠券状态
export type CouponStatus = 'active' | 'inactive' | 'expired'

// 适用产品类型
export type ApplicableProductType = 'vehicle_rental' | 'campsite' | 'tour' | 'all'

// 优惠券信息
export interface Coupon {
  id: number
  name: string
  type: CouponType
  code: string
  discountType: 'percentage' | 'fixed' | 'daily_rental'
  discountValue: number
  dailyRentalDays?: number  // 日租抵扣券：可抵扣天数
  minAmount: number
  maxDiscount: number
  totalQuantity: number
  usedQuantity: number
  remainingQuantity: number
  receivedQuantity: number  // 已领取数量
  startDate: string
  endDate: string
  status: CouponStatus
  applicableProductTypes: ApplicableProductType[]  // 适用产品类型
  applicableVehicles: string[]
  applicableCampsites?: number[]  // 适用营地ID
  applicableTours?: number[]  // 适用旅游线路ID
  targetUserTags: number[]  // 目标用户标签ID数组（双向关联）
  description: string
  autoGenerateCode: boolean  // 是否自动生成优惠码
  codePrefix?: string  // 优惠码前缀
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 优惠券数据
const mockCoupons: Coupon[] = [
  {
    id: 1,
    name: '新用户专享券',
    type: 'discount',
    code: 'NEW2025',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 500,
    maxDiscount: 200,
    totalQuantity: 1000,
    usedQuantity: 356,
    remainingQuantity: 644,
    receivedQuantity: 680,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    applicableProductTypes: ['vehicle_rental'],
    applicableVehicles: ['所有车型'],
    targetUserTags: [3],  // 新用户标签
    description: '新用户首单立减20%，最高减200元',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    name: '春节特惠券',
    type: 'cash',
    code: 'CNY2025',
    discountType: 'fixed',
    discountValue: 300,
    minAmount: 2000,
    maxDiscount: 300,
    totalQuantity: 500,
    usedQuantity: 128,
    remainingQuantity: 372,
    receivedQuantity: 450,
    startDate: '2025-01-20',
    endDate: '2025-02-10',
    status: 'active',
    applicableProductTypes: ['vehicle_rental'],
    applicableVehicles: ['C型房车', 'B型房车'],
    targetUserTags: [100],  // PLUS会员专享
    description: '春节期间满2000减300',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z'
  },
  {
    id: 3,
    name: '周末出行券',
    type: 'discount',
    code: 'WEEKEND',
    discountType: 'percentage',
    discountValue: 15,
    minAmount: 800,
    maxDiscount: 150,
    totalQuantity: 2000,
    usedQuantity: 892,
    remainingQuantity: 1108,
    receivedQuantity: 1580,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    applicableProductTypes: ['all'],
    applicableVehicles: ['所有车型'],
    targetUserTags: [1, 2],  // VIP用户和活跃用户
    description: '周末订单立减15%，最高减150元',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 4,
    name: '日租抵扣券',
    type: 'daily_rental',
    code: 'COUP20250121A3B7',
    discountType: 'daily_rental',
    discountValue: 0,
    dailyRentalDays: 1,
    minAmount: 0,
    maxDiscount: 0,
    totalQuantity: 500,
    usedQuantity: 45,
    remainingQuantity: 455,
    receivedQuantity: 280,
    startDate: '2025-01-15',
    endDate: '2025-03-31',
    status: 'active',
    applicableProductTypes: ['vehicle_rental'],
    applicableVehicles: ['所有车型'],
    targetUserTags: [],  // 全部用户
    description: '每张券可全额抵扣一天租金，适用于所有车型',
    autoGenerateCode: true,
    codePrefix: 'COUP',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z'
  }
]

// 优惠券列表查询参数
export interface CouponListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: CouponType
  status?: CouponStatus
}

// Mock 获取优惠券列表
export const mockGetCouponList = (params: CouponListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockCoupons]

      if (params.keyword) {
        filtered = filtered.filter(c => c.name.includes(params.keyword!) || c.code.includes(params.keyword!))
      }
      if (params.type) {
        filtered = filtered.filter(c => c.type === params.type)
      }
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 营销活动管理 ====================

// 活动类型
export type ActivityType = 'promotion' | 'event' | 'campaign'

// 活动状态
export type ActivityStatus = 'draft' | 'active' | 'paused' | 'ended'

// 营销活动信息
export interface MarketingActivity {
  id: number
  name: string
  type: ActivityType
  status: ActivityStatus
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  targetUsers: string  // 保留文本描述字段
  targetUserTags: number[]  // 目标用户标签ID数组（双向关联）
  participantCount: number
  orderCount: number
  revenue: number
  roi: number
  description: string
  rules: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 营销活动数据
const mockActivities: MarketingActivity[] = [
  {
    id: 1,
    name: '春节房车自驾游活动',
    type: 'promotion',
    status: 'active',
    startDate: '2025-01-20',
    endDate: '2025-02-10',
    budget: 50000,
    actualCost: 28500,
    targetUsers: '所有用户',
    targetUserTags: [],  // 所有用户
    participantCount: 856,
    orderCount: 234,
    revenue: 468000,
    roi: 16.4,
    description: '春节期间房车租赁优惠活动，享受多重优惠',
    rules: '1. 活动期间下单享8折优惠\n2. 满3天送1天\n3. 推荐好友各得200元优惠券',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-20T10:00:00.000Z'
  },
  {
    id: 2,
    name: '新用户注册送券活动',
    type: 'campaign',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    budget: 100000,
    actualCost: 45600,
    targetUsers: '新注册用户',
    targetUserTags: [3],  // 新用户标签
    participantCount: 2280,
    orderCount: 892,
    revenue: 1784000,
    roi: 39.1,
    description: '新用户注册即送200元优惠券大礼包',
    rules: '1. 新用户注册即送200元券包\n2. 首单再享9折优惠\n3. 完成首单送积分',
    createdBy: '运营经理-张三',
    createdAt: '2024-12-20T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  }
]

// 营销活动列表查询参数
export interface ActivityListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: ActivityType
  status?: ActivityStatus
}

// Mock 获取营销活动列表
export const mockGetActivityList = (params: ActivityListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockActivities]

      if (params.keyword) {
        filtered = filtered.filter(a => a.name.includes(params.keyword!))
      }
      if (params.type) {
        filtered = filtered.filter(a => a.type === params.type)
      }
      if (params.status) {
        filtered = filtered.filter(a => a.status === params.status)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 特惠套餐管理 ====================

// 套餐状态
export type PackageStatus = 'active' | 'inactive' | 'soldout'

// 特惠套餐信息
export interface Package {
  id: number
  name: string
  status: PackageStatus
  vehicleType: string
  days: number
  originalPrice: number
  packagePrice: number
  discount: number
  totalQuantity: number
  soldQuantity: number
  remainingQuantity: number
  startDate: string
  endDate: string
  includes: string[]
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 特惠套餐数据
const mockPackages: Package[] = [
  {
    id: 1,
    name: '春节7天自驾套餐',
    status: 'active',
    vehicleType: 'C型房车',
    days: 7,
    originalPrice: 4900,
    packagePrice: 3999,
    discount: 18.4,
    totalQuantity: 50,
    soldQuantity: 28,
    remainingQuantity: 22,
    startDate: '2025-01-28',
    endDate: '2025-02-04',
    includes: ['车辆租赁7天', '全险保障', '免费异地还车', '赠送营地券2张', '24小时道路救援'],
    description: '春节黄金周特惠套餐，包含7天租赁及多项增值服务',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z'
  },
  {
    id: 2,
    name: '周末短途套餐',
    status: 'active',
    vehicleType: 'B型房车',
    days: 2,
    originalPrice: 1200,
    packagePrice: 999,
    discount: 16.8,
    totalQuantity: 100,
    soldQuantity: 67,
    remainingQuantity: 33,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    includes: ['车辆租赁2天', '基础保险', '免费市内取还车', '赠送洗车券1张'],
    description: '周末短途出行特惠套餐，轻松享受房车生活',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  }
]

// 特惠套餐列表查询参数
export interface PackageListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: PackageStatus
  vehicleType?: string
}

// Mock 获取特惠套餐列表
export const mockGetPackageList = (params: PackageListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockPackages]

      if (params.keyword) {
        filtered = filtered.filter(p => p.name.includes(params.keyword!))
      }
      if (params.status) {
        filtered = filtered.filter(p => p.status === params.status)
      }
      if (params.vehicleType) {
        filtered = filtered.filter(p => p.vehicleType === params.vehicleType)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 房车旅游管理 ====================

// 旅游路线状态
export type TourStatus = 'draft' | 'published' | 'full' | 'ended'

// 房车旅游路线信息
export interface Tour {
  id: number
  name: string
  status: TourStatus
  destination: string
  days: number
  price: number
  vehicleType: string
  maxParticipants: number
  currentParticipants: number
  departureDate: string
  returnDate: string
  route: string[]
  highlights: string[]
  includes: string[]
  excludes: string[]
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 房车旅游数据
const mockTours: Tour[] = [
  {
    id: 1,
    name: '川藏线房车自驾游',
    status: 'published',
    destination: '西藏拉萨',
    days: 15,
    price: 12800,
    vehicleType: 'C型房车',
    maxParticipants: 20,
    currentParticipants: 12,
    departureDate: '2025-05-01',
    returnDate: '2025-05-15',
    route: ['成都', '雅安', '康定', '理塘', '巴塘', '芒康', '左贡', '八宿', '波密', '林芝', '拉萨'],
    highlights: ['318国道最美路段', '稻城亚丁', '然乌湖', '布达拉宫', '纳木错'],
    includes: ['车辆租赁15天', '全程领队', '营地住宿', '景点门票', '旅游保险'],
    excludes: ['餐饮费用', '个人消费', '自费项目'],
    description: '川藏线经典路线，领略高原风光，体验藏族文化',
    createdBy: '旅游部-李四',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z'
  },
  {
    id: 2,
    name: '新疆环线房车之旅',
    status: 'published',
    destination: '新疆',
    days: 12,
    price: 9800,
    vehicleType: 'C型房车',
    maxParticipants: 15,
    currentParticipants: 8,
    departureDate: '2025-06-15',
    returnDate: '2025-06-26',
    route: ['乌鲁木齐', '天山天池', '吐鲁番', '库尔勒', '库车', '喀什', '和田', '阿克苏'],
    highlights: ['天山天池', '火焰山', '喀纳斯', '赛里木湖', '那拉提草原'],
    includes: ['车辆租赁12天', '全程领队', '营地住宿', '部分景点门票', '旅游保险'],
    excludes: ['餐饮费用', '个人消费', '自费景点'],
    description: '新疆环线深度游，探索西域风情，品味多元文化',
    createdBy: '旅游部-李四',
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z'
  }
]

// 房车旅游列表查询参数
export interface TourListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: TourStatus
  destination?: string
}

// Mock 获取房车旅游列表
export const mockGetTourList = (params: TourListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockTours]

      if (params.keyword) {
        filtered = filtered.filter(t => t.name.includes(params.keyword!) || t.destination.includes(params.keyword!))
      }
      if (params.status) {
        filtered = filtered.filter(t => t.status === params.status)
      }
      if (params.destination) {
        filtered = filtered.filter(t => t.destination.includes(params.destination!))
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 增值费用管理 ====================

// 增值费用类型
export type ExtraFeeType = 'insurance' | 'equipment' | 'service' | 'other'

// 增值费用状态
export type ExtraFeeStatus = 'active' | 'inactive'

// 增值费用信息
export interface ExtraFee {
  id: number
  name: string
  type: ExtraFeeType
  status: ExtraFeeStatus
  price: number
  unit: string
  isRequired: boolean
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 增值费用数据
const mockExtraFees: ExtraFee[] = [
  {
    id: 1,
    name: '全险保障',
    type: 'insurance',
    status: 'active',
    price: 100,
    unit: '天',
    isRequired: false,
    description: '包含车损险、三者险、盗抢险等全面保障',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    name: '异地还车费',
    type: 'service',
    status: 'active',
    price: 500,
    unit: '次',
    isRequired: false,
    description: '支持异地还车，收取调度费用',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 3,
    name: '儿童安全座椅',
    type: 'equipment',
    status: 'active',
    price: 30,
    unit: '天',
    isRequired: false,
    description: '提供儿童安全座椅租赁服务',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 4,
    name: '户外装备包',
    type: 'equipment',
    status: 'active',
    price: 50,
    unit: '天',
    isRequired: false,
    description: '包含帐篷、睡袋、炊具等户外装备',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 5,
    name: '24小时道路救援',
    type: 'service',
    status: 'active',
    price: 80,
    unit: '天',
    isRequired: false,
    description: '提供24小时道路救援服务',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z'
  }
]

// 增值费用列表查询参数
export interface ExtraFeeListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: ExtraFeeType
  status?: ExtraFeeStatus
}

// Mock 获取增值费用列表
export const mockGetExtraFeeList = (params: ExtraFeeListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockExtraFees]

      if (params.keyword) {
        filtered = filtered.filter(f => f.name.includes(params.keyword!))
      }
      if (params.type) {
        filtered = filtered.filter(f => f.type === params.type)
      }
      if (params.status) {
        filtered = filtered.filter(f => f.status === params.status)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}

// ==================== 营销统计 ====================

// 营销统计信息
export interface MarketingStats {
  totalCoupons: number
  activeCoupons: number
  usedCoupons: number
  totalActivities: number
  activeActivities: number
  totalRevenue: number
  averageROI: number
}

// Mock 获取营销统计
export const mockGetMarketingStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats: MarketingStats = {
        totalCoupons: mockCoupons.length,
        activeCoupons: mockCoupons.filter(c => c.status === 'active').length,
        usedCoupons: mockCoupons.reduce((sum, c) => sum + c.usedQuantity, 0),
        totalActivities: mockActivities.length,
        activeActivities: mockActivities.filter(a => a.status === 'active').length,
        totalRevenue: mockActivities.reduce((sum, a) => sum + a.revenue, 0),
        averageROI: mockActivities.reduce((sum, a) => sum + a.roi, 0) / mockActivities.length
      }
      resolve({
        code: 200,
        message: '获取成功',
        data: stats
      })
    }, 200)
  })
}

// ==================== 优惠券记录管理 ====================

// 记录类型
export type CouponRecordType = 'receive' | 'use' | 'expire' | 'transfer' | 'revoke'

// 记录来源
export type CouponRecordSource = 'manual' | 'activity' | 'register' | 'order' | 'share' | 'admin'

// 优惠券记录信息
export interface CouponRecord {
  id: number
  couponId: number
  couponCode: string
  couponName: string
  userId: number
  userName: string
  userPhone: string

  // 记录信息
  recordType: CouponRecordType
  source: CouponRecordSource
  sourceDetail?: string  // 来源详情（如活动名称、订单号等）

  // 使用信息（仅 type=use 时）
  orderId?: number
  orderNo?: string
  actualDiscountAmount?: number  // 实际优惠金额

  // 转赠信息（仅 type=transfer 时）
  transferToUserId?: number
  transferToUserName?: string
  transferReason?: string

  // 失效信息（仅 type=expire/revoke 时）
  expireReason?: string
  revokeReason?: string
  revokedBy?: string

  // 时间戳
  recordTime: string
  createdAt: string

  // 其他
  remark?: string
  ipAddress?: string
  deviceInfo?: string
}

// Mock 优惠券记录数据
const mockCouponRecords: CouponRecord[] = [
  {
    id: 1,
    couponId: 1,
    couponCode: 'NEW2025',
    couponName: '新用户专享券',
    userId: 1001,
    userName: '张三',
    userPhone: '13800138001',
    recordType: 'receive',
    source: 'register',
    sourceDetail: '新用户注册赠送',
    recordTime: '2025-01-15T10:30:00.000Z',
    createdAt: '2025-01-15T10:30:00.000Z',
    remark: '新用户注册自动发放',
    ipAddress: '192.168.1.100',
    deviceInfo: 'iPhone 13 Pro'
  },
  {
    id: 2,
    couponId: 1,
    couponCode: 'NEW2025',
    couponName: '新用户专享券',
    userId: 1001,
    userName: '张三',
    userPhone: '13800138001',
    recordType: 'use',
    source: 'order',
    sourceDetail: '订单号：ORD202501150001',
    orderId: 5001,
    orderNo: 'ORD202501150001',
    actualDiscountAmount: 180,
    recordTime: '2025-01-16T14:20:00.000Z',
    createdAt: '2025-01-16T14:20:00.000Z',
    remark: '首单使用优惠券',
    ipAddress: '192.168.1.100',
    deviceInfo: 'iPhone 13 Pro'
  },
  {
    id: 3,
    couponId: 2,
    couponCode: 'CNY2025',
    couponName: '春节特惠券',
    userId: 1002,
    userName: '李四',
    userPhone: '13800138002',
    recordType: 'receive',
    source: 'activity',
    sourceDetail: '春节房车自驾游活动',
    recordTime: '2025-01-20T09:00:00.000Z',
    createdAt: '2025-01-20T09:00:00.000Z',
    remark: '参与活动领取',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Android Xiaomi 12'
  },
  {
    id: 4,
    couponId: 3,
    couponCode: 'WEEKEND',
    couponName: '周末出行券',
    userId: 1003,
    userName: '王五',
    userPhone: '13800138003',
    recordType: 'receive',
    source: 'share',
    sourceDetail: '好友分享获得',
    recordTime: '2025-01-18T16:45:00.000Z',
    createdAt: '2025-01-18T16:45:00.000Z',
    remark: '通过分享链接领取',
    ipAddress: '192.168.1.102',
    deviceInfo: 'iPhone 14'
  },
  {
    id: 5,
    couponId: 3,
    couponCode: 'WEEKEND',
    couponName: '周末出行券',
    userId: 1003,
    userName: '王五',
    userPhone: '13800138003',
    recordType: 'use',
    source: 'order',
    sourceDetail: '订单号：ORD202501190001',
    orderId: 5002,
    orderNo: 'ORD202501190001',
    actualDiscountAmount: 120,
    recordTime: '2025-01-19T11:30:00.000Z',
    createdAt: '2025-01-19T11:30:00.000Z',
    remark: '周末订单使用',
    ipAddress: '192.168.1.102',
    deviceInfo: 'iPhone 14'
  },
  {
    id: 6,
    couponId: 4,
    couponCode: 'COUP20250121A3B7',
    couponName: '日租抵扣券',
    userId: 1004,
    userName: '赵六',
    userPhone: '13800138004',
    recordType: 'receive',
    source: 'admin',
    sourceDetail: '管理员手动发放',
    recordTime: '2025-01-21T10:00:00.000Z',
    createdAt: '2025-01-21T10:00:00.000Z',
    remark: '客服补偿发放',
    ipAddress: '192.168.1.103',
    deviceInfo: 'Web Chrome'
  },
  {
    id: 7,
    couponId: 1,
    couponCode: 'NEW2025',
    couponName: '新用户专享券',
    userId: 1005,
    userName: '孙七',
    userPhone: '13800138005',
    recordType: 'receive',
    source: 'register',
    sourceDetail: '新用户注册赠送',
    recordTime: '2025-01-17T08:20:00.000Z',
    createdAt: '2025-01-17T08:20:00.000Z',
    ipAddress: '192.168.1.104',
    deviceInfo: 'Android Huawei P50'
  },
  {
    id: 8,
    couponId: 1,
    couponCode: 'NEW2025',
    couponName: '新用户专享券',
    userId: 1005,
    userName: '孙七',
    userPhone: '13800138005',
    recordType: 'expire',
    source: 'manual',
    expireReason: '优惠券已过期',
    recordTime: '2025-01-20T23:59:59.000Z',
    createdAt: '2025-01-20T23:59:59.000Z',
    remark: '系统自动过期',
    ipAddress: '127.0.0.1',
    deviceInfo: 'System'
  },
  {
    id: 9,
    couponId: 2,
    couponCode: 'CNY2025',
    couponName: '春节特惠券',
    userId: 1006,
    userName: '周八',
    userPhone: '13800138006',
    recordType: 'receive',
    source: 'manual',
    sourceDetail: '客服手动发放',
    recordTime: '2025-01-21T14:00:00.000Z',
    createdAt: '2025-01-21T14:00:00.000Z',
    remark: '投诉补偿',
    ipAddress: '192.168.1.105',
    deviceInfo: 'Web Safari'
  },
  {
    id: 10,
    couponId: 3,
    couponCode: 'WEEKEND',
    couponName: '周末出行券',
    userId: 1007,
    userName: '吴九',
    userPhone: '13800138007',
    recordType: 'transfer',
    source: 'share',
    sourceDetail: '用户转赠',
    transferToUserId: 1008,
    transferToUserName: '郑十',
    transferReason: '赠送给朋友',
    recordTime: '2025-01-20T18:30:00.000Z',
    createdAt: '2025-01-20T18:30:00.000Z',
    remark: '用户主动转赠',
    ipAddress: '192.168.1.106',
    deviceInfo: 'iPhone 15'
  }
]

// 优惠券记录列表查询参数
export interface CouponRecordListParams {
  page?: number
  pageSize?: number
  couponId?: number
  userId?: number
  recordType?: CouponRecordType
  source?: CouponRecordSource
  startDate?: string
  endDate?: string
  keyword?: string  // 搜索优惠券名称、用户名、手机号
}

// Mock 获取优惠券记录列表
export const mockGetCouponRecordList = (params: CouponRecordListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockCouponRecords]

      if (params.keyword) {
        filtered = filtered.filter(r =>
          r.couponName.includes(params.keyword!) ||
          r.userName.includes(params.keyword!) ||
          r.userPhone.includes(params.keyword!)
        )
      }
      if (params.couponId) {
        filtered = filtered.filter(r => r.couponId === params.couponId)
      }
      if (params.userId) {
        filtered = filtered.filter(r => r.userId === params.userId)
      }
      if (params.recordType) {
        filtered = filtered.filter(r => r.recordType === params.recordType)
      }
      if (params.source) {
        filtered = filtered.filter(r => r.source === params.source)
      }
      if (params.startDate) {
        filtered = filtered.filter(r => r.recordTime >= params.startDate!)
      }
      if (params.endDate) {
        filtered = filtered.filter(r => r.recordTime <= params.endDate!)
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize }
      })
    }, 300)
  })
}
