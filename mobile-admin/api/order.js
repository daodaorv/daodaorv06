import request from '../utils/request';

/**
 * 订单管理相关API - 移动管理端
 */
export const orderApi = {
  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.status - 订单状态筛选
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getOrderList(params) {
    return request.get('/orders', params);
  },

  /**
   * 获取订单详情
   * @param {number} orderId - 订单ID
   * @returns {Promise}
   */
  getOrderDetail(orderId) {
    return request.get(`/orders/${orderId}`);
  },

  /**
   * 更新订单状态
   * @param {number} orderId - 订单ID
   * @param {string} status - 新状态
   * @param {Object} data - 更新数据
   * @returns {Promise}
   */
  updateOrderStatus(orderId, status, data = {}) {
    return request.put(`/orders/${orderId}/status`, {
      status,
      ...data
    });
  },

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @param {string} reason - 取消原因
   * @returns {Promise}
   */
  cancelOrder(orderId, reason) {
    return request.post(`/orders/${orderId}/cancel`, {
      reason
    });
  },

  /**
   * 获取订单统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getOrderStats(params = {}) {
    return request.get('/orders/stats', params);
  },

  /**
   * 获取收入统计
   * @param {Object} params - 统计参数
   * @param {string} params.type - 统计类型：daily/weekly/monthly
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getRevenueStats(params = {}) {
    return request.get('/orders/revenue-stats', params);
  }
};