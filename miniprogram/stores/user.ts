/**
 * 用户状态管理
 */

// @ts-ignore
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login, getUserProfile, wechatLogin, type LoginParams } from '@/api/auth';
import { logger } from '@/utils/logger';
import type { UserInfo, UserRole } from '@/types/user';

export const useUserStore = defineStore('user', () => {
    // 状态
    const token = ref('');
    const refreshToken = ref('');
    const userInfo = ref<UserInfo | null>(null);
    const userRoles = ref<UserRole[]>([]);  // 改为角色数组

    // 计算属性
    const isLoggedIn = computed(() => !!token.value);
    const isPlusMember = computed(() => userRoles.value.some(role => role.code === 'plus'));

    // 检查用户是否拥有指定角色
    const hasRole = (roleCode: string) => {
        return userRoles.value.some(role => role.code === roleCode);
    };

    // 初始化:从本地存储恢复
    const parseStoredUserInfo = (stored: unknown): UserInfo | null => {
        if (!stored) return null;
        if (typeof stored === 'string') {
            try {
                return JSON.parse(stored) as UserInfo;
            } catch (error) {
                logger.warn('解析 userInfo 失败，已清理异常缓存', error);
                uni.removeStorageSync('userInfo');
                return null;
            }
        }
        return stored as UserInfo;
    };

    const init = () => {
        token.value = uni.getStorageSync('token') || '';
        refreshToken.value = uni.getStorageSync('refreshToken') || '';
        userInfo.value = parseStoredUserInfo(uni.getStorageSync('userInfo'));

        // 恢复角色列表
        const storedRoles = uni.getStorageSync('userRoles');
        if (storedRoles) {
            try {
                userRoles.value = typeof storedRoles === 'string' ? JSON.parse(storedRoles) : storedRoles;
            } catch (error) {
                logger.warn('解析 userRoles 失败', error);
                userRoles.value = [];
            }
        }
    };

    // 登录
    const doLogin = async (phone: string, password: string) => {
        try {
            const loginParams: LoginParams = { phone, password };
            const res = await login(loginParams);
            token.value = res.token;
            refreshToken.value = res.refreshToken || '';
            userInfo.value = res.userInfo;
            userRoles.value = res.userInfo.roles || [];  // 更新角色列表

            // 保存到本地存储
            uni.setStorageSync('token', res.token);
            uni.setStorageSync('refreshToken', res.refreshToken || '');
            uni.setStorageSync('userInfo', JSON.stringify(res.userInfo));
            uni.setStorageSync('userRoles', JSON.stringify(res.userInfo.roles || []));

            return true;
        } catch (error) {
            logger.error('登录失败', error);
            return false;
        }
    };

    // 微信登录
    const doWechatLogin = async (code: string, userInfoData?: Partial<UserInfo>) => {
        try {
            const res = await wechatLogin({ code });
            token.value = res.token;
            refreshToken.value = res.refreshToken || '';
            userInfo.value = res.userInfo;
            userRoles.value = res.userInfo.roles || [];  // 更新角色列表

            uni.setStorageSync('token', res.token);
            uni.setStorageSync('refreshToken', res.refreshToken || '');
            uni.setStorageSync('userInfo', JSON.stringify(res.userInfo));
            uni.setStorageSync('userRoles', JSON.stringify(res.userInfo.roles || []));

            return true;
        } catch (error) {
            logger.error('微信登录失败', error);
            return false;
        }
    };

    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const res = await getUserProfile();
            userInfo.value = res;
            userRoles.value = res.roles || [];  // 更新角色列表
            uni.setStorageSync('userInfo', JSON.stringify(res));
            uni.setStorageSync('userRoles', JSON.stringify(res.roles || []));
            return true;
        } catch (error) {
            logger.error('获取用户信息失败', error);
            return false;
        }
    };

    // 退出登录
    const logout = () => {
        token.value = '';
        refreshToken.value = '';
        userInfo.value = null;
        userRoles.value = [];

        uni.removeStorageSync('token');
        uni.removeStorageSync('refreshToken');
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('userRoles');
    };

    // 更新用户信息
    const updateUserInfo = (data: Partial<UserInfo>) => {
        if (userInfo.value) {
            userInfo.value = { ...userInfo.value, ...data };
            uni.setStorageSync('userInfo', JSON.stringify(userInfo.value));
        }
    };

    return {
        // 状态
        token,
        refreshToken,
        userInfo,
        userRoles,
        // 计算属性
        isLoggedIn,
        isPlusMember,
        hasRole,
        // 方法
        init,
        doLogin,
        doWechatLogin,
        fetchUserInfo,
        logout,
        updateUserInfo
    };
});
