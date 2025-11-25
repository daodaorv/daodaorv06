import http from '@/utils/request';

export const orderEnhancedApi = {
  /**
   * 获取增强的订单列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {number} params.userId - 用户ID
   * @param {number} params.statusId - 订单状态ID
   * @param {number} params.vehicleId - 车辆ID
   * @param {number} params.driverId - 司机ID
   * @param {number} params.storeId - 门店ID
   * @param {string} params.priority - 订单优先级
   * @param {string} params.sourceChannel - 订单来源渠道
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @param {string} params.keyword - 关键词搜索
   * @returns {Promise<Object>} 订单列表
   */
  async getOrders(params = {}) {
    return http.get('/orders/enhanced', params);
  },

  /**
   * 获取订单完整详情
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情
   */
  async getOrderDetail(orderId) {
    return http.get(`/orders/enhanced/${orderId}`);
  },

  /**
   * 更新订单状态
   * @param {number} orderId - 订单ID
   * @param {Object} data - 更新数据
   * @param {number} data.statusId - 新状态ID
   * @param {string} data.notes - 备注
   * @param {Array<string>} data.images - 相关图片
   * @param {Object} data.location - 地理位置
   * @returns {Promise<Object>} 更新结果
   */
  async updateOrderStatus(orderId, data) {
    return http.patch(`/orders/enhanced/${orderId}/status`, data);
  },

  /**
   * 设置订单提醒
   * @param {number} orderId - 订单ID
   * @param {Object} data - 提醒配置
   * @param {string} data.reminderType - 提醒类型
   * @param {string} data.reminderTime - 提醒时间
   * @param {string} data.message - 提醒消息
   * @param {Array<string>} data.channels - 提醒渠道
   * @returns {Promise<Object>} 设置结果
   */
  async setOrderReminder(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/reminder`, data);
  },

  /**
   * 申请退款
   * @param {number} orderId - 订单ID
   * @param {Object} data - 退款数据
   * @param {string} data.refundType - 退款类型 ('full' | 'partial')
   * @param {number} data.refundAmount - 退款金额
   * @param {string} data.refundReason - 退款原因
   * @param {string} data.detailedReason - 详细原因（可选）
   * @param {Array<string>} data.evidenceImages - 证据图片（可选）
   * @returns {Promise<Object>} 退款申请结果
   */
  async requestRefund(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/refund`, data);
  },

  /**
   * 上传订单文件
   * @param {number} orderId - 订单ID
   * @param {Object} data - 文件数据
   * @param {string} data.fileType - 文件类型
   * @param {string} data.fileName - 文件名称
   * @param {string} data.fileUrl - 文件URL
   * @param {number} data.fileSize - 文件大小（可选）
   * @param {string} data.fileFormat - 文件格式（可选）
   * @param {string} data.description - 文件描述（可选）
   * @param {string} data.uploaderType - 上传者类型（可选）
   * @returns {Promise<Object>} 上传结果
   */
  async uploadOrderFile(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/files`, data);
  },

  /**
   * 获取订单统计信息
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期（可选）
   * @param {string} params.endDate - 结束日期（可选）
   * @returns {Promise<Object>} 统计信息
   */
  async getOrderStats(params = {}) {
    return http.get('/orders/enhanced/stats', params);
  },

  /**
   * 获取��单时间线
   * @param {number} orderId - 订单ID
   * @returns {Promise<Array>} 时间线记录
   */
  async getOrderTimeline(orderId) {
    return http.get(`/orders/enhanced/${orderId}/timeline`);
  },

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @param {Object} data - 取消数据
   * @param {string} data.cancellationReason - 取消原因
   * @returns {Promise<Object>} 取消结果
   */
  async cancelOrder(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/cancel`, data);
  },

  /**
   * 确认还车
   * @param {number} orderId - 订单ID
   * @param {Object} data - 还车数据
   * @param {number} data.fuelLevel - 油量
   * @param {string} data.damageStatus - 车况
   * @param {number} data.totalDistance - 总里程
   * @param {string} data.notes - 备注
   * @param {Array<string>} data.images - 还车照片
   * @param {Object} data.location - 地理位置
   * @returns {Promise<Object>} 还车确认结果
   */
  async confirmReturn(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/return`, data);
  },

  /**
   * 获取订单提醒列表
   * @param {number} orderId - 订单ID
   * @returns {Promise<Array>} 提醒列表
   */
  async getOrderReminders(orderId) {
    return http.get(`/orders/enhanced/${orderId}/reminders`);
  },

  /**
   * 获取订单文件列表
   * @param {number} orderId - 订单ID
   * @returns {Promise<Array>} 文件列表
   */
  async getOrderFiles(orderId) {
    return http.get(`/orders/enhanced/${orderId}/files`);
  },

  /**
   * 获取订单异常记录
   * @param {number} orderId - 订单ID
   * @returns {Promise<Array>} 异常记录
   */
  async getOrderExceptions(orderId) {
    return http.get(`/orders/enhanced/${orderId}/exceptions`);
  },

  /**
   * 上报订单异常
   * @param {number} orderId - 订单ID
   * @param {Object} data - 异常数据
   * @param {string} data.exceptionType - 异常类型
   * @param {string} data.severity - 严重程度
   * @param {string} data.description - 异常描述
   * @param {Array<string>} data.evidenceFiles - 证据文件
   * @param {string} data.notes - 备注
   * @returns {Promise<Object>} 上报结果
   */
  async reportOrderException(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/exceptions`, data);
  },

  /**
   * 修改订单信息
   * @param {number} orderId - 订单ID
   * @param {Object} data - 修改数据
   * @param {string} data.pickupContactName - 取车联系人姓名（可选）
   * @param {string} data.pickupContactPhone - 取车联系人电话（可选）
   * @param {string} data.returnContactName - 还车联系人姓名（可选）
   * @param {string} data.returnContactPhone - 还车联系人电话（可选）
   * @param {string} data.specialRequirements - 特殊要求（可选）
   * @param {string} data.emergencyContact - 紧急联系人（可选）
   * @param {string} data.emergencyPhone - 紧急联系电话（可选）
   * @returns {Promise<Object>} 修改结果
   */
  async updateOrderInfo(orderId, data) {
    return http.patch(`/orders/enhanced/${orderId}/info`, data);
  },

  /**
   * 分配司机
   * @param {number} orderId - 订单ID
   * @param {Object} data - 司机信息
   * @param {number} data.driverId - 司机ID
   * @param {string} data.driverName - 司机姓名
   * @param {string} data.notes - 备注（可选）
   * @returns {Promise<Object>} 分配结果
   */
  async assignDriver(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/assign-driver`, data);
  },

  /**
   * 获取退款申请详情
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 退款申请详情
   */
  async getRefundRequest(orderId) {
    return http.get(`/orders/enhanced/${orderId}/refund-request`);
  },

  /**
   * 取消退款申请
   * @param {number} orderId - 订单ID
   * @param {Object} data - 取消数据
   * @param {string} data.reason - 取消原因
   * @returns {Promise<Object>} 取消结果
   */
  async cancelRefundRequest(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/cancel-refund`, data);
  },

  /**
   * 延长订单
   * @param {number} orderId - 订单ID
   * @param {Object} data - 延长数据
   * @param {Date} data.newReturnTime - 新的还车时间
   * @param {string} data.reason - 延长原因
   * @param {number} data.additionalFee - 额外费用
   * @returns {Promise<Object>} 延长结果
   */
  async extendOrder(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/extend`, data);
  },

  /**
   * 评价订单
   * @param {number} orderId - 订单ID
   * @param {Object} data - 评价数据
   * @param {number} data.vehicleRating - 车辆评分（1-5）
   * @param {number} data.serviceRating - 服务评分（1-5）
   * @param {number} data.overallRating - 总体评分（1-5）
   * @param {string} data.content - 评价内容
   * @param {Array<string>} data.images - 评价图片（可选）
   * @returns {Promise<Object>} 评价结果
   */
  async rateOrder(orderId, data) {
    return http.post(`/orders/enhanced/${orderId}/rate`, data);
  }
};