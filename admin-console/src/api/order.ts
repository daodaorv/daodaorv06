/**
 * 订单管理 API
 */
import {
  mockGetOrderList,
  mockGetOrderDetail,
  mockGetOrderByOrderNo,
  mockCreateOrder,
  mockUpdateOrder,
  mockCancelOrder,
  mockConfirmOrder,
  mockCompleteOrder,
  mockGetOrderStats,
  mockGetExceptionList,
  mockGetExceptionDetail,
  mockHandleException,
  mockGetExceptionStats,
  mockGetRefundList,
  mockApproveRefund,
  mockGetRefundStats,
  mockGetReviewList,
  mockReplyReview,
  mockToggleReviewStatus,
  mockGetReviewStats,
  mockPickupOrder,
  mockReturnOrder,
  mockGetPickupRecord,
  type Order,
  type OrderListParams,
  type CreateOrderParams,
  type UpdateOrderParams,
  type OrderStats,
  type OrderException,
  type ExceptionListParams,
  type Refund,
  type RefundListParams,
  type OrderReview,
  type ReviewListParams,
  type PickupRecord,
  type PickupOrderParams,
  type ReturnOrderParams,
} from '@/mock/orders'

// 导出类型
export type {
  Order,
  OrderListParams,
  CreateOrderParams,
  UpdateOrderParams,
  OrderStats,
  OrderException,
  ExceptionListParams,
  Refund,
  RefundListParams,
  OrderReview,
  ReviewListParams,
  PickupRecord,
  PickupOrderParams,
  ReturnOrderParams,
}

/**
 * 获取订单列表
 */
export const getOrderList = (params: OrderListParams) => {
  // return request.get('/orders', { params })
  return mockGetOrderList(params)
}

/**
 * 获取订单详情
 */
export const getOrderDetail = (id: number) => {
  // return request.get(`/orders/${id}`)
  return mockGetOrderDetail(id)
}

/**
 * 通过订单号查找订单
 */
export const getOrderByOrderNo = (orderNo: string) => {
  // return request.get(`/orders/by-order-no/${orderNo}`)
  return mockGetOrderByOrderNo(orderNo)
}

/**
 * 创建订单
 */
export const createOrder = (data: CreateOrderParams) => {
  // return request.post('/orders', data)
  return mockCreateOrder(data)
}

/**
 * 更新订单
 */
export const updateOrder = (id: number, data: UpdateOrderParams) => {
  // return request.put(`/orders/${id}`, data)
  return mockUpdateOrder(id, data)
}

/**
 * 取消订单
 */
export const cancelOrder = (id: number, reason: string) => {
  // return request.post(`/orders/${id}/cancel`, { reason })
  return mockCancelOrder(id, reason)
}

/**
 * 确认订单
 */
export const confirmOrder = (id: number) => {
  // return request.post(`/orders/${id}/confirm`)
  return mockConfirmOrder(id)
}

/**
 * 完成订单
 */
export const completeOrder = (id: number) => {
  // return request.post(`/orders/${id}/complete`)
  return mockCompleteOrder(id)
}

/**
 * 获取订单统计
 */
export const getOrderStats = () => {
  // return request.get('/orders/stats')
  return mockGetOrderStats()
}

// ==================== 异常订单管理 ====================

/**
 * 获取异常订单列表
 */
export const getExceptionList = (params: ExceptionListParams) => {
  // return request.get('/orders/exceptions', { params })
  return mockGetExceptionList(params)
}

/**
 * 获取异常订单详情
 */
export const getExceptionDetail = (id: number) => {
  // return request.get(`/orders/exceptions/${id}`)
  return mockGetExceptionDetail(id)
}

/**
 * 处理异常订单
 */
export const handleException = (id: number, resolution: string) => {
  // return request.post(`/orders/exceptions/${id}/handle`, { resolution })
  return mockHandleException(id, resolution)
}

/**
 * 获取异常统计
 */
export const getExceptionStats = () => {
  // return request.get('/orders/exceptions/stats')
  return mockGetExceptionStats()
}

/**
 * 分配异常
 */
export const assignException = (id: number, data: any) => {
  // return request.post(`/orders/exceptions/${id}/assign`, data)
  return Promise.resolve({
    code: 200,
    message: '分配成功',
    data: { id, ...data },
  })
}

/**
 * 升级异常
 */
export const escalateException = (id: number, priority: string) => {
  // return request.post(`/orders/exceptions/${id}/escalate`, { priority })
  return Promise.resolve({
    code: 200,
    message: '升级成功',
    data: { id, priority },
  })
}

/**
 * 异常费用结算
 */
export const settleException = (id: number, data: any) => {
  // return request.post(`/orders/exceptions/${id}/settle`, data)
  return Promise.resolve({
    code: 200,
    message: '结算成功',
    data: { id, ...data },
  })
}

/**
 * 获取异常时间线
 */
export const getExceptionTimeline = (id: number) => {
  // return request.get(`/orders/exceptions/${id}/timeline`)
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: [
      {
        action: 'created',
        timestamp: new Date().toISOString(),
        operator: '系统',
        description: '异常创建',
        details: [],
      },
    ],
  })
}

// ==================== 退款管理 ====================

/**
 * 获取退款列表
 */
export const getRefundList = (params: RefundListParams) => {
  // return request.get('/orders/refunds', { params })
  return mockGetRefundList(params)
}

/**
 * 审核退款
 */
export const approveRefund = (id: number, approved: boolean, reason?: string) => {
  // return request.post(`/orders/refunds/${id}/approve`, { approved, reason })
  return mockApproveRefund(id, approved, reason)
}

/**
 * 获取退款统计
 */
export const getRefundStats = () => {
  // return request.get('/orders/refunds/stats')
  return mockGetRefundStats()
}

/**
 * 退款重试
 */
export const retryRefund = (id: number, data: any) => {
  // return request.post(`/orders/refunds/${id}/retry`, data)
  return Promise.resolve({
    code: 200,
    message: '退款重试成功',
    data: { id, ...data },
  })
}

/**
 * 切换退款方式
 */
export const changeRefundMethod = (id: number, data: any) => {
  // return request.post(`/orders/refunds/${id}/change-method`, data)
  return Promise.resolve({
    code: 200,
    message: '切换退款方式成功',
    data: { id, ...data },
  })
}

/**
 * 线下退款登记
 */
export const registerOfflineRefund = (id: number, data: any) => {
  // return request.post(`/orders/refunds/${id}/offline`, data)
  return Promise.resolve({
    code: 200,
    message: '线下退款登记成功',
    data: { id, ...data },
  })
}

/**
 * 查询退款进度
 */
export const getRefundProgress = (id: number) => {
  // return request.get(`/orders/refunds/${id}/progress`)
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: {
      status: 'processing',
      message: '退款正在处理中',
      percentage: 50,
      estimatedTime: '2024-01-20 18:00',
      transactionNo: 'TXN202401200001',
      updatedAt: new Date().toISOString(),
      details: [],
    },
  })
}

// ==================== 订单评价管理 ====================

/**
 * 获取评价列表
 */
export const getReviewList = (params: ReviewListParams) => {
  // return request.get('/orders/reviews', { params })
  return mockGetReviewList(params)
}

/**
 * 回复评价
 */
export const replyReview = (id: number, reply: string) => {
  // return request.post(`/orders/reviews/${id}/reply`, { reply })
  return mockReplyReview(id, reply)
}

/**
 * 隐藏/显示评价
 */
export const toggleReviewStatus = (id: number, status: 'published' | 'hidden') => {
  // return request.post(`/orders/reviews/${id}/toggle`, { status })
  return mockToggleReviewStatus(id, status)
}

/**
 * 获取评价统计
 */
export const getReviewStats = () => {
  // return request.get('/orders/reviews/stats')
  return mockGetReviewStats()
}

/**
 * 后台添加评价
 */
export const createReview = (data: any) => {
  // return request.post('/orders/reviews', data)
  return Promise.resolve({
    code: 200,
    message: '评价添加成功',
    data: { id: Date.now(), ...data },
  })
}

/**
 * 删除评价
 */
export const deleteReview = (id: number, data: any) => {
  // return request.delete(`/orders/reviews/${id}`, { data })
  return Promise.resolve({
    code: 200,
    message: '评价删除成功',
    data: { id, ...data },
  })
}

/**
 * 按车型统计评价
 */
export const getReviewStatsByVehicle = () => {
  // return request.get('/orders/reviews/stats/vehicle')
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: [
      {
        vehicleName: '奔驰V260',
        reviewCount: 328,
        averageRating: 4.8,
        satisfactionRate: 96,
        trend: 'up',
      },
      {
        vehicleName: '大通V90',
        reviewCount: 285,
        averageRating: 4.6,
        satisfactionRate: 92,
        trend: 'up',
      },
    ],
  })
}

/**
 * 按门店统计评价
 */
export const getReviewStatsByStore = () => {
  // return request.get('/orders/reviews/stats/store')
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: [
      {
        storeName: '北京朝阳门店',
        reviewCount: 412,
        averageRating: 4.7,
        satisfactionRate: 94,
        serviceQuality: 95,
      },
      {
        storeName: '上海浦东门店',
        reviewCount: 385,
        averageRating: 4.6,
        satisfactionRate: 92,
        serviceQuality: 93,
      },
    ],
  })
}

/**
 * 获取评价趋势
 */
export const getReviewTrend = (params: any) => {
  // return request.get('/orders/reviews/stats/trend', { params })
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: [
      { date: '12-16', count: 45, rating: 4.5 },
      { date: '12-17', count: 52, rating: 4.6 },
      { date: '12-18', count: 38, rating: 4.4 },
    ],
  })
}

// ==================== 取车还车管理 ====================

/**
 * 取车登记
 */
export const pickupOrder = (orderId: number, data: PickupOrderParams) => {
  // return request.post(`/orders/${orderId}/pickup`, data)
  return mockPickupOrder(orderId, data)
}

/**
 * 还车登记
 */
export const returnOrder = (orderId: number, data: ReturnOrderParams) => {
  // return request.post(`/orders/${orderId}/return`, data)
  return mockReturnOrder(orderId, data)
}

/**
 * 获取取车记录
 */
export const getPickupRecord = (orderId: number) => {
  // return request.get(`/orders/${orderId}/pickup-record`)
  return mockGetPickupRecord(orderId)
}

/**
 * 获取订单时间线
 */
export const getOrderTimeline = (_orderId: number) => {
  // return request.get(`/orders/${orderId}/timeline`)
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: [
      {
        action: 'created',
        timestamp: new Date().toISOString(),
        operator: '系统',
        description: '订单创建成功',
        details: [],
      },
    ],
  })
}

// ==================== 导出 API 对象 ====================

/**
 * 订单 API 对象（用于 composables）
 */
export const orderApi = {
  getOrderList,
  getOrderDetail,
  getOrderByOrderNo,
  createOrder,
  updateOrder,
  cancelOrder,
  confirmOrder,
  completeOrder,
  getOrderStats,
  getExceptionList,
  getExceptionDetail,
  handleException,
  getExceptionStats,
  assignException,
  escalateException,
  settleException,
  getExceptionTimeline,
  getRefundList,
  approveRefund,
  getRefundStats,
  retryRefund,
  changeRefundMethod,
  registerOfflineRefund,
  getRefundProgress,
  getReviewList,
  replyReview,
  toggleReviewStatus,
  getReviewStats,
  createReview,
  deleteReview,
  getReviewStatsByVehicle,
  getReviewStatsByStore,
  getReviewTrend,
  pickupOrder,
  returnOrder,
  getPickupRecord,
  getOrderTimeline,
}
