/**
 * 众筹托管相关类型定义
 */

import type { ApiResponse, PaginatedResponse } from './common'

/**
 * 众筹项目状态
 */
export enum CrowdfundingStatus {
  /** 审核中 */
  PENDING = 'pending',
  /** 众筹中 */
  FUNDING = 'funding',
  /** 众筹成功 */
  SUCCESS = 'success',
  /** 众筹失败 */
  FAILED = 'failed',
  /** 购车中 */
  PURCHASING = 'purchasing',
  /** 托管中 */
  HOSTING = 'hosting',
  /** 已结束 */
  ENDED = 'ended'
}

/**
 * 份额交易状态
 */
export enum ShareTransactionStatus {
  /** 挂单中 */
  LISTING = 'listing',
  /** 交易中 */
  TRADING = 'trading',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已取消 */
  CANCELLED = 'cancelled'
}

/**
 * 众筹参与者角色
 */
export enum ParticipantRole {
  /** 发起人 */
  INITIATOR = 'initiator',
  /** 参与者 */
  PARTICIPANT = 'participant',
  /** 托管代表 */
  REPRESENTATIVE = 'representative'
}

/**
 * 众筹推荐车型
 */
export interface CrowdfundingVehicleModel {
  /** 车型ID */
  id: string
  /** 车型名称 */
  name: string
  /** 品牌 */
  brand: string
  /** 车型图片 */
  images: string[]
  /** 缩略图 */
  thumbnail: string
  /** 车辆购置价格(元) */
  purchasePrice: number
  /** 建议众筹份额数 */
  suggestedShares: number
  /** 建议单份价格(元) */
  suggestedPricePerShare: number
  /** 预估月收益(元) */
  estimatedMonthlyIncome: number
  /** 预估年化收益率(%) */
  estimatedAnnualReturn: number
  /** 车型描述 */
  description: string
  /** 车型参数 */
  specifications: {
    /** 座位数 */
    seats: number
    /** 长度(米) */
    length: number
    /** 宽度(米) */
    width: number
    /** 高度(米) */
    height: number
    /** 核载人数 */
    capacity: number
    /** 燃料类型 */
    fuelType: string
  }
  /** 是否热门 */
  isHot: boolean
  /** 已发起众筹数 */
  crowdfundingCount: number
}

/**
 * 众筹项目
 */
export interface CrowdfundingProject {
  /** 项目ID */
  id: string
  /** 项目标题 */
  title: string
  /** 车型信息 */
  model: {
    id: string
    name: string
    brand: string
    thumbnail: string
  }
  /** 发起人信息 */
  initiator: {
    id: string
    name: string
    avatar: string
  }
  /** 车辆购置价格(元) */
  vehiclePrice: number
  /** 总份额数 */
  totalShares: number
  /** 单份价格(元) */
  pricePerShare: number
  /** 已认购份额数 */
  soldShares: number
  /** 剩余份额数 */
  remainingShares: number
  /** 众筹进度(%) */
  progress: number
  /** 参与人数 */
  participantCount: number
  /** 项目状态 */
  status: CrowdfundingStatus
  /** 状态文本 */
  statusText: string
  /** 众筹开始时间 */
  startTime: string
  /** 众筹结束时间 */
  endTime: string
  /** 剩余天数 */
  remainingDays: number
  /** 预估月收益(元) */
  estimatedMonthlyIncome: number
  /** 预估年化收益率(%) */
  estimatedAnnualReturn: number
  /** 项目描述 */
  description: string
  /** 项目图片 */
  images: string[]
  /** 众筹协议URL */
  agreementUrl: string
  /** 是否已参与 */
  isParticipated: boolean
  /** 我的份额数 */
  myShares: number
  /** 我的累计收益(元) */
  myIncome?: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 众筹份额
 */
export interface CrowdfundingShare {
  /** 份额ID */
  id: string
  /** 项目ID */
  projectId: string
  /** 项目信息 */
  project: {
    id: string
    title: string
    model: {
      name: string
      brand: string
      thumbnail: string
    }
    status: CrowdfundingStatus
    statusText: string
  }
  /** 持有人ID */
  ownerId: string
  /** 持有人信息 */
  owner: {
    id: string
    name: string
    avatar: string
  }
  /** 份额数量 */
  quantity: number
  /** 购买价格(元/份) */
  purchasePrice: number
  /** 购买总价(元) */
  totalPurchasePrice: number
  /** 当前市场参考价(元/份) */
  currentMarketPrice: number
  /** 累计收益(元) */
  totalIncome: number
  /** 本月收益(元) */
  monthIncome: number
  /** 收益率(%) */
  returnRate: number
  /** 是否可交易 */
  isTradable: boolean
  /** 购买时间 */
  purchaseTime: string
  /** 持有天数 */
  holdingDays: number
}

/**
 * 份额交易
 */
export interface ShareTransaction {
  /** 交易ID */
  id: string
  /** 项目ID */
  projectId?: string
  /** 份额ID */
  shareId?: string
  /** 项目信息 */
  project: {
    id: string
    title: string
    model: {
      id: string
      name: string
      brand: string
      thumbnail: string
    }
    totalShares: number
    progress: number
    status: CrowdfundingStatus
    statusText: string
    estimatedAnnualReturn: number
  }
  /** 卖方信息 */
  seller: {
    id: string
    name: string
    avatar: string
  }
  /** 买方信息(交易完成后) */
  buyer?: {
    id: string
    name: string
    avatar: string
  }
  /** 出售份额数 */
  shares?: number
  /** 出售份额数（别名） */
  quantity?: number
  /** 出售单价(元/份) */
  pricePerShare: number
  /** 出售总价(元) */
  totalPrice?: number
  /** 平台参考价(元/份) */
  referencePrice: number
  /** 价格浮动(%) */
  priceChange: number
  /** 累计收益(元) */
  totalIncome: number
  /** 收益率(%) */
  returnRate?: number
  /** 持有天数 */
  holdingDays?: number
  /** 交易状态 */
  status: ShareTransactionStatus
  /** 状态文本 */
  statusText?: string
  /** 挂单时间 */
  listedAt?: string
  /** 挂单时间（别名） */
  listingTime?: string
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 交易完成时间 */
  completedTime?: string
  /** 备注 */
  remarks?: string
}

/**
 * 众筹参与者
 */
export interface CrowdfundingParticipant {
  /** 参与者ID */
  id: string
  /** 项目ID */
  projectId: string
  /** 用户ID */
  userId: string
  /** 用户信息 */
  user: {
    id: string
    name: string
    avatar: string
  }
  /** 角色 */
  role: ParticipantRole
  /** 角色文本 */
  roleText: string
  /** 持有份额数 */
  shares: number
  /** 投资金额(元) */
  investmentAmount: number
  /** 累计收益(元) */
  totalIncome: number
  /** 参与时间 */
  joinTime: string
}

/**
 * 众筹收益记录
 */
export interface CrowdfundingIncomeRecord {
  /** 记录ID */
  id: string
  /** 项目ID */
  projectId: string
  /** 项目标题 */
  projectTitle: string
  /** 份额ID */
  shareId: string
  /** 订单号 */
  orderNo: string
  /** 收益金额(元) */
  amount: number
  /** 收益日期 */
  date: string
  /** 收益类型 */
  type: 'rental' | 'bonus' | 'subsidy'
  /** 类型文本 */
  typeText: string
  /** 状态 */
  status: 'pending' | 'settled' | 'withdrawn'
  /** 状态文本 */
  statusText: string
}

/**
 * 发起众筹请求参数
 */
export interface CreateCrowdfundingParams extends Record<string, unknown> {
  /** 车型ID */
  modelId: string
  /** 项目标题 */
  title: string
  /** 总份额数 */
  totalShares: number
  /** 单份价格(元) */
  pricePerShare: number
  /** 众筹期限(天) */
  duration: number
  /** 项目描述 */
  description: string
  /** 项目图片 */
  images: string[]
  /** 联系人信息 */
  contact: {
    name: string
    phone: string
    email?: string
  }
  /** 是否同意协议 */
  agreeToTerms: boolean
}

/**
 * 参与者类型
 */
export enum ParticipantType {
  /** 个人 */
  INDIVIDUAL = 'individual',
  /** 企业 */
  COMPANY = 'company'
}

/**
 * 参与众筹请求参数
 */
export interface ParticipateCrowdfundingParams extends Record<string, unknown> {
  /** 项目ID */
  projectId: string
  /** 购买份额数 */
  shares: number
  /** 支付方式 */
  paymentMethod: 'wechat' | 'alipay' | 'balance' | 'transfer'
  /** 参与者类型 */
  participantType: ParticipantType
  /** 个人信息（当participantType为individual时必填） */
  individualInfo?: {
    /** 姓名 */
    name: string
    /** 电话号码 */
    phone: string
    /** 身份证号 */
    idCardNumber: string
    /** 身份证正面照片URL */
    idCardFrontImage: string
    /** 身份证反面照片URL */
    idCardBackImage: string
  }
  /** 企业信息（当participantType为company时必填） */
  companyInfo?: {
    /** 公司名称 */
    name: string
    /** 联系电话 */
    phone: string
    /** 营业执照照片URL */
    businessLicenseImage: string
  }
}

/**
 * 挂出份额交易请求参数
 */
export interface ListShareForSaleParams extends Record<string, unknown> {
  /** 份额ID */
  shareId: string
  /** 出售份额数 */
  quantity: number
  /** 出售单价(元/份) */
  pricePerShare: number
  /** 备注 */
  remarks?: string
}

/**
 * 众筹统计数据
 */
export interface CrowdfundingStats {
  /** 参与项目数 */
  projectCount: number
  /** 持有份额总数 */
  totalShares: number
  /** 总投资金额(元) */
  totalInvestment: number
  /** 累计收益(元) */
  totalIncome: number
  /** 平均收益率(%) */
  averageReturn: number
  /** 本月收益(元) */
  monthIncome: number
}

/**
 * 众筹项目查询参数
 */
export interface CrowdfundingProjectQuery extends Record<string, unknown> {
  /** 状态筛选 */
  status?: CrowdfundingStatus
  /** 排序方式 */
  sortBy?: 'progress' | 'time' | 'return'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 份额市场查询参数
 */
export interface ShareMarketQuery extends Record<string, unknown> {
  /** 项目ID筛选 */
  projectId?: string
  /** 价格排序 */
  sortBy?: 'price_asc' | 'price_desc' | 'return_desc' | 'time_desc'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * API响应类型
 */
export interface CrowdfundingModelsResponse extends ApiResponse<PaginatedResponse<CrowdfundingVehicleModel>> {}
export interface CrowdfundingModelDetailResponse extends ApiResponse<CrowdfundingVehicleModel> {}
export interface CrowdfundingProjectsResponse extends ApiResponse<PaginatedResponse<CrowdfundingProject>> {}
export interface CrowdfundingProjectDetailResponse extends ApiResponse<CrowdfundingProject> {}
export interface CrowdfundingSharesResponse extends ApiResponse<CrowdfundingShare[]> {}
export interface ShareMarketResponse extends ApiResponse<PaginatedResponse<ShareTransaction>> {}
export interface CrowdfundingStatsResponse extends ApiResponse<CrowdfundingStats> {}
export interface CrowdfundingIncomeResponse extends ApiResponse<PaginatedResponse<CrowdfundingIncomeRecord>> {}
