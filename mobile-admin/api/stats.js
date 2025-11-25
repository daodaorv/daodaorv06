import request from '../utils/request';

/**
 * 统计数据相关API - 移动管理端
 */
export const statsApi = {
  /**
   * 获取首页统计数据
   * @returns {Promise}
   */
  getDashboardStats() {
    return request.get('/stats/dashboard');
  },

  /**
   * 获取用户统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getUserStats(params = {}) {
    return request.get('/stats/users', params);
  },

  /**
   * 获取订单统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.type - 统计类型：daily/weekly/monthly
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getOrderStats(params = {}) {
    return request.get('/stats/orders', params);
  },

  /**
   * 获取收入统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.type - 统计类型：daily/weekly/monthly
   * @param {string} params.start_date - 开始日期
   * @param {string} params.end_date - 结束日期
   * @returns {Promise}
   */
  getRevenueStats(params = {}) {
    return request.get('/stats/revenue', params);
  },

  /**
   * 获取车辆统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.store_id - 门店ID
   * @returns {Promise}
   */
  getVehicleStats(params = {}) {
    return request.get('/stats/vehicles', params);
  },

  /**
   * 获取系统概览统计
   * @returns {Promise}
   */
  getSystemOverview() {
    return request.get('/stats/system-overview');
  }
};