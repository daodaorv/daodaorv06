/**
 * 托管中心相关类型定义
 */

/**
 * 车辆信息
 */
export interface VehicleInfo {
  /** 车辆品牌 */
  brand: string
  /** 车辆型号 */
  model: string
  /** 车牌号 */
  licensePlate: string
  /** 购买日期 */
  purchaseDate: string
  /** 行驶里程（公里） */
  mileage: number
  /** 车辆照片 */
  photos: string[]
}

/**
 * 车主信息
 */
export interface OwnerInfo {
  /** 姓名 */
  name: string
  /** 身份证号 */
  idCard: string
  /** 联系电话 */
  phone: string
  /** 联系地址 */
  address: string
}

/**
 * 文档信息
 */
export interface DocumentInfo {
  /** 文档类型 */
  type: 'driving_license' | 'vehicle_license' | 'insurance' | 'other'
  /** 文档名称 */
  name: string
  /** 文档URL */
  url: string
}

/**
 * 自有车托管申请数据
 */
export interface OldCarApplicationData extends Record<string, unknown> {
  /** 车辆信息 */
  vehicleInfo: VehicleInfo
  /** 车主信息 */
  ownerInfo: OwnerInfo
  /** 相关文档 */
  documents: DocumentInfo[]
  /** 托管期限（月） */
  duration: number
  /** 期望收益（元/月） */
  expectedIncome: number
  /** 备注 */
  remarks?: string
}

/**
 * 购车方式
 */
export type PurchaseMethod = 'full' | 'loan'

/**
 * 联系人信息
 */
export interface ContactInfo {
  /** 姓名 */
  name: string
  /** 电话 */
  phone: string
  /** 邮箱 */
  email?: string
}

/**
 * 购车托管申请数据
 */
export interface NewCarApplicationData extends Record<string, unknown> {
  /** 车型ID */
  modelId: string
  /** 购车方式 */
  purchaseMethod: PurchaseMethod
  /** 联系人信息 */
  contactInfo: ContactInfo
  /** 预算（元） */
  budget: number
  /** 备注 */
  remarks?: string
}

/**
 * 车主自用申请数据
 */
export interface SelfUseApplicationData extends Record<string, unknown> {
  /** 车辆ID */
  vehicleId: string
  /** 使用开始日期 */
  startDate: string
  /** 使用结束日期 */
  endDate: string
  /** 使用目的 */
  purpose: string
  /** 预计行驶里程 */
  estimatedMileage: number
}

/**
 * 收益详情查询参数
 */
export interface IncomeDetailParams extends Record<string, unknown> {
  /** 车辆ID */
  vehicleId?: string
  /** 开始日期 */
  startDate?: string
  /** 结束日期 */
  endDate?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 收益记录
 */
export interface IncomeRecord {
  /** 记录ID */
  id: string
  /** 车辆ID */
  vehicleId: string
  /** 车辆名称 */
  vehicleName: string
  /** 订单号 */
  orderNo: string
  /** 收益金额（元） */
  amount: number
  /** 收益日期 */
  date: string
  /** 状态 */
  status: 'pending' | 'settled' | 'withdrawn'
}

/**
 * 提现申请数据
 */
export interface WithdrawData extends Record<string, unknown> {
  /** 提现金额（元） */
  amount: number
  /** 提现方式 */
  method: 'wechat' | 'alipay' | 'bank'
  /** 账户信息 */
  account: string
  /** 账户名 */
  accountName: string
}

/**
 * 车型预订数据
 */
export interface ModelBookingData extends Record<string, unknown> {
  /** 车型ID */
  modelId: string
  /** 预约姓名 */
  name: string
  /** 预约电话 */
  phone: string
  /** 预约时间 */
  appointmentTime: string
  /** 备注 */
  remarks?: string
}
