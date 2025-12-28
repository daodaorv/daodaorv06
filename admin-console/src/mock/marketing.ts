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
  targetUserTags: number[] // 目标用户标签ID数组（双向关联）
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
    targetUserTags: [], // 所有用户
    description: '春节假期期间价格上浮50%',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    targetUserTags: [3], // 新用户标签
    description: '淡季期间价格下调20%',
    createdBy: '运营经理-张三',
    createdAt: '2024-11-01T10:00:00.000Z',
    updatedAt: '2024-11-01T10:00:00.000Z',
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
    targetUserTags: [], // 所有用户
    description: '周末价格上浮30%',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
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
  return new Promise(resolve => {
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
        data: { list, total: filtered.length, page, pageSize },
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
  dailyRentalDays?: number // 日租抵扣券：可抵扣天数
  minAmount: number
  maxDiscount: number
  totalQuantity: number
  usedQuantity: number
  remainingQuantity: number
  receivedQuantity: number // 已领取数量
  startDate: string
  endDate: string
  status: CouponStatus
  applicableProductTypes: ApplicableProductType[] // 适用产品类型
  applicableVehicles: string[]
  applicableCampsites?: number[] // 适用营地ID
  applicableTours?: number[] // 适用旅游线路ID
  targetUserTags: number[] // 目标用户标签ID数组（双向关联）
  description: string
  autoGenerateCode: boolean // 是否自动生成优惠码
  codePrefix?: string // 优惠码前缀
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
    targetUserTags: [3], // 新用户标签
    description: '新用户首单立减20%，最高减200元',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    targetUserTags: [100], // PLUS会员专享
    description: '春节期间满2000减300',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
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
    targetUserTags: [1, 2], // VIP用户和活跃用户
    description: '周末订单立减15%，最高减150元',
    autoGenerateCode: false,
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    targetUserTags: [], // 全部用户
    description: '每张券可全额抵扣一天租金，适用于所有车型',
    autoGenerateCode: true,
    codePrefix: 'COUP',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
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
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...mockCoupons]

      if (params.keyword) {
        filtered = filtered.filter(
          c => c.name.includes(params.keyword!) || c.code.includes(params.keyword!)
        )
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
        data: { list, total: filtered.length, page, pageSize },
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
  targetUsers: string // 保留文本描述字段
  targetUserTags: number[] // 目标用户标签ID数组（双向关联）
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
    targetUserTags: [], // 所有用户
    participantCount: 856,
    orderCount: 234,
    revenue: 468000,
    roi: 16.4,
    description: '春节期间房车租赁优惠活动，享受多重优惠',
    rules: '1. 活动期间下单享8折优惠\n2. 满3天送1天\n3. 推荐好友各得200元优惠券',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-20T10:00:00.000Z',
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
    targetUserTags: [3], // 新用户标签
    participantCount: 2280,
    orderCount: 892,
    revenue: 1784000,
    roi: 39.1,
    description: '新用户注册即送200元优惠券大礼包',
    rules: '1. 新用户注册即送200元券包\n2. 首单再享9折优惠\n3. 完成首单送积分',
    createdBy: '运营经理-张三',
    createdAt: '2024-12-20T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
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
  return new Promise(resolve => {
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
        data: { list, total: filtered.length, page, pageSize },
      })
    }, 300)
  })
}

// ==================== 特惠租车管理 ====================

// 特惠租车状态
export type SpecialOfferStatus = 'active' | 'inactive' | 'soldout'

// 特惠租车信息
export interface SpecialOffer {
  id: number
  // 路线信息
  route: {
    fromCityId: number // 出发城市ID
    fromCityName: string // 出发城市名称
    toCityId: number // 目的地城市ID
    toCityName: string // 目的地城市名称
  }
  // 车辆信息
  vehicleId: number // 执行车辆ID
  vehicleNumber: string // 车牌号
  modelId: number // 车型ID
  modelName: string // 车型名称
  brandName: string // 品牌名称
  vehicle: {
    images: string[]
    specifications: Array<{
      label: string
      value: string
    }>
    features: string[]
  }
  // 价格信息
  packagePrice: number
  originalPrice: number
  rentalDays: number
  // 配额管理
  remainingQuota: number
  totalQuota: number
  // 门店信息
  pickupStoreId: number // 取车门店ID
  pickupStoreName: string // 取车门店名称
  pickupStoreAddress: string // 取车门店地址
  returnStoreId: number // 还车门店ID
  returnStoreName: string // 还车门店名称
  returnStoreAddress: string // 还车门店地址
  // 时间范围
  availableTimeRange: {
    start: string
    end: string
  }
  // 套餐详情
  announcement: string
  packageIncludes: Array<{
    name: string
    description: string
  }>
  bookingNotices: string[]
  cancellationPolicy: Array<{
    condition: string
    result: string
  }>
  // 状态
  status: SpecialOfferStatus
  // 元数据
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Package 类型别名
export type Package = SpecialOffer
export type PackageStatus = SpecialOfferStatus

// Mock 特惠租车数据
const mockSpecialOffers: SpecialOffer[] = [
  {
    id: 1,
    // 路线信息（使用门店管理中的真实城市）
    route: {
      fromCityId: 6, // 杭州（门店ID: 6）
      fromCityName: '杭州',
      toCityId: 6, // 杭州（同城还车）
      toCityName: '杭州',
    },
    // 车辆信息
    vehicleId: 1,
    vehicleNumber: '浙A·12345',
    modelId: 1,
    modelName: 'RV80 C型房车',
    brandName: '大通',
    vehicle: {
      images: [
        '/static/vehicles/iveco-c-1.jpg',
        '/static/vehicles/iveco-c-2.jpg',
        '/static/vehicles/iveco-c-3.jpg',
      ],
      specifications: [
        { label: '车型', value: 'C型房车' },
        { label: '座位数', value: '4-6座' },
        { label: '变速箱', value: '自动挡' },
        { label: '燃料类型', value: '柴油' },
        { label: '车长', value: '5.99米' },
        { label: '核载人数', value: '6人' },
      ],
      features: [
        '独立卫浴',
        '太阳能系统',
        '驻车空调',
        '智能导航',
        '倒车影像',
        '冰箱',
        '微波炉',
        '热水器',
      ],
    },
    packagePrice: 1280,
    originalPrice: 1680,
    rentalDays: 3,
    remainingQuota: 3,
    totalQuota: 10,
    // 门店信息（使用门店管理中的真实门店）
    pickupStoreId: 6,
    pickupStoreName: '杭州西湖店',
    pickupStoreAddress: '杭州市西湖区文三路456号',
    returnStoreId: 6,
    returnStoreName: '杭州西湖店',
    returnStoreAddress: '杭州市西湖区文三路456号',
    availableTimeRange: {
      start: '2025-12-01',
      end: '2025-12-31',
    },
    announcement:
      '【限时特惠】杭州西湖店专线套餐，仅剩3个名额！本套餐为固定路线，不支持更改取还车门店。春节期间（1月25日-2月10日）不可用。预订成功后不可退改，请确认行程后再下单。',
    packageIncludes: [
      { name: '车辆租金', description: '3天2晚固定租期' },
      { name: '基础保险', description: '第三者责任险' },
      { name: '首箱燃油', description: '满油交付' },
      { name: '不限公里数', description: '无里程限制' },
      { name: '24小时道路救援', description: '全程保障' },
    ],
    bookingNotices: [
      '本套餐为特惠固定套餐，取车门店、还车门店、租期均不可更改',
      '取车时间可在可选时间段内自由选择，系统将自动计算还车时间',
      '必须选择保险方案（基础险/标准险/全险），保险费用另计',
      '可选择附加服务（如儿童座椅、GPS等），费用另计',
      '取车时需支付押金，还车后无违章自动退还',
      '驾驶人需持有效驾驶证满1年以上',
      '名额有限，预订成功后不可退改，请谨慎下单',
    ],
    cancellationPolicy: [
      { condition: '出发前7天以上取消', result: '全额退款' },
      { condition: '出发前3-7天取消', result: '退款70%' },
      { condition: '出发前1-3天取消', result: '退款30%' },
      { condition: '出发当天取消', result: '不予退款' },
    ],
    status: 'active',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 2,
    // 路线信息（使用门店管理中的真实城市）
    route: {
      fromCityId: 2, // 上海（门店ID: 2）
      fromCityName: '上海',
      toCityId: 2, // 上海（同城还车）
      toCityName: '上海',
    },
    // 车辆信息
    vehicleId: 2,
    vehicleNumber: '沪A·67890',
    modelId: 2,
    modelName: 'V90 B型房车',
    brandName: '大通',
    vehicle: {
      images: ['/static/vehicles/maxus-b-1.jpg', '/static/vehicles/maxus-b-2.jpg'],
      specifications: [
        { label: '车型', value: 'B型房车' },
        { label: '座位数', value: '4座' },
        { label: '变速箱', value: '自动挡' },
        { label: '燃料类型', value: '柴油' },
        { label: '车长', value: '5.7米' },
        { label: '核载人数', value: '4人' },
      ],
      features: ['独立卫浴', '驻车空调', '智能导航', '倒车影像', '冰箱', '热水器'],
    },
    packagePrice: 999,
    originalPrice: 1200,
    rentalDays: 2,
    remainingQuota: 5,
    totalQuota: 15,
    // 门店信息（使用门店管理中的真实门店）
    pickupStoreId: 2,
    pickupStoreName: '上海浦东店',
    pickupStoreAddress: '上海市浦东新区世纪大道1000号',
    returnStoreId: 2,
    returnStoreName: '上海浦东店',
    returnStoreAddress: '上海市浦东新区世纪大道1000号',
    availableTimeRange: {
      start: '2025-01-01',
      end: '2025-12-31',
    },
    announcement:
      '【周末特惠】上海浦东店周末游套餐，轻松享受周边游。周末及节假日可用，工作日不可用。',
    packageIncludes: [
      { name: '车辆租金', description: '2天1晚固定租期' },
      { name: '基础保险', description: '第三者责任险' },
      { name: '首箱燃油', description: '满油交付' },
      { name: '不限公里数', description: '无里程限制' },
    ],
    bookingNotices: [
      '本套餐为周末特惠套餐，仅限周五-周日使用',
      '取车时间可在可选时间段内自由选择',
      '必须选择保险方案，保险费用另计',
      '取车时需支付押金，还车后无违章自动退还',
      '驾驶人需持有效驾驶证满1年以上',
    ],
    cancellationPolicy: [
      { condition: '出发前3天以上取消', result: '全额退款' },
      { condition: '出发前1-3天取消', result: '退款50%' },
      { condition: '出发当天取消', result: '不予退款' },
    ],
    status: 'active',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
]

// 兼容旧的变量名
const mockPackages: Package[] = mockSpecialOffers

// 特惠套餐列表查询参数
export interface PackageListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: PackageStatus
  vehicleType?: string
}

// Mock 获取特惠租车列表
export const mockGetPackageList = (params: PackageListParams) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...mockSpecialOffers]

      if (params.keyword) {
        // 搜索路线（fromCityName/toCityName）或车辆名称
        filtered = filtered.filter(
          p =>
            p.route.fromCityName.includes(params.keyword!) ||
            p.route.toCityName.includes(params.keyword!) ||
            p.brandName.includes(params.keyword!) ||
            p.modelName.includes(params.keyword!)
        )
      }
      if (params.status) {
        filtered = filtered.filter(p => p.status === params.status)
      }
      if (params.vehicleType) {
        // 搜索车辆规格中的车型
        filtered = filtered.filter(p =>
          p.vehicle.specifications.some(
            spec => spec.label === '车型' && spec.value.includes(params.vehicleType!)
          )
        )
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({
        code: 200,
        message: '获取成功',
        data: { list, total: filtered.length, page, pageSize },
      })
    }, 300)
  })
}

// ==================== 房车旅游管理 ====================

// 旅游路线状态
export type TourStatus = 'draft' | 'published' | 'ended'

// 批次状态
export type BatchStatus = 'recruiting' | 'confirmed' | 'departed' | 'finished'

// 房车旅游路线信息
export interface Tour {
  id: number
  title: string // 线路标题
  images: string[] // 线路图片
  tags: string[] // 线路标签
  destination: string // 目的地
  duration: number // 行程天数
  // 门店信息
  pickupStoreId?: number // 取车门店ID
  pickupStoreName?: string // 取车门店名称
  returnStoreId?: number // 还车门店ID
  returnStoreName?: string // 还车门店名称
  // 成团设置
  minPeople: number // 最少成团人数
  maxPeople: number // 最多容纳人数
  // 价格设置（按人头计价）
  pricePerPerson: number // 成人价格/人
  childPrice: number // 儿童价格/人
  // 批次管理
  batches: Array<{
    id: string
    departureDate: string
    status: BatchStatus
    currentPeople: number
    maxPeople: number
  }>
  // 行程安排
  itinerary: Array<{
    title: string
    content: string
    highlights: string[]
  }>
  // 费用说明
  priceIncludes: string[]
  priceExcludes: string[]
  // 预订信息
  announcement: string
  bookingNotices: string[]
  cancellationPolicy: Array<{
    condition: string
    result: string
  }>
  // 状态
  status: TourStatus
  isHot: boolean
  // 元数据
  vehicleType: string // 适用车型（保留用于筛选）
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mock 房车旅游数据
const mockTours: Tour[] = [
  {
    id: 1,
    title: '川西秘境·稻城亚丁房车深度游',
    images: [
      '/static/tours/daocheng-1.jpg',
      '/static/tours/daocheng-2.jpg',
      '/static/tours/daocheng-3.jpg',
    ],
    tags: ['高原风光', '摄影天堂', '藏族文化', '深度体验'],
    destination: '四川·稻城亚丁',
    duration: 7,
    minPeople: 5,
    maxPeople: 12,
    pricePerPerson: 4980,
    childPrice: 2490,
    isHot: true,
    batches: [
      {
        id: '1',
        departureDate: '2025-12-15',
        status: 'recruiting',
        currentPeople: 8,
        maxPeople: 12,
      },
      {
        id: '2',
        departureDate: '2025-12-22',
        status: 'recruiting',
        currentPeople: 3,
        maxPeople: 12,
      },
      {
        id: '3',
        departureDate: '2026-01-05',
        status: 'recruiting',
        currentPeople: 5,
        maxPeople: 12,
      },
      {
        id: '4',
        departureDate: '2025-12-08',
        status: 'confirmed',
        currentPeople: 12,
        maxPeople: 12,
      },
    ],
    itinerary: [
      {
        title: '成都集合',
        content: '全天成都集合，入住酒店。可自由活动，品尝成都美食，游览宽窄巷子、锦里等景点。',
        highlights: ['成都美食', '自由活动'],
      },
      {
        title: '成都 - 新都桥',
        content:
          '早餐后出发，经雅安、泸定，翻越折多山（海拔4298米），抵达摄影天堂新都桥。沿途欣赏大渡河峡谷风光、泸定桥、折多山云海。',
        highlights: ['泸定桥', '折多山', '新都桥'],
      },
      {
        title: '新都桥 - 稻城',
        content:
          '早起拍摄新都桥晨曦，后经雅江、理塘，抵达稻城县。途经高尔寺山、剪子弯山、卡子拉山、海子山，欣赏高原风光。',
        highlights: ['新都桥晨曦', '理塘', '海子山'],
      },
      {
        title: '稻城 - 亚丁',
        content:
          '前往亚丁景区，游览冲古寺、珍珠海、仙乃日神山。下午自由活动，可选择徒步或骑马游览。',
        highlights: ['亚丁景区', '仙乃日', '珍珠海'],
      },
      {
        title: '亚丁深度游',
        content: '全天深度游览亚丁景区，徒步洛绒牛场、牛奶海、五色海。欣赏央迈勇、夏诺多吉神山。',
        highlights: ['牛奶海', '五色海', '三神山'],
      },
      {
        title: '亚丁 - 新都桥',
        content: '早起拍摄亚丁晨曦，后返回新都桥。途经理塘、雅江，欣赏沿途风光。',
        highlights: ['亚丁晨曦', '返程风光'],
      },
      {
        title: '新都桥 - 成都',
        content: '早餐后返回成都，结束愉快的川西之旅。预计下午抵达成都，可根据返程时间安排。',
        highlights: ['返回成都', '行程结束'],
      },
    ],
    priceIncludes: [
      '全程房车使用费（含油费、过路费）',
      '6晚住宿（房车营地或酒店）',
      '全程早餐',
      '专业领队服务',
      '景区门票（亚丁景区）',
      '旅游意外保险',
      '对讲机使用',
      '24小时道路救援',
    ],
    priceExcludes: [
      '往返成都大交通',
      '午餐和晚餐',
      '景区内观光车、索道等费用',
      '个人消费及自费项目',
      '单房差（如需单独住宿）',
      '因不可抗力产生的额外费用',
    ],
    announcement:
      '【行程提醒】本线路为高原地区旅行，海拔最高达4700米，请提前做好身体准备。12月15日批次即将成团，仅剩4个名额。出发前7天确认成团，未成团全额退款。建议购买高原旅游保险，携带防寒衣物和常用药品。',
    bookingNotices: [
      '本线路为成团产品，最少5人成团，最多12人',
      '出发前7天确认是否成团，未成团全额退款',
      '高原地区，请提前做好身体准备，有高血压、心脏病等疾病者不宜参加',
      '行程中如遇天气、路况等不可抗力因素，领队有权调整行程',
      '请携带身份证、驾驶证等有效证件',
      '建议购买高原旅游保险',
      '儿童价格适用于12岁以下，不占床位',
    ],
    cancellationPolicy: [
      { condition: '出发前7天以上取消', result: '全额退款' },
      { condition: '出发前3-7天取消', result: '退款70%' },
      { condition: '出发前1-3天取消', result: '退款30%' },
      { condition: '出发当天取消', result: '不予退款' },
    ],
    status: 'published',
    vehicleType: 'C型房车',
    createdBy: '旅游部-李四',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 2,
    title: '新疆环线房车之旅',
    images: ['/static/tours/xinjiang-1.jpg', '/static/tours/xinjiang-2.jpg'],
    tags: ['西域风情', '自然风光', '多元文化'],
    destination: '新疆',
    duration: 12,
    minPeople: 6,
    maxPeople: 15,
    pricePerPerson: 9800,
    childPrice: 4900,
    isHot: false,
    batches: [
      {
        id: '1',
        departureDate: '2025-06-15',
        status: 'recruiting',
        currentPeople: 8,
        maxPeople: 15,
      },
      {
        id: '2',
        departureDate: '2025-07-01',
        status: 'recruiting',
        currentPeople: 5,
        maxPeople: 15,
      },
    ],
    itinerary: [
      {
        title: '乌鲁木齐集合',
        content: '全天乌鲁木齐集合，入住酒店。可自由活动，品尝新疆美食，游览国际大巴扎等景点。',
        highlights: ['新疆美食', '国际大巴扎'],
      },
      {
        title: '乌鲁木齐 - 天山天池',
        content: '前往天山天池景区，欣赏高山湖泊美景，远眺博格达峰。',
        highlights: ['天山天池', '博格达峰'],
      },
    ],
    priceIncludes: [
      '全程房车使用费（含油费、过路费）',
      '11晚住宿（房车营地或酒店）',
      '全程早餐',
      '专业领队服务',
      '部分景点门票',
      '旅游意外保险',
    ],
    priceExcludes: ['往返乌鲁木齐大交通', '午餐和晚餐', '自费景点门票', '个人消费及自费项目'],
    announcement:
      '【行程提醒】新疆地域辽阔，行程较长，请做好心理准备。建议携带防晒用品和常用药品。',
    bookingNotices: [
      '本线路为成团产品，最少6人成团，最多15人',
      '出发前7天确认是否成团，未成团全额退款',
      '请携带身份证等有效证件',
      '儿童价格适用于12岁以下，不占床位',
    ],
    cancellationPolicy: [
      { condition: '出发前7天以上取消', result: '全额退款' },
      { condition: '出发前3-7天取消', result: '退款70%' },
      { condition: '出发前1-3天取消', result: '退款30%' },
      { condition: '出发当天取消', result: '不予退款' },
    ],
    status: 'published',
    vehicleType: 'C型房车',
    createdBy: '旅游部-李四',
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
  },
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
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...mockTours]

      if (params.keyword) {
        filtered = filtered.filter(
          t => t.title.includes(params.keyword!) || t.destination.includes(params.keyword!)
        )
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
        data: { list, total: filtered.length, page, pageSize },
      })
    }, 300)
  })
}

// ==================== 增值费用管理 ====================

// 增值费用类型（扩展）
export type ExtraFeeType =
  | 'insurance' // 保险服务
  | 'equipment' // 设备租赁
  | 'service' // 增值服务
  | 'store_special' // 门店特色服务（新增）
  | 'special' // 特殊费用（新增）
  | 'other' // 其他费用

// 增值费用状态
export type ExtraFeeStatus = 'active' | 'inactive'

// 费用归属方类型（扩展）
export type ExtraFeeOwnerType =
  | 'platform' // 平台
  | 'store' // 门店（单一门店）
  | 'multi_party' // 多方分配（新增）

// 特殊费用计算方式
export type SpecialFeeCalculationType =
  | 'fixed' // 固定金额
  | 'distance' // 按距离计算（公里数 × 单价）

// 费用分配规则
export interface FeeAllocationRule {
  partyType: 'platform' | 'pickup_store' | 'return_store' | 'service_store'
  partyId?: number
  partyName?: string
  percentage: number // 分配比例（0-100）
  amount?: number // 实际分配金额（计算后填充）
}

// 增值费用信息（完整扩展）
export interface ExtraFee {
  id: number
  name: string
  type: ExtraFeeType
  status: ExtraFeeStatus
  price: number
  unit: string
  isRequired: boolean
  description: string

  // 归属方配置
  ownerType: ExtraFeeOwnerType // 归属方（平台/门店/多方）
  storeId?: number // 门店ID（当ownerType为store时）
  storeName?: string // 门店名称

  // 门店特色服务配置（当type为store_special时）
  isStoreSpecial?: boolean // 是否为门店特色服务
  applicableStoreIds?: number[] // 适用门店ID列表

  // 特殊费用配置（当type为special时）
  calculationType?: SpecialFeeCalculationType // 计算方式
  distanceUnitPrice?: number // 距离单价（元/公里）
  allocationRules?: FeeAllocationRule[] // 分配规则列表

  // 自动分配配置（用于常规增值费用）
  autoAllocate?: boolean // 是否自动分配给取还车门店
  allocationStrategy?: 'same_store' | 'split_evenly' | 'custom' // 分配策略

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
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  // 门店归属示例数据
  {
    id: 6,
    name: '上门取车服务',
    type: 'service',
    status: 'active',
    price: 100,
    unit: '次',
    isRequired: false,
    description: '提供上门取车服务，节省客户时间',
    ownerType: 'store',
    storeId: 1,
    storeName: '北京朝阳店',
    createdBy: '门店经理-王五',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-05T10:00:00.000Z',
  },
  {
    id: 7,
    name: '深度清洁服务',
    type: 'service',
    status: 'active',
    price: 200,
    unit: '次',
    isRequired: false,
    description: '专业深度清洁，包含内饰清洁、消毒等',
    ownerType: 'platform',
    createdBy: '运营经理-张三',
    createdAt: '2025-01-06T10:00:00.000Z',
    updatedAt: '2025-01-06T10:00:00.000Z',
  },
  {
    id: 8,
    name: '上门还车服务',
    type: 'service',
    status: 'active',
    price: 120,
    unit: '次',
    isRequired: false,
    description: '提供上门还车服务，方便客户',
    ownerType: 'store',
    storeId: 2,
    storeName: '上海浦东店',
    createdBy: '门店经理-孙七',
    createdAt: '2025-01-07T10:00:00.000Z',
    updatedAt: '2025-01-07T10:00:00.000Z',
  },
  // 门店特色服务示例数据
  {
    id: 9,
    name: '北京机场接送服务',
    type: 'store_special',
    status: 'active',
    price: 300,
    unit: '次',
    isRequired: false,
    description: '提供首都机场、大兴机场往返接送服务',
    ownerType: 'store',
    storeId: 1,
    storeName: '北京朝阳店',
    isStoreSpecial: true,
    applicableStoreIds: [1],
    createdBy: '门店经理-王五',
    createdAt: '2025-01-08T10:00:00.000Z',
    updatedAt: '2025-01-08T10:00:00.000Z',
  },
  {
    id: 10,
    name: '上海迪士尼专线',
    type: 'store_special',
    status: 'active',
    price: 250,
    unit: '次',
    isRequired: false,
    description: '提供上海迪士尼乐园往返接送服务',
    ownerType: 'store',
    storeId: 2,
    storeName: '上海浦东店',
    isStoreSpecial: true,
    applicableStoreIds: [2],
    createdBy: '门店经理-孙七',
    createdAt: '2025-01-09T10:00:00.000Z',
    updatedAt: '2025-01-09T10:00:00.000Z',
  },
  {
    id: 11,
    name: '车辆深度清洁（北京店）',
    type: 'store_special',
    status: 'active',
    price: 200,
    unit: '次',
    isRequired: false,
    description: '专业团队提供车辆内外深度清洁服务',
    ownerType: 'store',
    storeId: 1,
    storeName: '北京朝阳店',
    isStoreSpecial: true,
    applicableStoreIds: [1],
    createdBy: '门店经理-王五',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  // 特殊费用示例数据
  {
    id: 100,
    name: '异地还车费',
    type: 'special',
    status: 'active',
    price: 0, // 动态计算
    unit: '次',
    isRequired: false,
    description: '根据取还车门店距离自动计算，1.5元/公里',
    ownerType: 'multi_party',
    calculationType: 'distance',
    distanceUnitPrice: 1.5,
    allocationRules: [
      { partyType: 'pickup_store', percentage: 40, partyName: '取车门店' },
      { partyType: 'return_store', percentage: 40, partyName: '还车门店' },
      { partyType: 'platform', percentage: 20, partyName: '平台' },
    ],
    createdBy: '运营经理-张三',
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 101,
    name: '跨省调度费',
    type: 'special',
    status: 'active',
    price: 0, // 动态计算
    unit: '次',
    isRequired: false,
    description: '跨省还车需支付调度费用，2元/公里',
    ownerType: 'multi_party',
    calculationType: 'distance',
    distanceUnitPrice: 2.0,
    allocationRules: [
      { partyType: 'pickup_store', percentage: 30, partyName: '取车门店' },
      { partyType: 'return_store', percentage: 30, partyName: '还车门店' },
      { partyType: 'platform', percentage: 40, partyName: '平台' },
    ],
    createdBy: '运营经理-张三',
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
  },
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
  return new Promise(resolve => {
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
        data: { list, total: filtered.length, page, pageSize },
      })
    }, 300)
  })
}

// Mock 创建增值费用
export const mockCreateExtraFee = (data: Partial<ExtraFee>) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newExtraFee: ExtraFee = {
        id: mockExtraFees.length + 1,
        name: data.name || '',
        type: data.type || 'service',
        status: data.status || 'inactive',
        price: data.price || 0,
        unit: data.unit || '天',
        isRequired: data.isRequired || false,
        description: data.description || '',
        ownerType: data.ownerType || 'platform',
        storeId: data.storeId,
        storeName: data.storeName,
        createdBy: '系统管理员',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockExtraFees.push(newExtraFee)
      resolve({
        code: 200,
        message: '创建成功',
        data: newExtraFee,
      })
    }, 300)
  })
}

// Mock 更新增值费用
export const mockUpdateExtraFee = (id: number, data: Partial<ExtraFee>) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockExtraFees.findIndex(f => f.id === id)
      if (index === -1) {
        reject({
          code: 404,
          message: '增值费用不存在',
        })
        return
      }

      mockExtraFees[index] = {
        ...mockExtraFees[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      resolve({
        code: 200,
        message: '更新成功',
        data: mockExtraFees[index],
      })
    }, 300)
  })
}

// Mock 删除增值费用
export const mockDeleteExtraFee = (id: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockExtraFees.findIndex(f => f.id === id)
      if (index === -1) {
        reject({
          code: 404,
          message: '增值费用不存在',
        })
        return
      }

      mockExtraFees.splice(index, 1)
      resolve({
        code: 200,
        message: '删除成功',
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
  return new Promise(resolve => {
    setTimeout(() => {
      const stats: MarketingStats = {
        totalCoupons: mockCoupons.length,
        activeCoupons: mockCoupons.filter(c => c.status === 'active').length,
        usedCoupons: mockCoupons.reduce((sum, c) => sum + c.usedQuantity, 0),
        totalActivities: mockActivities.length,
        activeActivities: mockActivities.filter(a => a.status === 'active').length,
        totalRevenue: mockActivities.reduce((sum, a) => sum + a.revenue, 0),
        averageROI: mockActivities.reduce((sum, a) => sum + a.roi, 0) / mockActivities.length,
      }
      resolve({
        code: 200,
        message: '获取成功',
        data: stats,
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
  sourceDetail?: string // 来源详情（如活动名称、订单号等）

  // 使用信息（仅 type=use 时）
  orderId?: number
  orderNo?: string
  actualDiscountAmount?: number // 实际优惠金额

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
    deviceInfo: 'iPhone 13 Pro',
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
    deviceInfo: 'iPhone 13 Pro',
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
    deviceInfo: 'Android Xiaomi 12',
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
    deviceInfo: 'iPhone 14',
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
    deviceInfo: 'iPhone 14',
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
    deviceInfo: 'Web Chrome',
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
    deviceInfo: 'Android Huawei P50',
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
    deviceInfo: 'System',
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
    deviceInfo: 'Web Safari',
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
    deviceInfo: 'iPhone 15',
  },
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
  keyword?: string // 搜索优惠券名称、用户名、手机号
}

// Mock 获取优惠券记录列表
export const mockGetCouponRecordList = (params: CouponRecordListParams) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...mockCouponRecords]

      if (params.keyword) {
        filtered = filtered.filter(
          r =>
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
        data: { list, total: filtered.length, page, pageSize },
      })
    }, 300)
  })
}
