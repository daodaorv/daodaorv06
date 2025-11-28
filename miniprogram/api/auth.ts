/**
 * 认证相关API接口
 */

import { get, post } from '@/utils/request';

/**
 * 发送验证码
 */
export function sendCode(phone: string, type: string = 'login') {
    return post('/auth/send-code', { phone, type });
}

/**
 * 用户注册
 */
export function register(data: {
    phone: string;
    code: string;
    password?: string;
    userInfo?: any;
}) {
    return post('/auth/register', data);
}

/**
 * 用户登录
 */
export function login(phone: string, password: string) {
    return post('/auth/login', { phone, password });
}

/**
 * 微信授权登录
 */
export function wechatLogin(code: string, userInfo?: any) {
    return post('/auth/wechat-login', { code, userInfo });
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken: string) {
    return post('/auth/refresh-token', { refreshToken });
}

/**
 * 获取用户信息
 */
export function getUserProfile() {
    return get('/users/profile');
}

/**
 * 更新用户资料
 */
export function updateUserProfile(data: any) {
    return post('/users/profile', data);
}
