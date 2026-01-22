/**
 * 认证相关API接口
 */

import { get, post, put } from '@/utils/request'
import { logger } from '@/utils/logger'
import type { ApiResponse } from '@/types/common'
import type { LoginResponse, UserInfo } from '@/types/user'

// 类型定义
export interface RegisterParams extends Record<string, unknown> {
	phone: string
	code: string
	password?: string
	nickname?: string
	avatar?: string
	inviteCode?: string
}

export interface LoginParams extends Record<string, unknown> {
	phone: string
	password: string
}

export interface WechatLoginParams extends Record<string, unknown> {
	code: string
	phoneCode?: string // 手机号授权code（基础库2.21.2+）
	encryptedData?: string // 已废弃，保留用于兼容旧版本
	iv?: string // 已废弃，保留用于兼容旧版本
}

export interface AlipayLoginParams extends Record<string, unknown> {
	code: string
	authCode?: string
}

export interface DouyinLoginParams extends Record<string, unknown> {
	code: string
	anonymousCode?: string
}

export interface UsernameLoginParams extends Record<string, unknown> {
	username: string
	password: string
}

export interface BindPhoneParams extends Record<string, unknown> {
	phone: string
	code: string
}

// 平台类型
export type PlatformType = 'weixin' | 'alipay' | 'douyin' | 'h5'

// 登录方式类型
export type LoginMethodType = 'oneclick' | 'phone' | 'password' | 'username'

// Mock 数据 - 普通用户
const mockUser: UserInfo = {
	id: 'user_001',
	phone: '13800138000',
	nickname: '叨叨用户',
	avatar: '/static/default-avatar.png',
	gender: 1,
	userType: 'NORMAL',
	tags: [],  // 普通用户无标签
	status: 'ACTIVE'
}

// Mock 数据 - PLUS会员用户
const mockPlusUser: UserInfo = {
	id: 'user_002',
	phone: '13900139000',
	nickname: 'PLUS会员用户',
	avatar: '/static/default-avatar.png',
	gender: 1,
	userType: 'PLUS',
	tags: ['PLUS会员', '活跃用户'],  // PLUS会员标签
	status: 'ACTIVE'
}

const mockToken = 'mock_jwt_token_' + Date.now()
const mockRefreshToken = 'mock_refresh_token_' + Date.now()

/**
 * 处理登录响应并保存凭证到本地存储
 * @param responseData API 响应数据
 * @returns 标准化的 LoginResponse
 */
function handleLoginResponse(responseData: LoginResponse): LoginResponse {
	// 后端返回的是 user 字段，需要映射为 userInfo
	const result: LoginResponse = {
		...responseData,
		userInfo: (responseData as unknown as { user?: UserInfo }).user || responseData.userInfo
	}

	// 保存token到本地存储
	if (result.token) {
		uni.setStorageSync('token', result.token)
		uni.setStorageSync('refreshToken', result.refreshToken)
		uni.setStorageSync('userInfo', JSON.stringify(result.userInfo))
	}

	return result
}

/**
 * 发送验证码
 */
export function sendCode(phone: string, type: 'login' | 'register' | 'bind' = 'login') {
	logger.debug('发送验证码', { phone, type })
	return post('/v1/auth/send-code', { phone, type })
}

/**
 * 用户注册
 */
export function register(data: RegisterParams): Promise<LoginResponse> {
	logger.debug('用户注册', data)
	return post<LoginResponse>('/v1/auth/register', data).then((response) => handleLoginResponse(response.data))
}

/**
 * 密码登录
 */
export function login(params: LoginParams): Promise<LoginResponse> {
	logger.debug('密码登录', params)
	return post<LoginResponse>('/v1/auth/login', params).then((response) => handleLoginResponse(response.data))
}

/**
 * 验证码登录
 */
export function loginWithCode(phone: string, code: string): Promise<LoginResponse> {
	logger.debug('验证码登录', { phone, code })
	return post<LoginResponse>('/v1/auth/login-with-code', { phone, code }).then((response) => handleLoginResponse(response.data))
}

/**
 * 微信授权登录
 */
export function wechatLogin(params: WechatLoginParams): Promise<LoginResponse> {
	logger.debug('微信授权登录', params)
	return post<LoginResponse>('/v1/auth/wechat-login', params).then((response) => handleLoginResponse(response.data))
}

/**
 * 支付宝授权登录
 */
export function alipayLogin(params: AlipayLoginParams): Promise<LoginResponse> {
	logger.debug('支付宝授权登录', params)
	return post<LoginResponse>('/v1/auth/alipay-login', params).then((response) => handleLoginResponse(response.data))
}

/**
 * 抖音授权登录
 */
export function douyinLogin(params: DouyinLoginParams): Promise<LoginResponse> {
	logger.debug('抖音授权登录', params)
	return post<LoginResponse>('/v1/auth/douyin-login', params).then((response) => handleLoginResponse(response.data))
}

/**
 * 用户名密码登录
 */
export function loginWithUsername(params: UsernameLoginParams): Promise<LoginResponse> {
	logger.debug('用户名密码登录', params)
	return post<LoginResponse>('/v1/auth/username-login', params).then((response) => handleLoginResponse(response.data))
}

/**
 * 获取当前平台类型
 */
export function getPlatform(): PlatformType {
	// #ifdef MP-WEIXIN
	return 'weixin'
	// #endif
	// #ifdef MP-ALIPAY
	return 'alipay'
	// #endif
	// #ifdef MP-TOUTIAO
	return 'douyin'
	// #endif
	// #ifdef H5
	return 'h5'
	// #endif
	return 'h5' // 默认返回H5
}

/**
 * 检查平台是否支持一键登录
 */
export function supportOneClickLogin(): boolean {
	const platform = getPlatform()
	// 微信、支付宝、抖音小程序都支持一键登录
	return ['weixin', 'alipay', 'douyin'].includes(platform)
}

/**
 * 绑定手机号
 */
export function bindPhone(params: BindPhoneParams): Promise<{ success: boolean }> {
	logger.debug('绑定手机号', params)
	return post<{ success: boolean }>('/v1/auth/bind-phone', params).then((response) => {
		return response.data
	})
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
	logger.debug('刷新Token', { refreshToken })
	return post<{ token: string; refreshToken: string }>('/v1/auth/refresh-token', { refreshToken }).then((response) => {
		// 保存新的token到本地存储
		if (response.data?.token) {
			uni.setStorageSync('token', response.data.token)
			uni.setStorageSync('refreshToken', response.data.refreshToken)
		}
		return response.data
	})
}

/**
 * 获取用户信息
 */
export function getUserProfile(): Promise<UserInfo> {
	logger.debug('获取用户信息')
	return get<UserInfo>('/v1/users/profile').then((response) => {
		return response.data
	})
}

/**
 * 更新用户资料
 */
export function updateUserProfile(data: Partial<UserInfo>): Promise<UserInfo> {
	logger.debug('更新用户资料', data)
	return put<UserInfo>('/v1/users/profile', data).then((response) => {
		// 更新本地存储的用户信息
		try {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				// 安全解析 userInfo，防止 JSON.parse 失败或返回 null
				const parsedUserInfo = typeof userInfo === 'string'
					? JSON.parse(userInfo)
					: userInfo

				// 确保 parsedUserInfo 和 response.data 都是有效对象
				if (parsedUserInfo && typeof parsedUserInfo === 'object' && response.data) {
					const updatedUser = { ...parsedUserInfo, ...response.data }
					uni.setStorageSync('userInfo', JSON.stringify(updatedUser))
				}
			}
		} catch (error) {
			logger.error('更新本地用户信息失败', error)
		}
		return response.data
	})
}

/**
 * 退出登录
 */
export function logout(): Promise<{ success: boolean }> {
	logger.debug('退出登录')
	return post<{ success: boolean }>('/v1/auth/logout').then((response) => {
		// 清除本地存储的token
		uni.removeStorageSync('token')
		uni.removeStorageSync('refreshToken')
		uni.removeStorageSync('userInfo')
		return response.data
	})
}

/**
 * 检查登录状态
 */
export function checkLoginStatus(): Promise<{ isLoggedIn: boolean; user?: UserInfo }> {
	const token = uni.getStorageSync('token')
	const storedUser = uni.getStorageSync('userInfo')

	// 如果没有 token，直接返回未登录
	if (!token) {
		logger.debug('检查登录状态', { hasToken: false })
		return Promise.resolve({
			isLoggedIn: false
		})
	}

	// 解析本地用户信息
	let parsedUser = storedUser
	if (typeof storedUser === 'string') {
		try {
			parsedUser = JSON.parse(storedUser)
		} catch (error) {
			parsedUser = undefined
		}
	}

	logger.debug('检查登录状态', { hasToken: true, hasUserInfo: !!parsedUser })

	// 返回本地登录状态（后端联调时可以调用 /auth/check 接口验证 token）
	return Promise.resolve({
		isLoggedIn: true,
		user: parsedUser || undefined
	})
}
