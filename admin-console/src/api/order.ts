/**
 * 订单管理相关API接口
 */
import request from './request';
import type {
  Order,
  OrderListParams,
  OrderCreateParams,
  OrderStats,
  RefundInfo,
  OrderListResponse,
  OrderDetailResponse,
  OrderStatsResponse,
  OrderStatus,
  PaymentStatus
} from '@/types/order';

// 订单管理API
export const getOrders = (params?: OrderListParams) => {
  return request.get<ApiResponse<Order[]>>('/api/v1/orders', { params });
};

export const getOrder = (id: string) => {
  return request.get<ApiResponse<Order>>(`/api/v1/orders/${id}`);
};

export const createOrder = (data: OrderCreateParams) => {
  return request.post<ApiResponse<Order>>('/api/v1/orders', data);
};

export const updateOrder = (id: string, data: Partial<OrderCreateParams>) => {
  return request.put<ApiResponse<Order>>(`/api/v1/orders/${id}`, data);
};

export const deleteOrder = (id: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/orders/${id}`);
};

export const cancelOrder = (id: string, reason: string) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${id}/cancel`, { reason });
};

// 订单状态管理
export const updateOrderStatus = (id: string, status: OrderStatus, notes?: string) => {
  return request.patch<ApiResponse<Order>>(`/api/v1/orders/${id}/status`, { status, notes });
};

export const confirmOrder = (id: string, data?: { vehicleId?: string; notes?: string }) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${id}/confirm`, data);
};

export const startOrder = (id: string, pickupData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${id}/start`, pickupData);
};

export const completeOrder = (id: string, returnData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${id}/complete`, returnData);
};

// 支付管理
export const getOrderPayment = (id: string) => {
  return request.get<ApiResponse<any>>(`/api/v1/orders/${id}/payment`);
};

export const createPayment = (id: string, data: { method: string; amount: number }) => {
  return request.post<ApiResponse<any>>(`/api/v1/orders/${id}/payment`, data);
};

export const updatePaymentStatus = (id: string, status: PaymentStatus, transactionId?: string) => {
  return request.patch<ApiResponse<any>>(`/api/v1/orders/${id}/payment/status`, { status, transactionId });
};

export const markAsPaid = (id: string, paymentData: { method: string; amount: number; transactionId?: string }) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${id}/mark-paid`, paymentData);
};

// 退款管理
export const processRefund = (id: string, refundData: { amount: number; reason: string; method?: string }) => {
  return request.post<ApiResponse<RefundInfo>>(`/api/v1/orders/${id}/refund`, refundData);
};

export const getRefundHistory = (id: string) => {
  return request.get<ApiResponse<RefundInfo[]>>(`/api/v1/orders/${id}/refunds`);
};

export const updateRefundStatus = (orderId: string, refundId: string, status: string, notes?: string) => {
  return request.patch<ApiResponse<RefundInfo>>(`/api/v1/orders/${orderId}/refunds/${refundId}`, { status, notes });
};

// 文件管理
export const uploadDocument = (orderId: string, formData: FormData) => {
  return request.post<ApiResponse<any>>(`/api/v1/orders/${orderId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDocuments = (id: string) => {
  return request.get<ApiResponse<any[]>>(`/api/v1/orders/${id}/documents`);
};

export const deleteDocument = (orderId: string, documentId: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/orders/${orderId}/documents/${documentId}`);
};

// 车辆分配
export const assignVehicle = (orderId: string, vehicleId: string, notes?: string) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/assign-vehicle`, { vehicleId, notes });
};

export const unassignVehicle = (orderId: string, reason?: string) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/unassign-vehicle`, { reason });
};

// 取车还车管理
export const schedulePickup = (orderId: string, pickupData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/schedule-pickup`, pickupData);
};

export const recordPickup = (orderId: string, pickupData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/record-pickup`, pickupData);
};

export const scheduleReturn = (orderId: string, returnData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/schedule-return`, returnData);
};

export const recordReturn = (orderId: string, returnData: any) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/record-return`, returnData);
};

// 订单备注
export const addNote = (orderId: string, note: string, isInternal?: boolean) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/notes`, { note, isInternal });
};

export const getNotes = (orderId: string) => {
  return request.get<ApiResponse<any[]>>(`/api/v1/orders/${orderId}/notes`);
};

// 时间线
export const getOrderTimeline = (orderId: string) => {
  return request.get<ApiResponse<any[]>>(`/api/v1/orders/${orderId}/timeline`);
};

export const addTimelineEntry = (orderId: string, entry: any) => {
  return request.post<ApiResponse<any>>(`/api/v1/orders/${orderId}/timeline`, entry);
};

// 订单统计
export const getOrderStats = (params?: { startDate?: string; endDate?: string; groupBy?: 'month' | 'week' | 'day' }) => {
  return request.get<ApiResponse<OrderStats>>('/api/v1/orders/stats', { params });
};

export const getRevenueReport = (params?: { startDate?: string; endDate?: string; groupBy?: 'month' | 'week' | 'day' }) => {
  return request.get<ApiResponse<any>>('/api/v1/orders/revenue-report', { params });
};

export const getOccupancyReport = (params?: { startDate?: string; endDate?: string; vehicleId?: string }) => {
  return request.get<ApiResponse<any>>('/api/v1/orders/occupancy-report', { params });
};

// 订单导出
export const exportOrders = (params?: OrderListParams & { format?: 'excel' | 'csv' }) => {
  return request.get('/api/v1/orders/export', {
    params,
    responseType: 'blob'
  });
};

export const exportOrder = (orderId: string, format?: 'pdf' | 'excel') => {
  return request.get(`/api/v1/orders/${orderId}/export`, {
    params: { format },
    responseType: 'blob'
  });
};

// 批量操作
export const batchUpdateStatus = (orderIds: string[], status: OrderStatus, notes?: string) => {
  return request.patch<ApiResponse<null>>('/api/v1/orders/batch/status', { orderIds, status, notes });
};

export const batchCancel = (orderIds: string[], reason: string) => {
  return request.post<ApiResponse<null>>('/api/v1/orders/batch/cancel', { orderIds, reason });
};

export const batchDelete = (orderIds: string[]) => {
  return request.delete<ApiResponse<null>>('/api/v1/orders/batch', { data: { orderIds } });
};

export const sendBatchNotifications = (orderIds: string[], message: string, type?: 'sms' | 'email' | 'wechat') => {
  return request.post<ApiResponse<null>>('/api/v1/orders/batch/notify', { orderIds, message, type });
};

// 订单搜索和筛选
export const searchOrders = (query: string, filters?: any) => {
  return request.get<ApiResponse<Order[]>>('/api/v1/orders/search', {
    params: { query, ...filters }
  });
};

export const getAdvancedFilters = () => {
  return request.get<ApiResponse<any>>('/api/v1/orders/filters');
};

// 订单模板和快速操作
export const getOrderTemplates = () => {
  return request.get<ApiResponse<any[]>>('/api/v1/orders/templates');
};

export const createOrderFromTemplate = (templateId: string, data: any) => {
  return request.post<ApiResponse<Order>>('/api/v1/orders/from-template', { templateId, ...data });
};

export const duplicateOrder = (orderId: string, updates?: Partial<OrderCreateParams>) => {
  return request.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/duplicate`, updates);
};

// 通知管理
export const sendOrderNotification = (orderId: string, notification: { type: string; message: string; channels?: string[] }) => {
  return request.post<ApiResponse<any>>(`/api/v1/orders/${orderId}/notify`, notification);
};

export const getNotificationHistory = (orderId: string) => {
  return request.get<ApiResponse<any[]>>(`/api/v1/orders/${orderId}/notifications`);
};

// 争议处理
export const createDispute = (orderId: string, disputeData: { reason: string; description: string; amount?: number }) => {
  return request.post<ApiResponse<any>>(`/api/v1/orders/${orderId}/dispute`, disputeData);
};

export const getDisputes = (orderId?: string) => {
  return request.get<ApiResponse<any[]>>(orderId ? `/api/v1/orders/${orderId}/disputes` : '/api/v1/disputes');
};

export const resolveDispute = (disputeId: string, resolution: any) => {
  return request.post<ApiResponse<any>>(`/api/v1/disputes/${disputeId}/resolve`, resolution);
};

// 统一导出API对象
export const orderApi = {
  // 基础管理
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  cancelOrder,

  // 状态管理
  updateOrderStatus,
  confirmOrder,
  startOrder,
  completeOrder,

  // 支付管理
  getOrderPayment,
  createPayment,
  updatePaymentStatus,
  markAsPaid,

  // 退款管理
  processRefund,
  getRefundHistory,
  updateRefundStatus,

  // 文件管理
  uploadDocument,
  getDocuments,
  deleteDocument,

  // 车辆分配
  assignVehicle,
  unassignVehicle,

  // 取车还车
  schedulePickup,
  recordPickup,
  scheduleReturn,
  recordReturn,

  // 备注和时间线
  addNote,
  getNotes,
  getOrderTimeline,
  addTimelineEntry,

  // 统计报告
  getOrderStats,
  getRevenueReport,
  getOccupancyReport,

  // 导出和批量操作
  exportOrders,
  exportOrder,
  batchUpdateStatus,
  batchCancel,
  batchDelete,
  sendBatchNotifications,

  // 搜索和筛选
  searchOrders,
  getAdvancedFilters,

  // 模板和快速操作
  getOrderTemplates,
  createOrderFromTemplate,
  duplicateOrder,

  // 通知和争议
  sendOrderNotification,
  getNotificationHistory,
  createDispute,
  getDisputes,
  resolveDispute
};