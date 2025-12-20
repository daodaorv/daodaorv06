/**
 * 订单相关类型定义
 */

/**
 * 订单状态
 */
export interface OrderStatus {
  code: string
  name: string
}

/**
 * 车辆规格
 */
export interface VehicleSpecifications {
  /** 座位数 */
  seats: number
  /** 燃料类型 */
  fuelType: string
  /** 变速箱类型 */
  transmission: string
}

/**
 * 车辆信息
 */
export interface Vehicle {
  /** 车辆ID */
  id: string
  /** 车辆名称 */
  name: string
  /** 车辆图片 */
  images: string[]
  /** 车辆规格 */
  specifications: VehicleSpecifications
}

/**
 * 门店信息
 */
export interface Store {
  /** 门店ID */
  id: string
  /** 门店名称 */
  name: string
  /** 门店地址 */
  address: string
}

/**
 * 订单记录
 */
export interface OrderRecord {
  /** 订单ID */
  id: string
  /** 订单编号 */
  orderNo: string
  /** 订单状态 */
  status: OrderStatus
  /** 状态ID */
  statusId?: number
  /** 车辆信息 */
  vehicle?: Vehicle | null
  /** 取车门店 */
  pickupStore?: Store | null
  /** 还车门店 */
  returnStore?: Store | null
  /** 取车时间 */
  pickupTime?: string
  /** 还车时间 */
  returnTime?: string
  /** 订单总金额 */
  totalAmount: number
  /** 实付金额 */
  actualAmount: number
  /** 押金金额 */
  depositAmount?: number
  /** 创建时间 */
  createdAt: string
  /** 是否已评价 */
  isRated?: boolean
}

/**
 * 价格计算参数
 */
export interface CalculatePriceParams {
  /** 车辆ID */
  vehicleId: string
  /** 取车日期 */
  pickupDate: string
  /** 还车日期 */
  returnDate: string
  /** 保险类型 */
  insuranceType?: string
  /** 额外服务 */
  extraServices?: string[]
}

/**
 * 价格明细
 */
export interface PriceDetail {
  /** 租金 */
  rentalFee: number
  /** 保险费 */
  insuranceFee: number
  /** 服务费 */
  serviceFee: number
  /** 押金 */
  depositAmount: number
  /** 总金额 */
  totalAmount: number
}

/**
 * 创建订单参数
 */
export interface CreateOrderParams {
  /** 车辆ID */
  vehicleId: string
  /** 取车门店ID */
  pickupStoreId: string
  /** 还车门店ID */
  returnStoreId: string
  /** 取车时间 */
  pickupTime: string
  /** 还车时间 */
  returnTime: string
  /** 联系人姓名 */
  contactName: string
  /** 联系人电话 */
  contactPhone: string
  /** 保险类型 */
  insuranceType?: string
  /** 优惠券ID */
  couponId?: string
  /** 备注 */
  remarks?: string
}

/**
 * 订单列表查询参数
 */
export interface OrderListParams {
  /** 订单状态 */
  status?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  limit?: number
}

/**
 * 分页信息
 */
export interface Pagination {
  /** 当前页 */
  current: number
  /** 每页数量 */
  pageSize: number
  /** 总数 */
  total: number
  /** 总页数 */
  pages: number
}

/**
 * 订单列表响应
 */
export interface OrderListResponse {
  /** 订单列表 */
  orders: OrderRecord[]
  /** 分页信息 */
  pagination: Pagination
}
