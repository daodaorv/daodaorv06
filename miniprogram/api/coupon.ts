/**
 * 优惠券相关API接口
 */

import { get, post } from '@/utils/request';

/**
 * 获取可用优惠券
 */
export function getAvailableCoupons(params: {
    orderAmount: number;
    vehicleId?: string;
    category?: string;
}) {
    return get('/coupons/available', params);
}

/**
 * 领取优惠券
 */
export function claimCoupon(couponId: string) {
    return post(`/coupons/${couponId}/claim`);
}

/**
 * 获取我的优惠券
 */
export function getMyCoupons(params?: {
    status?: string;
    page?: number;
    limit?: number;
}) {
    return get('/coupons/my', params);
}
