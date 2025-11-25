/**
 * 车辆管理相关类型定义
 */

// 车辆基础信息
export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  vin: string
  type: VehicleType
  status: VehicleStatus
  location: string
  ownerId?: string
  ownerName?: string
  ownerPhone?: string
  images: VehicleImage[]
  specifications: VehicleSpecifications
  features: string[]
  description: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  deposit: number
  mileage: number
  availability: VehicleAvailability
  createdAt: string
  updatedAt: string
}

// 车辆类型
export type VehicleType =
  | 'rv_motorhome'      // 房车
  | 'rv_camper'         // 露营车
  | 'rv_trailer'         // 拖挂式房车
  | 'rv_class_a'        // A型房车
  | 'rv_class_b'        // B型房车
  | 'rv_class_c'        // C型房车
  | 'rv_truck_camper'    // 皮卡房车

// 车辆状态
export type VehicleStatus =
  | 'available'          // 可用
  | 'rented'             // 已租出
  | 'maintenance'        // 维护中
  | 'damaged'            // 损坏
  | 'retired'            // 退役
  | 'inactive'           // 未激活

// 车辆图片
export interface VehicleImage {
  id: string
  url: string
  alt: string
  isMain: boolean
  type: 'exterior' | 'interior' | 'detail' | 'feature'
  sortOrder: number
}

// 车辆规格
export interface VehicleSpecifications {
  length: number          // 长度(米)
  width: number           // 宽度(米)
  height: number          // 高度(米)
  weight: number          // 重量(kg)
  seats: number           // 座位数
  beds: number            // 床位数
  engineType: string      // 发动机类型
  transmission: string     // 变速箱
  fuelType: string        // 燃料类型
  driveType: string       // 驱动类型
  payload: number         // 载重(kg)
  waterCapacity: number   // 水箱容量(L)
  grayWaterCapacity: number // 灰水箱容量(L)
  freshWaterCapacity: number // 清水箱容量(L)
  gasBottleCapacity: number // 燃气罐容量(L)
  batteryCapacity: number  // 电池容量(Ah)
  solarPanels: boolean    // 太阳能板
  airConditioning: boolean // 空调
  heating: boolean        // 暖气
  kitchen: boolean        // 厨房
  bathroom: boolean       // 卫生间
  shower: boolean         // 淋浴
  toilet: boolean         // 马所
  refrigerator: boolean   // 冰箱
  microwave: boolean      // 微波炉
  tv: boolean            // 电视
  wifi: boolean           // WiFi
  generator: boolean     // 发电机
  levelingSystem: boolean // 调平系统
  awning: boolean        // 遮阳篷
  bikeRack: boolean       // 自行车架
  towingCapacity: number // 拖拽能力(kg)
}

// 车辆可用性
export interface VehicleAvailability {
  available: boolean
  blockedDates: BlockedDate[]
  minRentalDays: number
  maxRentalDays: number
  advanceNoticeDays: number
  lastMinute: boolean
}

// 预订日期
export interface BlockedDate {
  id: string
  startDate: string
  endDate: string
  reason: string
  type: 'rental' | 'maintenance' | 'event' | 'block'
}

// 车辆列表查询参数
export interface VehicleListParams {
  page?: number
  pageSize?: number
  type?: VehicleType
  status?: VehicleStatus
  location?: string
  brand?: string
  minDailyRate?: number
  maxDailyRate?: number
  features?: string[]
  search?: string
  sortBy?: 'createdAt' | 'dailyRate' | 'mileage' | 'year'
  sortOrder?: 'asc' | 'desc'
}

// 车辆创建/更新参数
export interface VehicleCreateParams {
  brand: string
  model: string
  year: number
  licensePlate: string
  vin: string
  type: VehicleType
  status: VehicleStatus
  location: string
  ownerId?: string
  specifications: Omit<VehicleSpecifications, 'id'>
  features: string[]
  description: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  deposit: number
  mileage: number
  images: Omit<VehicleImage[], 'id'>[]
  availability?: Partial<VehicleAvailability>
}

// 车辆统计信息
export interface VehicleStats {
  total: number
  available: number
  rented: number
  maintenance: number
  damaged: number
  retired: number
  inactive: number
  byType: Record<VehicleType, number>
  averageDailyRate: number
  totalMileage: number
}

// 车辆维护记录
export interface VehicleMaintenance {
  id: string
  vehicleId: string
  type: MaintenanceType
  status: MaintenanceStatus
  title: string
  description: string
  cost: number
  startDate: string
  endDate?: string
  technician?: string
  parts: MaintenancePart[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// 维护类型
export type MaintenanceType =
  | 'routine'            // 常规维护
  | 'repair'             // 故障维修
  | 'inspection'         // 检查
  | 'service'            // 保养
  | 'cleaning'           // 清洁
  | 'upgrade'            // 升级

// 维护状态
export type MaintenanceStatus =
  | 'scheduled'          // 已安排
  | 'in_progress'        // 进行中
  | 'completed'          // 已完成
  | 'cancelled'          // 已取消
  | 'delayed'            // 延期

// 维护配件
export interface MaintenancePart {
  name: string
  partNumber: string
  quantity: number
  unitCost: number
  totalCost: number
  supplier?: string
}

// 车辆预约
export interface VehicleBooking {
  id: string
  vehicleId: string
  userId: string
  startDate: string
  endDate: string
  status: BookingStatus
  totalAmount: number
  depositAmount: number
  pickupLocation: string
  dropoffLocation: string
  driverLicense?: string
  driverExperience?: string
  additionalDrivers?: number
  insuranceCoverage?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// 预约状态
export type BookingStatus =
  | 'pending'            // 待确认
  | 'confirmed'          // 已确认
  | 'active'             // 进行中
  | 'completed'          // 已完成
  | 'cancelled'          // 已取消
  | 'no_show'            // 未到店
  | 'refunded'           // 已退款

// 车辆评价
export interface VehicleReview {
  id: string
  vehicleId: string
  bookingId: string
  userId: string
  rating: number
  title: string
  content: string
  images: ReviewImage[]
  pros: string[]
  cons: string[]
  createdAt: string
  updatedAt: string
}

// 评价图片
export interface ReviewImage {
  id: string
  url: string
  alt: string
  type: 'vehicle' | 'interior' | 'damage' | 'feature'
}

// API响应类型
export interface VehicleListResponse {
  items: Vehicle[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface VehicleDetailResponse {
  vehicle: Vehicle
  maintenance: VehicleMaintenance[]
  bookings: VehicleBooking[]
  reviews: VehicleReview[]
}

export interface VehicleStatsResponse {
  stats: VehicleStats
}