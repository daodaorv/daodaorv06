/**
 * 订单管理相关类型定义
 */

// 订单基础信息
export interface Order {
  id: string
  orderNo: string                // 订单编号
  userId: string                 // 用户ID
  userInfo: UserInfo             // 用户信息
  vehicleId: string              // 车辆ID
  vehicleInfo: VehicleInfo       // 车辆信息
  status: OrderStatus            // 订单状态
  bookingSource: BookingSource   // 预订来源
  rentalInfo: RentalInfo         // 租赁信息
  pricing: OrderPricing          // 价格信息
  payment: PaymentInfo           // 支付信息
  services: AdditionalService[]  // 附加服务
  pickup: PickupReturnInfo       // 取车信息
  return: PickupReturnInfo       // 还车信息
  driver: DriverInfo             // 驾驶员信息
  insurance: InsuranceInfo       // 保险信息
  documents: OrderDocument[]     // 订单文件
  timeline: OrderTimeline[]      // 订单时间线
  notes: string                  // 备注
  createdAt: string              // 创建时间
  updatedAt: string              // 更新时间
  cancelledAt?: string           // 取消时间
  completedAt?: string           // 完成时间
}

// 用户信息
export interface UserInfo {
  id: string
  name: string
  phone: string
  email?: string
  idCard: string
  licenseNo: string
  licenseExpire: string
  avatar?: string
  rating?: number
  orderCount: number
}

// 车辆信息
export interface VehicleInfo {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  type: string
  images: string[]
  features: string[]
  location: string
}

// 订单状态
export type OrderStatus =
  | 'pending'        // 待确认
  | 'confirmed'      // 已确认
  | 'paid'           // 已支付
  | 'preparing'      // 准备中
  | 'active'         // 进行中（已取车）
  | 'completed'      // 已完成（已还车）
  | 'cancelled'      // 已取消
  | 'refunded'       // 已退款
  | 'disputed'       // 争议中

// 预订来源
export type BookingSource =
  | 'wechat'         // 微信小程序
  | 'website'        // 官网
  | 'phone'          // 电话预订
  | 'walkin'         // 现场预订
  | 'admin'          // 管理后台添加
  | 'partner'        // 合作伙伴

// 租赁信息
export interface RentalInfo {
  startDate: string           // 开始日期
  endDate: string             // 结束日期
  duration: number            // 租赁天数
  pickupLocation: string      // 取车地点
  returnLocation: string      // 还车地点
  pickupTime: string          // 取车时间
  estimatedReturnTime: string // 预计还车时间
  actualReturnTime?: string   // 实际还车时间
  mileageIn: number           // 取车里程
  mileageOut?: number         // 还车里程
  fuelIn: number              // 取车油量（百分比）
  fuelOut?: number            // 还车油量（百分比）
  damageIn?: string           // 取车车况描述
  damageOut?: string          // 还车车况描述
  photosIn: string[]          // 取车照片
  photosOut?: string[]        // 还车照片
}

// 价格信息
export interface OrderPricing {
  dailyRate: number           // 日租金
  weeklyRate?: number         // 周租金
  monthlyRate?: number        // 月租金
  baseAmount: number          // 基础租金（天数×日租金）
  insuranceFee: number        // 保险费
  deposit: number             // 押金
  serviceFee: number          // 服务费
  deliveryFee?: number        // 送车费
  additionalFees: number      // 附加费用
  discountAmount: number      // 优惠金额
  subTotal: number            // 小计
  taxAmount: number           // 税费
  totalAmount: number         // 总金额
  paidAmount: number          // 已付金额
  refundAmount?: number       // 退款金额
  currency: string            // 货币单位
}

// 支付信息
export interface PaymentInfo {
  method: PaymentMethod       // 支付方式
  status: PaymentStatus       // 支付状态
  transactions: PaymentTransaction[]  // 支付记录
  paymentUrl?: string         // 支付链接
  paidAt?: string             // 支付时间
  refundedAt?: string         // 退款时间
}

// 支付方式
export type PaymentMethod =
  | 'wechat_pay'      // 微信支付
  | 'alipay'          // 支付宝
  | 'credit_card'     // 信用卡
  | 'debit_card'      // 借记卡
  | 'cash'            // 现金
  | 'bank_transfer'   // 银行转账
  | 'deposit'         // 押金抵扣

// 支付状态
export type PaymentStatus =
  | 'unpaid'          // 未支付
  | 'paying'          // 支付中
  | 'paid'            // 已支付
  | 'partial_paid'    // 部分支付
  | 'refunded'        // 已退款
  | 'partial_refunded' // 部分退款
  | 'failed'          // 支付失败

// 支付记录
export interface PaymentTransaction {
  id: string
  type: 'payment' | 'refund'  // 交易类型
  amount: number              // 金额
  method: PaymentMethod       // 支付方式
  status: string              // 状态
  transactionId?: string      // 第三方交易ID
  gateway: string             // 支付网关
  createdAt: string           // 创建时间
  completedAt?: string        // 完成时间
  notes?: string              // 备注
}

// 附加服务
export interface AdditionalService {
  id: string
  name: string                // 服务名称
  type: ServiceType           // 服务类型
  price: number               // 单价
  quantity: number            // 数量
  totalPrice: number          // 总价
  description?: string        // 描述
}

// 服务类型
export type ServiceType =
  | 'gps'             // GPS导航
  | 'child_seat'      // 儿童座椅
  | 'bike_rack'       // 自行车架
  | 'outdoor_table'   // 户外桌椅
  | 'sleeping_bag'    // 睡袋
  | 'kitchen_set'     // 厨房用具
  | 'insurance'       // 额外保险
  | 'cleaning'        // 清洁服务
  | 'delivery'        // 送车服务
  | 'pickup'          // 接车服务
  | 'other'           // 其他

// 取车/还车信息
export interface PickupReturnInfo {
  location: string              // 地点
  address: string               // 地址
  contactPerson: string         // 联系人
  contactPhone: string          // 联系电话
  notes?: string                // 备注
  photos?: string[]             // 照片
  signature?: string            // 签名
  date?: string                 // 日期
  time?: string                 // 时间
}

// 驾驶员信息
export interface DriverInfo {
  name: string                  // 姓名
  phone: string                 // 电话
  idCard: string                // 身份证号
  licenseNo: string             // 驾照号
  licenseType: string           // 驾照类型
  licenseExpire: string         // 驾照到期日
  experience: string            // 驾龄
  additionalDrivers?: AdditionalDriver[]  // 附加驾驶员
}

// 附加驾驶员
export interface AdditionalDriver {
  name: string
  phone: string
  idCard: string
  licenseNo: string
  licenseType: string
  licenseExpire: string
}

// 保险信息
export interface InsuranceInfo {
  provider: string              // 保险公司
  policyNo: string              // 保单号
  type: InsuranceType           // 保险类型
  coverage: number              // 保额
  premium: number               // 保费
  deductible: number            // 免赔额
  startDate: string             // 开始日期
  endDate: string               // 结束日期
  terms?: string                // 条款
}

// 保险类型
export type InsuranceType =
  | 'basic'           // 基础险
  | 'comprehensive'   // 综合险
  | 'full'            // 全险
  | 'premium'         // 高端险
  | 'custom'          // 自定义

// 订单文件
export interface OrderDocument {
  id: string
  type: DocumentType            // 文件类型
  name: string                  // 文件名
  url: string                   // 文件URL
  uploadedBy: string            // 上传人
  uploadedAt: string            // 上传时间
  notes?: string                // 备注
}

// 文件类型
export type DocumentType =
  | 'contract'        // 合同
  | 'id_card'         // 身份证
  | 'license'         // 驾照
  | 'insurance'       // 保险单
  | 'pickup_form'     // 取车单
  | 'return_form'     // 还车单
  | 'damage_report'   // 损坏报告
  | 'receipt'         // 收据
  | 'other'           // 其他

// 订单时间线
export interface OrderTimeline {
  id: string
  action: TimelineAction         // 操作类型
  status: OrderStatus            // 状态
  title: string                  // 标题
  description?: string           // 描述
  operatorId: string             // 操作人ID
  operatorName: string           // 操作人姓名
  operatorType: OperatorType     // 操作人类型
  data?: Record<string, any>     // 额外数据
  createdAt: string              // 创建时间
}

// 时间线操作类型
export type TimelineAction =
  | 'created'         // 创建
  | 'confirmed'       // 确认
  | 'paid'            // 支付
  | 'cancelled'       // 取消
  | 'refunded'        // 退款
  | 'modified'        // 修改
  | 'vehicle_assigned' // 分配车辆
  | 'pickup_scheduled' // 安排取车
  | 'pickup_completed' // 完成取车
  | 'return_scheduled' // 安排还车
  | 'return_completed' // 完成还车
  | 'dispute_created'  // 创建争议
  | 'dispute_resolved' // 解决争议
  | 'note_added'      // 添加备注

// 操作人类型
export type OperatorType =
  | 'customer'        // 客户
  | 'admin'           // 管理员
  | 'staff'           // 员工
  | 'system'          // 系统

// 订单查询参数
export interface OrderListParams {
  page?: number
  pageSize?: number
  orderNo?: string
  userId?: string
  vehicleId?: string
  status?: OrderStatus
  source?: BookingSource
  paymentStatus?: PaymentStatus
  startDate?: string          // 租赁开始日期
  endDate?: string            // 租赁结束日期
  createdStartDate?: string   // 创建开始日期
  createdEndDate?: string     // 创建结束日期
  vehicleType?: string        // 车辆类型
  location?: string           // 车辆位置
  driverName?: string         // 驾驶员姓名
  driverPhone?: string        // 驾驶员电话
  amountMin?: number          // 最小金额
  amountMax?: number          // 最大金额
  sortBy?: 'createdAt' | 'startDate' | 'totalAmount' | 'orderNo'
  sortOrder?: 'asc' | 'desc'
}

// 创建订单参数
export interface OrderCreateParams {
  userId: string
  vehicleId: string
  rentalInfo: Omit<RentalInfo, 'mileageOut' | 'fuelOut' | 'damageOut' | 'photosOut' | 'actualReturnTime'>
  driver: DriverInfo
  services?: Omit<AdditionalService, 'id' | 'totalPrice'>[]
  insurance?: InsuranceInfo
  notes?: string
  source?: BookingSource
}

// 订单统计
export interface OrderStats {
  total: number                    // 总订单数
  pending: number                  // 待确认
  confirmed: number                // 已确认
  active: number                   // 进行中
  completed: number                // 已完成
  cancelled: number                // 已取消
  disputed: number                 // 争议中
  totalRevenue: number             // 总收入
  averageOrderValue: number        // 平均订单价值
  occupancyRate: number            // 出租率
  averageRentalDays: number        // 平均租期
  revenueByMonth: { month: string; revenue: number; orders: number }[]
  popularVehicles: { vehicleId: string; vehicleName: string; bookings: number; revenue: number }[]
  commonServices: { serviceId: string; serviceName: string; count: number; revenue: number }[]
}

// 退款信息
export interface RefundInfo {
  id: string
  orderId: string
  amount: number
  reason: string
  status: RefundStatus
  method: string
  processedBy: string
  processedAt?: string
  notes?: string
  createdAt: string
}

// 退款状态
export type RefundStatus =
  | 'pending'         // 待处理
  | 'approved'        // 已批准
  | 'rejected'        // 已拒绝
  | 'processing'      // 处理中
  | 'completed'       // 已完成
  | 'failed'          // 失败

// API响应类型
export interface OrderListResponse {
  items: Order[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrderDetailResponse {
  order: Order
  refundHistory?: RefundInfo[]
  similarOrders?: Order[]
}

export interface OrderStatsResponse {
  stats: OrderStats
}