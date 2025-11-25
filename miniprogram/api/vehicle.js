// 车辆相关API接口
import request from '@/utils/request';

export const vehicleApi = {
  // 获取车辆列表
  getVehicles(params = {}) {
    return request.get('/vehicles', {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      brandId: params.brandId,
      categoryId: params.categoryId,
      seats: params.seats,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      fuelType: params.fuelType,
      storeId: params.storeId,
      sortBy: params.sortBy || 'popular',
      pickupCity: params.pickupCity,
      features: params.features ? params.features.join(',') : undefined,
    });
  },

  // 获取车辆详情
  getVehicleById(id) {
    return request.get(`/vehicles/${id}`);
  },

  // 获取车辆图片列表
  getVehicleImages(id) {
    return request.get(`/vehicles/${id}/images`);
  },

  // 获取车辆品牌列表
  getVehicleBrands() {
    return request.get('/vehicles/brands/list');
  },

  // 获取车辆特性列表
  getVehicleFeatures() {
    return request.get('/vehicles/features/list');
  },

  // 收藏车辆
  favoriteVehicle(id) {
    return request.post(`/vehicles/${id}/favorite`);
  },

  // 取消收藏车辆
  unfavoriteVehicle(id) {
    return request.delete(`/vehicles/${id}/favorite`);
  },

  // 获取用户收藏的车辆列表
  getFavoriteVehicles(params = {}) {
    return request.get('/vehicles/favorites/list', {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    });
  },

  // 获取搜索建议
  getSearchSuggestions(keyword, limit = 5) {
    return request.get('/vehicles/search/suggestions', {
      keyword,
      limit,
    });
  },
};