import http from '@/utils/request';

export const helpApi = {
  /**
   * 获取帮助分类列表
   * @param {boolean} includeInactive - 是否包含未启用的分类
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories(includeInactive = false) {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    return http.get('/help/categories', params);
  },

  /**
   * 获取分类及统计信息
   * @returns {Promise<Array>} 分类列表（包含统计信息）
   */
  async getCategoriesWithStats() {
    return http.get('/help/categories/stats');
  },

  /**
   * 获取文章列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {number} params.categoryId - 分类ID
   * @param {string} params.keyword - 搜索关键词
   * @param {boolean} params.isTop - 是否置顶
   * @param {number} params.authorId - 作者ID
   * @returns {Promise<Object>} 文章列表
   */
  async getArticles(params = {}) {
    return http.get('/help/articles', params);
  },

  /**
   * 搜索帮助文章
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {number} params.categoryId - 分类ID
   * @returns {Promise<Object>} 搜索结果
   */
  async searchArticles(params) {
    return http.get('/help/search', params);
  },

  /**
   * 获取文章详情
   * @param {number} articleId - 文章ID
   * @param {boolean} incrementView - 是否增加浏览量
   * @returns {Promise<Object>} 文章详情
   */
  async getArticleDetail(articleId, incrementView = true) {
    const params = incrementView ? {} : { incrementView: 'false' };
    return http.get(`/help/articles/${articleId}`, params);
  },

  /**
   * 获取热门文章
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>} 热门文章列表
   */
  async getPopularArticles(limit = 10) {
    return http.get('/help/articles/popular', { limit });
  },

  /**
   * 获取推荐文章
   * @param {number} articleId - 当前文章ID
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>} 推荐文章列表
   */
  async getRecommendedArticles(articleId, limit = 5) {
    return http.get(`/help/articles/${articleId}/recommended`, { limit });
  },

  /**
   * 提交用户反馈
   * @param {Object} data - 反馈数据
   * @param {number} data.articleId - 相关文章ID（可选）
   * @param {string} data.type - 反馈类型
   * @param {string} data.content - 反馈内容
   * @param {string} data.contactInfo - 联系方式（可选）
   * @returns {Promise<Object>} 提交结果
   */
  async submitFeedback(data) {
    return http.post('/help/feedback', data);
  },

  /**
   * 获取标签列表
   * @returns {Promise<Array>} 标签列表
   */
  async getTags() {
    return http.get('/help/tags');
  },

  /**
   * 获取帮助统计
   * @returns {Promise<Object>} 统计信息
   */
  async getHelpStats() {
    return http.get('/help/stats');
  }
};