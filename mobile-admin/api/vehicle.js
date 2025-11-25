import request from '../utils/request';

/**
 * 车辆管理相关API - 移动管理端
 */
export const vehicleApi = {
  /**
   * 获取车辆列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.keyword - 搜索关键词（车牌号/品牌/型号）
   * @param {string} params.status - 车辆状态筛选
   * @param {string} params.store_id - 门店ID筛选
   * @returns {Promise}
   */
  getVehicleList(params) {
    return request.get('/vehicles', params);
  },

  /**
   * 获取车辆详情
   * @param {number} vehicleId - 车辆ID
   * @returns {Promise}
   */
  getVehicleDetail(vehicleId) {
    return request.get(`/vehicles/${vehicleId}`);
  },

  /**
   * 创建车辆
   * @param {Object} data - 车辆数据
   * @returns {Promise}
   */
  createVehicle(data) {
    return request.post('/vehicles', data);
  },

  /**
   * 更新车辆信息
   * @param {number} vehicleId - 车辆ID
   * @param {Object} data - 更新数据
   * @returns {Promise}
   */
  updateVehicle(vehicleId, data) {
    return request.put(`/vehicles/${vehicleId}`, data);
  },

  /**
   * 更新车辆状态
   * @param {number} vehicleId - 车辆ID
   * @param {string} status - 状态（available/rented/maintenance/disabled）
   * @param {string} reason - 状态变更原因
   * @returns {Promise}
   */
  updateVehicleStatus(vehicleId, status, reason) {
    return request.put(`/vehicles/${vehicleId}/status`, {
      status,
      reason
    });
  },

  /**
   * 删除车辆
   * @param {number} vehicleId - 车辆ID
   * @returns {Promise}
   */
  deleteVehicle(vehicleId) {
    return request.delete(`/vehicles/${vehicleId}`);
  },

  /**
   * 获取车辆统计信息
   * @param {Object} params - 统计参数
   * @param {string} params.store_id - 门店ID
   * @returns {Promise}
   */
  getVehicleStats(params = {}) {
    return request.get('/vehicles/stats', params);
  },

  /**
   * 车辆检查（上下线检查）
   * @param {number} vehicleId - 车辆ID
   * @param {Object} data - 检查数据
   * @returns {Promise}
   */
  vehicleCheck(vehicleId, data) {
    return request.post(`/vehicles/${vehicleId}/check`, data);
  },

  /**
   * 上传车辆图片
   * @param {number} vehicleId - 车辆ID
   * @param {FormData} formData - 图片数据
   * @returns {Promise}
   */
  uploadVehicleImages(vehicleId, formData) {
    return request.post(`/vehicles/${vehicleId}/images`, formData, {
      'Content-Type': 'multipart/form-data'
    });
  }
};