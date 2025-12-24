/**
 * 分润管理 Mock 数据
 */
import type {
  PromotionRelation,
  PromotionProfitConfig,
  PromotionProfitRecord,
  HostingProfitConfig,
  HostingProfitRecord,
  CampsiteProfitConfig,
  TourProfitConfig,
  BalanceRecord,
  WithdrawalRequest,
  RiskControlRule,
} from '@/types/profit'
import {
  ProductType,
  HostingType,
  ProfitStatus,
  PromotionLevel,
} from '@/types/profit'

// ==================== 推广关系数据 ====================

export const mockPromotionRelations: PromotionRelation[] = [
  {
    id: '1',
    userId: 'user_003',
    userName: '张三',
    level1PromoterUserId: 'user_002',
    level1PromoterUserName: '李四',
    level2PromoterUserId: 'user_001',
    level2PromoterUserName: '王五',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    userId: 'user_004',
    userName: '赵六',
    level1PromoterUserId: 'user_002',
    level1PromoterUserName: '李四',
    level2PromoterUserId: 'user_001',
    level2PromoterUserName: '王五',
    createdAt: '2024-01-20 14:20:00',
  },
  {
    id: '3',
    userId: 'user_005',
    userName: '孙七',
    level1PromoterUserId: 'user_003',
    level1PromoterUserName: '张三',
    level2PromoterUserId: 'user_002',
    level2PromoterUserName: '李四',
    createdAt: '2024-02-01 09:15:00',
  },
]

// ==================== 推广分润配置数据 ====================

export const mockPromotionProfitConfigs: PromotionProfitConfig[] = [
  {
    id: '1',
    productType: ProductType.VEHICLE_RENTAL,
    level1Ratio: 5,
    level2Ratio: 2,
    plusMemberDirectReward: 50,
    plusMemberAssistReward: 20,
    milestoneRewards: [
      { orderCount: 10, reward: 100 },
      { orderCount: 50, reward: 500 },
      { orderCount: 100, reward: 1500 },
    ],
    enabled: true,
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    productType: ProductType.CAMPSITE,
    level1Ratio: 4,
    level2Ratio: 1.5,
    plusMemberDirectReward: 50,
    plusMemberAssistReward: 20,
    milestoneRewards: [
      { orderCount: 10, reward: 80 },
      { orderCount: 50, reward: 400 },
    ],
    enabled: true,
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '3',
    productType: ProductType.TOUR,
    level1Ratio: 3,
    level2Ratio: 1,
    plusMemberDirectReward: 50,
    plusMemberAssistReward: 20,
    milestoneRewards: [
      { orderCount: 10, reward: 60 },
      { orderCount: 50, reward: 300 },
    ],
    enabled: true,
    updatedAt: '2024-01-01 10:00:00',
  },
]

// ==================== 推广分润记录数据 ====================

export const mockPromotionProfitRecords: PromotionProfitRecord[] = [
  {
    id: '1',
    orderId: 'order_001',
    orderNo: 'ORD202401150001',
    productType: ProductType.VEHICLE_RENTAL,
    promoterUserId: 'user_002',
    promoterUserName: '李四',
    promotionLevel: PromotionLevel.LEVEL_1,
    orderAmount: 5000,
    orderProfit: 1000,
    profitRatio: 5,
    profitAmount: 50,
    isPlusMemberReward: false,
    status: ProfitStatus.PAID,
    createdAt: '2024-01-15 10:30:00',
    paidAt: '2024-01-16 14:20:00',
  },
]

// ==================== 托管分润配置数据 ====================

export const mockHostingProfitConfigs: HostingProfitConfig[] = [
  {
    id: '1',
    hostingType: HostingType.OWN_CAR,
    baseRatio: 70,
    performanceBonus: [
      {
        metric: '满意度',
        threshold: 4.5,
        bonusRatio: 5,
      },
      {
        metric: '出租率',
        threshold: 80,
        bonusRatio: 3,
      },
    ],
    subsidyRules: [
      {
        hostingType: HostingType.OWN_CAR,
        startDate: '11-01',
        endDate: '03-31',
        minMonthlyProfit: 3000,
        description: '冬季补贴：月分润低于3000元补贴至3000元',
      },
    ],
    enabled: true,
    updatedAt: '2024-01-01 10:00:00',
  },
]

// ==================== 托管分润记录数据 ====================

export const mockHostingProfitRecords: HostingProfitRecord[] = []

// ==================== 营地分润配置数据 ====================

export const mockCampsiteProfitConfigs: CampsiteProfitConfig[] = []

// ==================== 旅游分润配置数据 ====================

export const mockTourProfitConfigs: TourProfitConfig[] = []

// ==================== 余额记录数据 ====================

export const mockBalanceRecords: BalanceRecord[] = [
  {
    id: '1',
    userId: 'user_001',
    userName: '王五',
    balance: 5680.5,
    frozenBalance: 200.0,
    totalIncome: 15680.5,
    totalWithdrawal: 10000.0,
    updatedAt: '2024-12-24 10:00:00',
  },
  {
    id: '2',
    userId: 'user_002',
    userName: '李四',
    balance: 3200.0,
    frozenBalance: 0,
    totalIncome: 8200.0,
    totalWithdrawal: 5000.0,
    updatedAt: '2024-12-24 09:30:00',
  },
  {
    id: '3',
    userId: 'user_003',
    userName: '张三',
    balance: 1500.0,
    frozenBalance: 100.0,
    totalIncome: 3500.0,
    totalWithdrawal: 2000.0,
    updatedAt: '2024-12-23 15:20:00',
  },
]

// ==================== 提现申请数据 ====================

export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: '1',
    userId: 'user_001',
    userName: '王五',
    amount: 5000.0,
    fee: 5.0,
    actualAmount: 4995.0,
    status: 'pending' as any,
    bankAccount: '6222 **** **** 1234',
    bankName: '中国工商银行',
    createdAt: '2024-12-24 09:00:00',
  },
  {
    id: '2',
    userId: 'user_002',
    userName: '李四',
    amount: 3000.0,
    fee: 3.0,
    actualAmount: 2997.0,
    status: 'approved' as any,
    bankAccount: '6228 **** **** 5678',
    bankName: '中国建设银行',
    createdAt: '2024-12-23 14:00:00',
    reviewedAt: '2024-12-23 15:00:00',
    reviewedBy: 'admin_001',
  },
  {
    id: '3',
    userId: 'user_003',
    userName: '张三',
    amount: 2000.0,
    fee: 2.0,
    actualAmount: 1998.0,
    status: 'completed' as any,
    bankAccount: '6217 **** **** 9012',
    bankName: '中国农业银行',
    createdAt: '2024-12-22 10:00:00',
    reviewedAt: '2024-12-22 11:00:00',
    reviewedBy: 'admin_001',
    completedAt: '2024-12-22 16:00:00',
  },
]

// ==================== 风控规则数据 ====================

export const mockRiskControlRules: RiskControlRule[] = [
  {
    id: '1',
    name: '同设备限制',
    type: 'device_limit',
    threshold: 3,
    action: 'freeze',
    enabled: true,
    description: '同一设备注册用户数超过3个时冻结分润',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    name: 'IP地址限制',
    type: 'ip_limit',
    threshold: 5,
    action: 'alert',
    enabled: true,
    description: '同一IP地址注册用户数超过5个时发出警报',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: '3',
    name: '订单频率限制',
    type: 'order_frequency',
    threshold: 10,
    action: 'alert',
    enabled: true,
    description: '单日订单数超过10个时发出警报',
    updatedAt: '2024-01-01 10:00:00',
  },
]

// ==================== 风控记录数据 ====================

export const mockRiskControlRecords: any[] = [
  {
    id: '1',
    orderId: 'order_001',
    orderNo: 'ORD202412240001',
    userId: 'user_005',
    userName: '孙七',
    ruleId: '1',
    ruleName: '同设备限制',
    riskLevel: 'high',
    action: 'freeze',
    reason: '同一设备注册用户数超过3个',
    status: 'pending',
    createdAt: '2024-12-24 10:00:00',
  },
  {
    id: '2',
    orderId: 'order_002',
    orderNo: 'ORD202412230001',
    userId: 'user_006',
    userName: '周八',
    ruleId: '2',
    ruleName: 'IP地址限制',
    riskLevel: 'medium',
    action: 'alert',
    reason: '同一IP地址注册用户数超过5个',
    status: 'confirmed',
    createdAt: '2024-12-23 15:00:00',
    reviewedAt: '2024-12-23 16:00:00',
    reviewedBy: 'admin_001',
  },
]

// ==================== Mock API 函数 ====================

/**
 * 获取推广关系列表
 */
export function mockGetPromotionRelations(params: {
  page: number
  pageSize: number
  userId?: string
  level1PromoterUserId?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockPromotionRelations.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockPromotionRelations.length,
    },
    message: '获取成功',
  })
}

/**
 * 获取推广分润配置列表
 */
export function mockGetPromotionProfitConfigs() {
  return Promise.resolve({
    code: 200,
    data: mockPromotionProfitConfigs,
    message: '获取成功',
  })
}

/**
 * 获取推广分润记录
 */
export function mockGetPromotionProfitRecords(params: {
  page: number
  pageSize: number
  promoterUserId?: string
  productType?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockPromotionProfitRecords.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockPromotionProfitRecords.length,
    },
    message: '获取成功',
  })
}

/**
 * 获取推广分润统计
 */
export function mockGetPromotionProfitStatistics(_params: {
  promoterUserId?: string
  productType?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      totalProfit: 15680.5,
      promoterCount: 128,
      level1Profit: 12500.0,
      level2Profit: 3180.5,
      plusMemberReward: 2500.0,
      vehicleRentalProfit: 8500.0,
      campsiteProfit: 4200.0,
      tourProfit: 2980.5,
      orderCount: 256,
    },
    message: '获取成功',
  })
}

/**
 * 获取托管分润配置列表
 */
export function mockGetHostingProfitConfigs() {
  return Promise.resolve({
    code: 200,
    data: mockHostingProfitConfigs,
    message: '获取成功',
  })
}

/**
 * 获取托管分润记录
 */
export function mockGetHostingProfitRecords(params: {
  page: number
  pageSize: number
  ownerId?: string
  vehicleId?: string
  hostingType?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockHostingProfitRecords.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockHostingProfitRecords.length,
    },
    message: '获取成功',
  })
}

/**
 * 获取托管分润统计
 */
export function mockGetHostingProfitStatistics(_params: {
  ownerId?: string
  vehicleId?: string
  hostingType?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      totalProfit: 45680.0,
      totalSubsidy: 5000.0,
      orderCount: 128,
      avgProfitPerOrder: 356.88,
      ownCarProfit: 30000.0,
      newCarProfit: 12680.0,
      crowdfundingProfit: 3000.0,
    },
    message: '获取成功',
  })
}

/**
 * 获取营地分润配置列表
 */
export function mockGetCampsiteProfitConfigs() {
  return Promise.resolve({
    code: 200,
    data: mockCampsiteProfitConfigs,
    message: '获取成功',
  })
}

/**
 * 获取营地分润记录
 */
export function mockGetCampsiteProfitRecords(_params: {
  page: number
  pageSize: number
  ownerId?: string
  campsiteId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: [],
      total: 0,
    },
    message: '获取成功',
  })
}

/**
 * 获取营地分润统计
 */
export function mockGetCampsiteProfitStatistics(_params: {
  ownerId?: string
  campsiteId?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      totalProfit: 0,
      orderCount: 0,
      bundledOrderCount: 0,
      avgProfitPerOrder: 0,
    },
    message: '获取成功',
  })
}

/**
 * 获取旅游分润配置列表
 */
export function mockGetTourProfitConfigs() {
  return Promise.resolve({
    code: 200,
    data: mockTourProfitConfigs,
    message: '获取成功',
  })
}

/**
 * 获取旅游分润记录
 */
export function mockGetTourProfitRecords(_params: {
  page: number
  pageSize: number
  providerId?: string
  tourId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: [],
      total: 0,
    },
    message: '获取成功',
  })
}

/**
 * 获取旅游分润统计
 */
export function mockGetTourProfitStatistics(_params: {
  providerId?: string
  tourId?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      totalProfit: 0,
      orderCount: 0,
      avgRating: 0,
      avgProfitPerOrder: 0,
    },
    message: '获取成功',
  })
}

/**
 * 分润模拟器
 */
export function mockSimulateProfit(_input: any) {
  return Promise.resolve({
    code: 200,
    data: {
      orderProfit: 1000.0,
      profitRecords: [
        {
          recipientId: 'owner_001',
          recipientName: '车主张三',
          recipientType: '托管车主',
          profitAmount: 700.0,
          ratio: 70,
          description: '自有车托管基础分成',
        },
        {
          recipientId: 'promoter_001',
          recipientName: '推广者李四',
          recipientType: '一级推广',
          profitAmount: 50.0,
          ratio: 5,
          description: '一级推广佣金',
        },
      ],
      platformProfit: 250.0,
      totalDistributed: 750.0,
      isBalanced: true,
      appliedRules: ['托管车主基础分成70%', '一级推广佣金5%'],
    },
    message: '模拟成功',
  })
}

/**
 * 获取余额记录
 */
export function mockGetBalanceRecords(params: {
  page: number
  pageSize: number
  userId?: string
  minBalance?: number
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockBalanceRecords.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockBalanceRecords.length,
    },
    message: '获取成功',
  })
}

/**
 * 获取提现申请列表
 */
export function mockGetWithdrawalRequests(params: {
  page: number
  pageSize: number
  userId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockWithdrawalRequests.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockWithdrawalRequests.length,
    },
    message: '获取成功',
  })
}

/**
 * 获取风控规则列表
 */
export function mockGetRiskControlRules() {
  return Promise.resolve({
    code: 200,
    data: mockRiskControlRules,
    message: '获取成功',
  })
}

/**
 * 获取风控记录
 */
export function mockGetRiskControlRecords(params: {
  page: number
  pageSize: number
  userId?: string
  ruleId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return Promise.resolve({
    code: 200,
    data: {
      list: mockRiskControlRecords.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      total: mockRiskControlRecords.length,
    },
    message: '获取成功',
  })
}
