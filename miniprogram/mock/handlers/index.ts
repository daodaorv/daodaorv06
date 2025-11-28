/**
 * Mock数据处理器
 * 根据请求URL和方法返回对应的Mock数据
 */

import { vehicleData } from '../data/vehicle';
import { authData } from '../data/auth';
import { orderData } from '../data/order';

interface RequestOptions {
    url: string;
    method?: string;
    data?: any;
}

/**
 * Mock请求处理
 */
export function mockRequest(options: RequestOptions): Promise<any> {
    return new Promise((resolve, reject) => {
        // 模拟网络延迟
        setTimeout(() => {
            const { url, method = 'GET', data } = options;

            try {
                // 路由匹配
                const result = routeMatch(url, method, data);
                resolve(result);
            } catch (error) {
                reject({
                    code: -1,
                    message: 'Mock数据处理失败',
                    data: null
                });
            }
        }, 300); // 300ms延迟模拟网络请求
    });
}

/**
 * 路由匹配
 */
function routeMatch(url: string, method: string, data: any) {
    // 认证相关
    if (url.includes('/auth/send-code')) {
        return authData.sendCode(data);
    }
    if (url.includes('/auth/register')) {
        return authData.register(data);
    }
    if (url.includes('/auth/login')) {
        return authData.login(data);
    }
    if (url.includes('/users/profile')) {
        return authData.getProfile();
    }

    // 车辆相关
    if (url.includes('/vehicles') && method === 'GET') {
        if (url.includes('/favorites')) {
            return vehicleData.getFavorites();
        }
        // 匹配 /vehicles/{id}
        const idMatch = url.match(/\/vehicles\/([^\/]+)$/);
        if (idMatch) {
            return vehicleData.getDetail(idMatch[1]);
        }
        return vehicleData.getList(data);
    }
    if (url.includes('/vehicles') && url.includes('/favorite') && method === 'POST') {
        return vehicleData.toggleFavorite(data);
    }

    // 订单相关
    if (url.includes('/orders/calculate-price')) {
        return orderData.calculatePrice(data);
    }
    if (url.includes('/orders') && method === 'POST') {
        return orderData.create(data);
    }
    if (url.includes('/orders') && method === 'GET') {
        const idMatch = url.match(/\/orders\/([^\/]+)$/);
        if (idMatch) {
            return orderData.getDetail(idMatch[1]);
        }
        return orderData.getList(data);
    }

    // 默认返回404
    return {
        code: 404,
        message: 'Mock接口未找到',
        data: null
    };
}
