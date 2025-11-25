import request from '@/utils/request';

export const paymentApi = {
  // 获取支付方式列表
  getPaymentMethods() {
    return request.get('/payments/methods');
  },

  // 创建支付订单
  createPayment(data) {
    return request.post('/payments', data);
  },

  // 查询支付状态
  getPaymentStatus(paymentNo) {
    return request.get(`/payments/${paymentNo}/status`);
  },

  // 取消支付
  cancelPayment(paymentNo) {
    return request.post(`/payments/${paymentNo}/cancel`);
  },

  // 申请退款
  requestRefund(paymentNo, data) {
    return request.post(`/payments/${paymentNo}/refund`, data);
  },

  // 获取用户支付记录
  getUserPayments(params = {}) {
    return request.get('/payments', params);
  },

  // 获取支付详情
  getPaymentDetail(paymentNo) {
    return request.get(`/payments/${paymentNo}`);
  },

  // 重试支付
  retryPayment(paymentNo) {
    return request.post(`/payments/${paymentNo}/retry`);
  },

  // 获取退款详情
  getRefundDetail(refundNo) {
    return request.get(`/refunds/${refundNo}`);
  },

  // 获取用户退款记录
  getUserRefunds(params = {}) {
    return request.get('/refunds', params);
  },

  // 获取用户余额
  getUserBalance() {
    return request.get('/balance');
  },

  // 充值到余额
  rechargeBalance(data) {
    return request.post('/balance/recharge', data);
  },

  // 获取余额变动记录
  getBalanceTransactions(params = {}) {
    return request.get('/balance/transactions', params);
  },

  // 获取充值订单列表
  getRechargeOrders(params = {}) {
    return request.get('/recharge/orders', params);
  },

  // 创建充值订单
  createRechargeOrder(data) {
    return request.post('/recharge/orders', data);
  },

  // ��取支付统计信息
  getPaymentStats() {
    return request.get('/payments/stats');
  },

  // 验证支付订单
  validatePayment(data) {
    return request.post('/payments/validate', data);
  },

  // 支付预检查
  preCheckPayment(orderId, paymentMethod) {
    return request.post('/payments/pre-check', { orderId, paymentMethod });
  }
};