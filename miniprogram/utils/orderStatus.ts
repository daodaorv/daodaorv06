/**
 * 订单状态码统一管理工具
 * 解决前后端状态码不一致的问题
 */

/**
 * 后端标准状态码（数据库存储）
 */
export enum BackendOrderStatus {
  PENDING = 'pending',              // 待支付
  PAID = 'paid',                    // 已支付
  CONFIRMED = 'confirmed',          // 已确认
  PICKED_UP = 'picked_up',          // 已取车/租赁中
  RETURNED = 'returned',            // 已还车
  COMPLETED = 'completed',          // 已完成
  CANCELLED = 'cancelled'           // 已取消
}

/**
 * 前端旧状态码（兼容性保留）
 */
export enum FrontendOrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_CONFIRMATION = 'pending_confirmation',
  PENDING_PICKUP = 'pending_pickup',
  IN_PROGRESS = 'in_progress',
  RENTING = 'renting',
  PENDING_RETURN = 'pending_return',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * 状态码映射：前端旧状态码 -> 后端标准状态码
 */
const STATUS_MAP: Record<string, BackendOrderStatus> = {
  // 前端旧状态码映射
  'pending_payment': BackendOrderStatus.PENDING,
  'pending_confirmation': BackendOrderStatus.PAID,
  'pending_pickup': BackendOrderStatus.CONFIRMED,
  'in_progress': BackendOrderStatus.PICKED_UP,
  'renting': BackendOrderStatus.PICKED_UP,
  'pending_return': BackendOrderStatus.RETURNED,
  // 后端标准状态码（直接返回）
  'pending': BackendOrderStatus.PENDING,
  'paid': BackendOrderStatus.PAID,
  'confirmed': BackendOrderStatus.CONFIRMED,
  'picked_up': BackendOrderStatus.PICKED_UP,
  'returned': BackendOrderStatus.RETURNED,
  'completed': BackendOrderStatus.COMPLETED,
  'cancelled': BackendOrderStatus.CANCELLED
};

/**
 * 状态显示配置
 */
interface StatusConfig {
  name: string;           // 状态名称
  color: string;          // 状态颜色
  icon: string;           // 状态图标
  bgGradient?: string;    // 背景渐变（用于详情页）
  description?: string;   // 状态描述
}

/**
 * 状态显示配置映射
 */
const STATUS_CONFIG: Record<BackendOrderStatus, StatusConfig> = {
  [BackendOrderStatus.PENDING]: {
    name: '待支付',
    color: '#FF4D4F',
    icon: 'clock',
    bgGradient: 'linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%)',
    description: '请在 29:59 内完成支付，超时将自动取消'
  },
  [BackendOrderStatus.PAID]: {
    name: '已支付',
    color: '#FFB84D',
    icon: 'hourglass',
    bgGradient: 'linear-gradient(135deg, #FFB84D 0%, #FFC966 100%)',
    description: '订单已支付，等待商家确认'
  },
  [BackendOrderStatus.CONFIRMED]: {
    name: '已确认',
    color: '#52C41A',
    icon: 'calendar',
    bgGradient: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
    description: '订单已确认，请按时到店取车'
  },
  [BackendOrderStatus.PICKED_UP]: {
    name: '租赁中',
    color: '#00B578',
    icon: 'car-fill',
    bgGradient: 'linear-gradient(135deg, #00B578 0%, #4CAF50 100%)',
    description: '祝您旅途愉快，注意行车安全'
  },
  [BackendOrderStatus.RETURNED]: {
    name: '已还车',
    color: '#1890FF',
    icon: 'map',
    bgGradient: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)',
    description: '车辆已归还，等待验收'
  },
  [BackendOrderStatus.COMPLETED]: {
    name: '已完成',
    color: '#2196F3',
    icon: 'checkmark-circle-fill',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
    description: '订单已完成，期待下次为您服务'
  },
  [BackendOrderStatus.CANCELLED]: {
    name: '已取消',
    color: '#999999',
    icon: 'close-circle-fill',
    bgGradient: 'linear-gradient(135deg, #999999 0%, #BBBBBB 100%)',
    description: '订单已取消'
  }
};

/**
 * 标准化状态码：将任意状态码转换为后端标准状态码
 * @param status 原始状态码
 * @returns 后端标准状态码
 */
export function normalizeStatus(status: string): BackendOrderStatus {
  const normalized = STATUS_MAP[status];
  if (!normalized) {
    console.warn(`未知的订单状态码: ${status}，使用默认状态 pending`);
    return BackendOrderStatus.PENDING;
  }
  return normalized;
}

/**
 * 获取状态显示配置
 * @param status 原始状态码
 * @returns 状态显示配置
 */
export function getStatusConfig(status: string): StatusConfig {
  const normalizedStatus = normalizeStatus(status);
  return STATUS_CONFIG[normalizedStatus];
}

/**
 * 获取状态颜色
 * @param status 原始状态码
 * @returns 状态颜色
 */
export function getStatusColor(status: string): string {
  return getStatusConfig(status).color;
}

/**
 * 获取状态名称
 * @param status 原始状态码
 * @returns 状态名称
 */
export function getStatusName(status: string): string {
  return getStatusConfig(status).name;
}

/**
 * 获取状态图标
 * @param status 原始状态码
 * @returns 状态图标
 */
export function getStatusIcon(status: string): string {
  return getStatusConfig(status).icon;
}

/**
 * 判断订单是否可以取消
 * @param status 原始状态码
 * @returns 是否可以取消
 */
export function canCancelOrder(status: string): boolean {
  const normalized = normalizeStatus(status);
  return [
    BackendOrderStatus.PENDING,
    BackendOrderStatus.CONFIRMED
  ].includes(normalized);
}

/**
 * 判断订单是否可以支付
 * @param status 原始状态码
 * @returns 是否可以支付
 */
export function canPayOrder(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === BackendOrderStatus.PENDING;
}

/**
 * 判断订单是否在租赁中
 * @param status 原始状态码
 * @returns 是否在租赁中
 */
export function isOrderInProgress(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === BackendOrderStatus.PICKED_UP;
}

/**
 * 判断订单是否已完成
 * @param status 原始状态码
 * @returns 是否已完成
 */
export function isOrderCompleted(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === BackendOrderStatus.COMPLETED;
}
