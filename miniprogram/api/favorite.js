import http from '@/utils/request';

export const favoriteApi = {
  /**
   * 添加收藏
   * @param {Object} data - 收藏数据
   * @param {string} data.targetType - 收藏目标类型 ('vehicle' | 'article' | 'store')
   * @param {number} data.targetId - 收藏目标ID
   * @param {string} data.targetTitle - 收藏目标标题
   * @param {string} data.targetImage - 收藏目标图片（可选）
   * @param {number} data.targetPrice - 收藏目标价格（可选）
   * @param {Object} data.targetData - 收藏目标其他数据（可选）
   * @param {string} data.folderName - 收藏夹名称（可选）
   * @param {Array<string>} data.tags - 收藏标签列表（可选）
   * @param {string} data.note - 收藏备注（可选）
   * @returns {Promise<Object>} 收藏结果
   */
  async addFavorite(data) {
    return http.post('/favorites', data);
  },

  /**
   * 取消收藏
   * @param {string} targetType - 收藏目标类型
   * @param {number} targetId - 收藏目标ID
   * @returns {Promise<Object>} 取消结果
   */
  async removeFavorite(targetType, targetId) {
    return http.delete(`/favorites/${targetType}/${targetId}`);
  },

  /**
   * 获取用户收藏列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.targetType - 收藏目标类型筛选
   * @param {string} params.folderName - 收藏夹名称筛选
   * @param {string} params.tags - 标签筛选，逗号分隔
   * @param {string} params.keyword - 关键词搜索
   * @returns {Promise<Object>} 收藏列表
   */
  async getUserFavorites(params = {}) {
    return http.get('/favorites', params);
  },

  /**
   * 获取收藏详情
   * @param {number} favoriteId - 收藏ID
   * @returns {Promise<Object>} 收藏详情
   */
  async getFavoriteDetail(favoriteId) {
    return http.get(`/favorites/${favoriteId}`);
  },

  /**
   * 更新收藏信息
   * @param {number} favoriteId - 收藏ID
   * @param {Object} data - 更新数据
   * @param {string} data.folderName - 收藏夹名称（可选）
   * @param {Array<string>} data.tags - 收藏标签列表（可选）
   * @param {string} data.note - 收藏备注（可选）
   * @returns {Promise<Object>} 更新结果
   */
  async updateFavorite(favoriteId, data) {
    return http.patch(`/favorites/${favoriteId}`, data);
  },

  /**
   * 获取用户收藏夹列表
   * @returns {Promise<Array>} 收藏夹列表
   */
  async getUserFolders() {
    return http.get('/favorites/folders/list');
  },

  /**
   * 创建收藏夹
   * @param {Object} data - 收藏夹数据
   * @param {string} data.name - 收藏夹名称
   * @param {string} data.description - 收藏夹描述（可选）
   * @param {string} data.icon - 图标名称（可选）
   * @param {string} data.color - 颜色（可选）
   * @param {boolean} data.isPrivate - 是否私有（可选）
   * @returns {Promise<Object>} 创建结果
   */
  async createFolder(data) {
    return http.post('/favorites/folders', data);
  },

  /**
   * 检查是否已收藏
   * @param {string} targetType - 收藏目标类型
   * @param {number} targetId - 收藏目标ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkFavorited(targetType, targetId) {
    return http.get(`/favorites/check/${targetType}/${targetId}`);
  },

  /**
   * 获取收藏统计
   * @param {string} targetType - 收藏目标类型
   * @param {number} targetId - 收藏目标ID
   * @returns {Promise<Object>} 统计信息
   */
  async getFavoriteStats(targetType, targetId) {
    return http.get(`/favorites/stats/${targetType}/${targetId}`);
  },

  /**
   * 获取用户收藏统计
   * @returns {Promise<Object>} 用户收藏统计
   */
  async getUserFavoriteStats() {
    return http.get('/favorites/user/stats');
  }
};