import http from '@/utils/request';

export const couponApi = {
  /**
   * 获取可用优惠券列表
   * @param {Object} params - 查询参数
   * @param {number} params.orderAmount - 订单金额
   * @param {number} params.vehicleId - 车辆ID
   * @param {string} params.category - 车辆分类
   * @returns {Promise<Array>} 优惠券列表
   */
  async getAvailableCoupons(params = {}) {
    return http.get('/coupons/available', params);
  },

  /**
   * 获取用户优惠券列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.status - 状态筛选
   * @returns {Promise<Object>} 用户优惠券列表
   */
  async getUserCoupons(params = {}) {
    return http.get('/coupons/my', params);
  },

  /**
   * 领取优惠券
   * @param {number} couponId - 优惠券ID
   * @returns {Promise<Object>} 领取结果
   */
  async claimCoupon(couponId) {
    return http.post(`/coupons/${couponId}/claim`);
  },

  /**
   * 使用优惠券
   * @param {string} couponCode - 优惠券码
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 使用结果
   */
  async useCoupon(couponCode, orderId) {
    return http.post(`/coupons/${couponCode}/use`, { orderId });
  },

  /**
   * 验证优惠券
   * @param {Object} data - 验证数据
   * @param {string} data.couponCode - 优惠券码
   * @param {number} data.orderAmount - 订单金额
   * @param {number} data.vehicleId - 车辆ID（可选）
   * @returns {Promise<Object>} 验证结果
   */
  async validateCoupon(data) {
    return http.post('/coupons/validate', data);
  },

  /**
   * 获取优惠券详情
   * @param {number} couponId - 优惠券ID
   * @returns {Promise<Object>} 优惠券详情
   */
  async getCouponDetail(couponId) {
    return http.get(`/coupons/${couponId}`);
  },

  /**
   * 获取用户优惠券统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getCouponStats() {
    return http.get('/coupons/stats');
  }
};