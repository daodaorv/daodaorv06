import http from '@/utils/request';

export const ratingApi = {
  /**
   * 创建评价
   * @param {Object} data - 评价数据
   * @param {number} data.orderId - 订单ID
   * @param {number} data.vehicleId - 车辆ID
   * @param {number} data.ownerId - 车主ID
   * @param {number} data.overallRating - 总体评分 (1.0-5.0)
   * @param {number} data.vehicleRating - 车辆评分 (1.0-5.0)
   * @param {number} data.serviceRating - 服务评分 (1.0-5.0)
   * @param {number} data.cleanlinessRating - 卫生评分 (1.0-5.0)
   * @param {number} data.accuracyRating - 描述准确性评分 (1.0-5.0)
   * @param {string} data.content - 评价内容
   * @param {Array<string>} data.images - 评价图片列表
   * @param {Array<string>} data.tags - 评价标签列表
   * @returns {Promise<Object>} 创建结果
   */
  async createRating(data) {
    return http.post('/ratings', data);
  },

  /**
   * 获取评价列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {number} params.vehicleId - 车辆ID
   * @param {number} params.userId - 用户ID
   * @param {string} params.status - 状态筛选
   * @param {number} params.minRating - 最低评分
   * @param {number} params.maxRating - 最高评分
   * @param {boolean} params.hasImages - 是否有图片
   * @param {string} params.tags - 标签筛选，逗号分隔
   * @returns {Promise<Object>} 评价列表
   */
  async getRatings(params = {}) {
    return http.get('/ratings', params);
  },

  /**
   * 获取评价详情
   * @param {number} ratingId - 评价ID
   * @returns {Promise<Object>} 评价详情
   */
  async getRatingDetail(ratingId) {
    return http.get(`/ratings/${ratingId}`);
  },

  /**
   * 回复评价
   * @param {number} ratingId - 评价ID
   * @param {Object} data - 回复数据
   * @param {string} data.content - 回复内容
   * @param {number} data.parentId - 父回复ID（可选）
   * @param {number} data.toUserId - 回复目标用户ID（可选）
   * @returns {Promise<Object>} 回复结果
   */
  async replyRating(ratingId, data) {
    return http.post(`/ratings/${ratingId}/replies`, data);
  },

  /**
   * 点赞评价
   * @param {number} ratingId - 评价ID
   * @param {Object} options - 点赞选项
   * @param {string} options.targetType - 目标类型 ('rating' | 'reply')
   * @param {number} options.targetId - 目标ID（回复ID时使用）
   * @returns {Promise<Object>} 点赞结果
   */
  async likeRating(ratingId, options = {}) {
    return http.post(`/ratings/${ratingId}/like`, options);
  },

  /**
   * 获取用户对评价的点赞状态
   * @param {number} ratingId - 评价ID
   * @returns {Promise<Object>} 点赞状态
   */
  async getUserLikeStatus(ratingId) {
    return http.get(`/ratings/${ratingId}/like-status`);
  },

  /**
   * 获取车辆评分统计
   * @param {number} vehicleId - 车辆ID
   * @returns {Promise<Object>} 评分统计
   */
  async getVehicleRatingStats(vehicleId) {
    return http.get(`/ratings/vehicle/${vehicleId}/stats`);
  },

  /**
   * 获取可用的评价标签
   * @param {string} category - 标签分类 ('vehicle' | 'service' | 'general')
   * @returns {Promise<Array>} 标签列表
   */
  async getRatingTags(category) {
    const params = category ? { category } : {};
    return http.get('/ratings/tags', params);
  },

  /**
   * 隐藏评价
   * @param {number} ratingId - 评价ID
   * @returns {Promise<Object>} 隐藏结果
   */
  async hideRating(ratingId) {
    return http.patch(`/ratings/${ratingId}/hide`);
  },

  /**
   * 获取用户评价统计
   * @returns {Promise<Object>} 评价统计
   */
  async getUserRatingStats() {
    return http.get('/ratings/user/stats');
  }
};