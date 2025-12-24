/**
 * 众筹托管Mock数据
 */

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
import { CrowdfundingStatus, ShareTransactionStatus, ParticipantRole } from '@/types/crowdfunding'
import type { PaginatedResponse } from '@/types/common'

// ==================== Mock数据 ====================

/**
 * Mock推荐车型数据
 */
const mockModels: CrowdfundingVehicleModel[] = [
  {
    id: 'model_001',
    name: '上汽大通RG10 生活家V90',
    brand: '上汽大通',
    images: [
      'https://placehold.co/800x600/FF9F29/FFFFFF?text=RG10-1',
      'https://placehold.co/800x600/FF9F29/FFFFFF?text=RG10-2',
      'https://placehold.co/800x600/FF9F29/FFFFFF?text=RG10-3'
    ],
    thumbnail: 'https://placehold.co/400x300/FF9F29/FFFFFF?text=RG10',
    purchasePrice: 500000,
    suggestedShares: 10,
    suggestedPricePerShare: 50000,
    estimatedMonthlyIncome: 8500,
    estimatedAnnualReturn: 20.4,
    description: '上汽大通RG10是一款高端C型房车，配备完善的生活设施，适合长途旅行和家庭出游。',
    specifications: {
      seats: 6,
      length: 5.99,
      width: 2.3,
      height: 3.2,
      capacity: 6,
      fuelType: '柴油'
    },
    isHot: true,
    crowdfundingCount: 3
  },
  {
    id: 'model_002',
    name: '宇通B530 舒适版',
    brand: '宇通',
    images: [
      'https://placehold.co/800x600/2196F3/FFFFFF?text=B530-1',
      'https://placehold.co/800x600/2196F3/FFFFFF?text=B530-2'
    ],
    thumbnail: 'https://placehold.co/400x300/2196F3/FFFFFF?text=B530',
    purchasePrice: 680000,
    suggestedShares: 10,
    suggestedPricePerShare: 68000,
    estimatedMonthlyIncome: 11500,
    estimatedAnnualReturn: 20.3,
    description: '宇通B530是一款豪华B型房车，空间宽敞，配置豪华，适合商务接待和高端旅游。',
    specifications: {
      seats: 4,
      length: 5.99,
      width: 2.5,
      height: 2.95,
      capacity: 4,
      fuelType: '柴油'
    },
    isHot: true,
    crowdfundingCount: 2
  },
  {
    id: 'model_003',
    name: '览众C7 经典版',
    brand: '览众',
    images: [
      'https://placehold.co/800x600/4CAF50/FFFFFF?text=C7-1',
      'https://placehold.co/800x600/4CAF50/FFFFFF?text=C7-2'
    ],
    thumbnail: 'https://placehold.co/400x300/4CAF50/FFFFFF?text=C7',
    purchasePrice: 420000,
    suggestedShares: 10,
    suggestedPricePerShare: 42000,
    estimatedMonthlyIncome: 7200,
    estimatedAnnualReturn: 20.6,
    description: '览众C7是一款性价比极高的C型房车，配置实用，维护成本低，适合新手车主。',
    specifications: {
      seats: 6,
      length: 5.99,
      width: 2.3,
      height: 3.1,
      capacity: 6,
      fuelType: '柴油'
    },
    isHot: false,
    crowdfundingCount: 1
  },
  {
    id: 'model_004',
    name: '依维柯欧胜 旅行家',
    brand: '依维柯',
    images: [
      'https://placehold.co/800x600/FF5722/FFFFFF?text=Iveco-1'
    ],
    thumbnail: 'https://placehold.co/400x300/FF5722/FFFFFF?text=Iveco',
    purchasePrice: 580000,
    suggestedShares: 10,
    suggestedPricePerShare: 58000,
    estimatedMonthlyIncome: 9800,
    estimatedAnnualReturn: 20.3,
    description: '依维柯欧胜是一款进口底盘房车，动力强劲，操控性好，适合长途穿越。',
    specifications: {
      seats: 4,
      length: 5.99,
      width: 2.35,
      height: 2.98,
      capacity: 4,
      fuelType: '柴油'
    },
    isHot: false,
    crowdfundingCount: 0
  },
  {
    id: 'model_005',
    name: '福特全顺 探险者',
    brand: '福特',
    images: [
      'https://placehold.co/800x600/9C27B0/FFFFFF?text=Ford-1'
    ],
    thumbnail: 'https://placehold.co/400x300/9C27B0/FFFFFF?text=Ford',
    purchasePrice: 380000,
    suggestedShares: 10,
    suggestedPricePerShare: 38000,
    estimatedMonthlyIncome: 6500,
    estimatedAnnualReturn: 20.5,
    description: '福特全顺是一款经济实用的B型房车，油耗低，维护简单，适合城市周边游。',
    specifications: {
      seats: 4,
      length: 5.34,
      width: 2.03,
      height: 2.45,
      capacity: 4,
      fuelType: '汽油'
    },
    isHot: false,
    crowdfundingCount: 0
  }
]

/**
 * Mock众筹项目数据
 */
const mockProjects: CrowdfundingProject[] = [
  {
    id: 'project_001',
    title: '上汽大通RG10众筹计划 - 川西环线专用车',
    model: {
      id: 'model_001',
      name: '上汽大通RG10 生活家V90',
      brand: '上汽大通',
      thumbnail: 'https://placehold.co/400x300/FF9F29/FFFFFF?text=RG10'
    },
    initiator: {
      id: 'user_001',
      name: '旅行达人',
      avatar: '/static/default-avatar.png'
    },
    vehiclePrice: 500000,
    totalShares: 10,
    pricePerShare: 50000,
    soldShares: 7,
    remainingShares: 3,
    progress: 70,
    participantCount: 5,
    status: CrowdfundingStatus.FUNDING,
    statusText: '众筹中',
    startTime: '2025-12-01T10:00:00',
    endTime: '2025-12-31T23:59:59',
    remainingDays: 9,
    estimatedMonthlyIncome: 8500,
    estimatedAnnualReturn: 20.4,
    description: '专为川西环线打造的高端房车，配备完善的生活设施，适合长途旅行。众筹成功后将托管运营，预计年化收益率20%以上。',
    images: [
      'https://placehold.co/800x600/FF9F29/FFFFFF?text=Project1-1',
      'https://placehold.co/800x600/FF9F29/FFFFFF?text=Project1-2'
    ],
    agreementUrl: '/static/docs/crowdfunding-agreement.pdf',
    isParticipated: true,
    myShares: 2,
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-22T15:30:00'
  },
  {
    id: 'project_002',
    title: '宇通B530众筹 - 高端商务接待车',
    model: {
      id: 'model_002',
      name: '宇通B530 舒适版',
      brand: '宇通',
      thumbnail: 'https://placehold.co/400x300/2196F3/FFFFFF?text=B530'
    },
    initiator: {
      id: 'user_002',
      name: '商务精英',
      avatar: '/static/default-avatar.png'
    },
    vehiclePrice: 680000,
    totalShares: 10,
    pricePerShare: 68000,
    soldShares: 10,
    remainingShares: 0,
    progress: 100,
    participantCount: 6,
    status: CrowdfundingStatus.SUCCESS,
    statusText: '众筹成功',
    startTime: '2025-11-15T10:00:00',
    endTime: '2025-12-15T23:59:59',
    remainingDays: 0,
    estimatedMonthlyIncome: 11500,
    estimatedAnnualReturn: 20.3,
    description: '豪华B型房车，适合商务接待和高端旅游，配置豪华，空间宽敞。',
    images: [
      'https://placehold.co/800x600/2196F3/FFFFFF?text=Project2-1'
    ],
    agreementUrl: '/static/docs/crowdfunding-agreement.pdf',
    isParticipated: false,
    myShares: 0,
    createdAt: '2025-11-15T10:00:00',
    updatedAt: '2025-12-15T18:20:00'
  },
  {
    id: 'project_003',
    title: '览众C7众筹 - 新手友好型房车',
    model: {
      id: 'model_003',
      name: '览众C7 经典版',
      brand: '览众',
      thumbnail: 'https://placehold.co/400x300/4CAF50/FFFFFF?text=C7'
    },
    initiator: {
      id: 'user_003',
      name: '房车新手',
      avatar: '/static/default-avatar.png'
    },
    vehiclePrice: 420000,
    totalShares: 10,
    pricePerShare: 42000,
    soldShares: 3,
    remainingShares: 7,
    progress: 30,
    participantCount: 2,
    status: CrowdfundingStatus.FUNDING,
    statusText: '众筹中',
    startTime: '2025-12-10T10:00:00',
    endTime: '2026-01-09T23:59:59',
    remainingDays: 18,
    estimatedMonthlyIncome: 7200,
    estimatedAnnualReturn: 20.6,
    description: '性价比极高的C型房车，配置实用，维护成本低，非常适合新手车主入门。',
    images: [
      'https://placehold.co/800x600/4CAF50/FFFFFF?text=Project3-1'
    ],
    agreementUrl: '/static/docs/crowdfunding-agreement.pdf',
    isParticipated: false,
    myShares: 0,
    createdAt: '2025-12-10T10:00:00',
    updatedAt: '2025-12-22T10:15:00'
  }
]

/**
 * Mock份额数据
 */
const mockShares: CrowdfundingShare[] = [
  {
    id: 'share_001',
    projectId: 'project_001',
    project: {
      id: 'project_001',
      title: '上汽大通RG10众筹计划 - 川西环线专用车',
      model: {
        name: '上汽大通RG10 生活家V90',
        brand: '上汽大通',
        thumbnail: 'https://placehold.co/400x300/FF9F29/FFFFFF?text=RG10'
      },
      status: CrowdfundingStatus.FUNDING,
      statusText: '众筹中'
    },
    ownerId: 'current_user',
    owner: {
      id: 'current_user',
      name: '我',
      avatar: '/static/default-avatar.png'
    },
    quantity: 2,
    purchasePrice: 50000,
    totalPurchasePrice: 100000,
    currentMarketPrice: 52000,
    totalIncome: 3200,
    monthIncome: 1700,
    returnRate: 3.2,
    isTradable: true,
    purchaseTime: '2025-12-05T14:30:00',
    holdingDays: 17
  }
]

/**
 * Mock份额交易数据
 */
const mockTransactions: ShareTransaction[] = [
  {
    id: 'transaction_001',
    shareId: 'share_002',
    project: {
      id: 'project_002',
      title: '宇通B530众筹 - 高端商务接待车',
      model: {
        name: '宇通B530 舒适版',
        brand: '宇通',
        thumbnail: 'https://placehold.co/400x300/2196F3/FFFFFF?text=B530'
      },
      status: CrowdfundingStatus.HOSTING,
      estimatedAnnualReturn: 20.3
    },
    seller: {
      id: 'user_004',
      name: '投资者A',
      avatar: '/static/default-avatar.png'
    },
    quantity: 1,
    pricePerShare: 70000,
    totalPrice: 70000,
    referencePrice: 68500,
    priceChange: 2.19,
    totalIncome: 4200,
    returnRate: 6.18,
    status: ShareTransactionStatus.LISTING,
    statusText: '挂单中',
    listingTime: '2025-12-20T10:00:00',
    remarks: '急需资金周转，低价出售'
  },
  {
    id: 'transaction_002',
    shareId: 'share_003',
    project: {
      id: 'project_002',
      title: '宇通B530众筹 - 高端商务接待车',
      model: {
        name: '宇通B530 舒适版',
        brand: '宇通',
        thumbnail: 'https://placehold.co/400x300/2196F3/FFFFFF?text=B530'
      },
      status: CrowdfundingStatus.HOSTING,
      estimatedAnnualReturn: 20.3
    },
    seller: {
      id: 'user_005',
      name: '投资者B',
      avatar: '/static/default-avatar.png'
    },
    quantity: 2,
    pricePerShare: 67000,
    totalPrice: 134000,
    referencePrice: 68500,
    priceChange: -2.19,
    totalIncome: 8500,
    returnRate: 12.5,
    status: ShareTransactionStatus.LISTING,
    statusText: '挂单中',
    listingTime: '2025-12-21T15:30:00'
  }
]

/**
 * Mock统计数据
 */
const mockStats: CrowdfundingStats = {
  projectCount: 1,
  totalShares: 2,
  totalInvestment: 100000,
  totalIncome: 3200,
  averageReturn: 3.2,
  monthIncome: 1700
}

/**
 * Mock收益记录
 */
const mockIncomeRecords: CrowdfundingIncomeRecord[] = [
  {
    id: 'income_001',
    projectId: 'project_001',
    projectTitle: '上汽大通RG10众筹计划',
    shareId: 'share_001',
    orderNo: 'DD20251215001',
    amount: 850,
    date: '2025-12-15',
    type: 'rental',
    typeText: '租金收益',
    status: 'settled',
    statusText: '已结算'
  },
  {
    id: 'income_002',
    projectId: 'project_001',
    projectTitle: '上汽大通RG10众筹计划',
    shareId: 'share_001',
    orderNo: 'DD20251218002',
    amount: 850,
    date: '2025-12-18',
    type: 'rental',
    typeText: '租金收益',
    status: 'settled',
    statusText: '已结算'
  },
  {
    id: 'income_003',
    projectId: 'project_001',
    projectTitle: '上汽大通RG10众筹计划',
    shareId: 'share_001',
    orderNo: 'BONUS20251220',
    amount: 500,
    date: '2025-12-20',
    type: 'bonus',
    typeText: '平台补贴',
    status: 'settled',
    statusText: '已结算'
  }
]

// ==================== Mock API实现 ====================

/**
 * 获取众筹推荐车型列表
 */
function getCrowdfundingModels(params?: { page?: number; pageSize?: number }) {
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 0,
    message: 'success',
    data: {
      list: mockModels.slice(start, end),
      total: mockModels.length,
      page,
      pageSize,
      hasMore: end < mockModels.length
    }
  }
}

/**
 * 获取众筹车型详情
 */
function getCrowdfundingModelDetail(id: string) {
  const model = mockModels.find(m => m.id === id)
  return {
    code: 0,
    message: 'success',
    data: model || mockModels[0]
  }
}

/**
 * 发起众筹项目
 */
function createCrowdfundingProject(data: CreateCrowdfundingParams) {
  const newProject: CrowdfundingProject = {
    id: `project_${Date.now()}`,
    title: data.title,
    model: {
      id: data.modelId,
      name: mockModels.find(m => m.id === data.modelId)?.name || '',
      brand: mockModels.find(m => m.id === data.modelId)?.brand || '',
      thumbnail: mockModels.find(m => m.id === data.modelId)?.thumbnail || ''
    },
    initiator: {
      id: 'current_user',
      name: data.contact.name,
      avatar: '/static/default-avatar.png'
    },
    vehiclePrice: data.totalShares * data.pricePerShare,
    totalShares: data.totalShares,
    pricePerShare: data.pricePerShare,
    soldShares: 0,
    remainingShares: data.totalShares,
    progress: 0,
    participantCount: 0,
    status: CrowdfundingStatus.PENDING,
    statusText: '审核中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: data.duration,
    estimatedMonthlyIncome: mockModels.find(m => m.id === data.modelId)?.estimatedMonthlyIncome || 0,
    estimatedAnnualReturn: mockModels.find(m => m.id === data.modelId)?.estimatedAnnualReturn || 0,
    description: data.description,
    images: data.images,
    agreementUrl: '/static/docs/crowdfunding-agreement.pdf',
    isParticipated: false,
    myShares: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return {
    code: 0,
    message: '众筹项目已提交审核',
    data: newProject
  }
}

/**
 * 获取众筹项目列表
 */
function getCrowdfundingProjects(params?: CrowdfundingProjectQuery) {
  let filteredProjects = [...mockProjects]

  // 状态筛选
  if (params?.status) {
    filteredProjects = filteredProjects.filter(p => p.status === params.status)
  }

  // 排序
  if (params?.sortBy === 'progress') {
    filteredProjects.sort((a, b) => b.progress - a.progress)
  } else if (params?.sortBy === 'return') {
    filteredProjects.sort((a, b) => b.estimatedAnnualReturn - a.estimatedAnnualReturn)
  } else {
    filteredProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredProjects.slice(start, end),
      total: filteredProjects.length,
      page,
      pageSize,
      hasMore: end < filteredProjects.length
    }
  }
}

/**
 * 获取众筹项目详情
 */
function getCrowdfundingProjectDetail(id: string) {
  const project = mockProjects.find(p => p.id === id)
  return {
    code: 0,
    message: 'success',
    data: project || mockProjects[0]
  }
}

/**
 * 参与众筹
 */
function participateCrowdfunding(data: ParticipateCrowdfundingParams) {
  return {
    code: 0,
    message: '参与众筹成功',
    data: {
      orderId: `order_${Date.now()}`,
      orderNo: `CF${Date.now()}`, // 众筹订单号
      projectId: data.projectId,
      shares: data.shares,
      amount: 0, // 实际金额应该根据份额计算
      paymentMethod: data.paymentMethod
    }
  }
}

/**
 * 获取我参与的众筹项目
 */
function getMyCrowdfundingProjects() {
  return {
    code: 0,
    message: 'success',
    data: mockProjects.filter(p => p.isParticipated)
  }
}

/**
 * 获取我的众筹份额
 */
function getMyCrowdfundingShares() {
  return {
    code: 0,
    message: 'success',
    data: mockShares
  }
}

/**
 * 获取份额详情
 */
function getShareDetail(id: string) {
  const share = mockShares.find(s => s.id === id)
  return {
    code: 0,
    message: 'success',
    data: share || mockShares[0]
  }
}

/**
 * 挂出份额交易
 */
function listShareForSale(data: ListShareForSaleParams) {
  const newTransaction: ShareTransaction = {
    id: `transaction_${Date.now()}`,
    shareId: data.shareId,
    project: mockShares[0].project,
    seller: {
      id: 'current_user',
      name: '我',
      avatar: '/static/default-avatar.png'
    },
    quantity: data.quantity,
    pricePerShare: data.pricePerShare,
    totalPrice: data.quantity * data.pricePerShare,
    referencePrice: mockShares[0].currentMarketPrice,
    priceChange: ((data.pricePerShare - mockShares[0].currentMarketPrice) / mockShares[0].currentMarketPrice) * 100,
    totalIncome: mockShares[0].totalIncome,
    returnRate: mockShares[0].returnRate,
    status: ShareTransactionStatus.LISTING,
    statusText: '挂单中',
    listingTime: new Date().toISOString(),
    remarks: data.remarks
  }

  return {
    code: 0,
    message: '份额已挂出交易',
    data: newTransaction
  }
}

/**
 * 获取份额交易市场
 */
function getShareMarket(params?: ShareMarketQuery) {
  let filteredTransactions = [...mockTransactions]

  // 项目筛选
  if (params?.projectId) {
    filteredTransactions = filteredTransactions.filter(t => t.project.id === params.projectId)
  }

  // 排序
  if (params?.sortBy === 'price_asc') {
    filteredTransactions.sort((a, b) => a.pricePerShare - b.pricePerShare)
  } else if (params?.sortBy === 'price_desc') {
    filteredTransactions.sort((a, b) => b.pricePerShare - a.pricePerShare)
  } else if (params?.sortBy === 'return_desc') {
    filteredTransactions.sort((a, b) => b.returnRate - a.returnRate)
  } else {
    filteredTransactions.sort((a, b) => new Date(b.listingTime).getTime() - new Date(a.listingTime).getTime())
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredTransactions.slice(start, end),
      total: filteredTransactions.length,
      page,
      pageSize,
      hasMore: end < filteredTransactions.length
    }
  }
}

/**
 * 购买份额
 */
function buyShare(transactionId: string, paymentMethod: string) {
  return {
    code: 0,
    message: '购买成功',
    data: {
      transactionId,
      paymentMethod
    }
  }
}

/**
 * 取消挂单
 */
function cancelShareListing(transactionId: string) {
  return {
    code: 0,
    message: '已取消挂单',
    data: {
      transactionId
    }
  }
}

/**
 * 获取众筹统计数据
 */
function getCrowdfundingStats() {
  return {
    code: 0,
    message: 'success',
    data: mockStats
  }
}

/**
 * 获取众筹收益记录
 */
function getCrowdfundingIncome(params?: { projectId?: string; page?: number; pageSize?: number }) {
  let filteredRecords = [...mockIncomeRecords]

  // 项目筛选
  if (params?.projectId) {
    filteredRecords = filteredRecords.filter(r => r.projectId === params.projectId)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredRecords.slice(start, end),
      total: filteredRecords.length,
      page,
      pageSize,
      hasMore: end < filteredRecords.length
    }
  }
}

/**
 * 提现众筹收益
 */
function withdrawCrowdfundingIncome(data: { amount: number; method: string; account: string }) {
  return {
    code: 0,
    message: '提现申请已提交',
    data: {
      withdrawId: `withdraw_${Date.now()}`,
      amount: data.amount,
      method: data.method,
      account: data.account
    }
  }
}

// 导出Mock API
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
