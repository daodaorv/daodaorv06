import request from '@/utils/request';

export const orderApi = {
  // 创建订单
  createOrder(data) {
    return request.post('/orders', data);
  },

  // 获取用户订单列表
  getUserOrders(params = {}) {
    return request.get('/orders', params);
  },

  // 获取订单详情
  getOrderDetail(orderId) {
    return request.get(`/orders/${orderId}`);
  },

  // 取消订单
  cancelOrder(orderId, reason) {
    return request.post(`/orders/${orderId}/cancel`, { reason });
  },

  // 计算订单价格
  calculatePrice(data) {
    return request.post('/orders/calculate-price', data);
  },

  // 获取订单状态列表
  getOrderStatusList() {
    return request.get('/orders/status/list');
  },

  // 申请订单延期
  requestOrderExtension(orderId, data) {
    return request.post(`/orders/${orderId}/extend`, data);
  },

  // 获取订单状态变更日志
  getOrderStatusLogs(orderId, params = {}) {
    return request.get(`/orders/${orderId}/status-logs`, params);
  },

  // 获取订单费用明细
  getOrderFeeDetails(orderId) {
    return request.get(`/orders/${orderId}/fee-details`);
  },

  // 获取订单支付记录
  getOrderPayments(orderId) {
    return request.get(`/orders/${orderId}/payments`);
  },

  // 确认收货（订单完成）
  confirmOrder(orderId) {
    return request.post(`/orders/${orderId}/confirm`);
  },

  // 申请退款
  requestRefund(orderId, data) {
    return request.post(`/orders/${orderId}/refund`, data);
  },

  // 评价订单
  rateOrder(orderId, data) {
    return request.post(`/orders/${orderId}/rating`, data);
  },

  // 获取订单评价详情
  getOrderRating(orderId) {
    return request.get(`/orders/${orderId}/rating`);
  },

  // 删除订单（仅限已取消或已���成的订单）
  deleteOrder(orderId) {
    return request.delete(`/orders/${orderId}`);
  },

  // 重新下单（复制已完成的订单）
  reorder(orderId) {
    return request.post(`/orders/${orderId}/reorder`);
  },

  // 获取可用优惠券
  getAvailableCoupons(orderAmount) {
    return request.get('/coupons/available', { orderAmount });
  },

  // 验证订单可创建性
  validateOrder(data) {
    return request.post('/orders/validate', data);
  }
};