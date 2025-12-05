/**
 * 车辆相关API接口
 */

import { get, post } from '@/utils/request';

/**
 * 查询可用房车
 */
export function getVehicles(params: {
    pickupCity: string;
    pickupStoreId: string;
    pickupDate: string;
    returnDate: string;
    returnCity?: string;
    returnStoreId?: string;
    page?: number;
    limit?: number;
}) {
    return get('/vehicles', params);
}

/**
 * 获取房车详情
 */
export function getVehicleDetail(id: string) {
    return get(`/vehicles/${id}`);
}

/**
 * 收藏房车
 */
export function favoriteVehicle(id: string) {
    return post(`/vehicles/${id}/favorite`);
}

/**
 * 获取收藏列表
 */
export function getFavoriteVehicles(params?: { page?: number; limit?: number }) {
    return get('/vehicles/favorites', params);
}
