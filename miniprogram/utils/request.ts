/**
 * 统一请求封装
 * 支持Mock数据和真实API切换
 */

import { logger } from './logger'

// 是否使用Mock数据
// 前端独立开发阶段，使用Mock数据
// 联调阶段，切换到真实API
const USE_MOCK = false;

// API基础URL
// 开发环境：http://127.0.0.1:3001/api
// 生产环境：根据实际部署地址修改
const BASE_URL = USE_MOCK ? '' : 'http://127.0.0.1:3001/api';

// Mock数据处理器
import { mockRequest } from '@/mock/handlers/index';

// Token 刷新状态管理
let isRefreshing = false; // 是否正在刷新 token
let refreshSubscribers: Array<(token: string) => void> = []; // 等待 token 刷新的请求队列

/**
 * 添加请求到刷新队列
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
	refreshSubscribers.push(callback);
}

/**
 * 通知所有等待的请求
 */
function onTokenRefreshed(token: string): void {
	refreshSubscribers.forEach((callback) => callback(token));
	refreshSubscribers = [];
}

/**
 * 刷新 Token
 */
async function doRefreshToken(): Promise<string> {
	const refreshToken = uni.getStorageSync('refreshToken');
	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	try {
		// 调用刷新 token API
		const response = await uni.request({
			url: BASE_URL + '/auth/refresh-token',
			method: 'POST',
			data: { refreshToken },
			header: {
				'Content-Type': 'application/json'
			}
		});

		const result = response.data as any;
		if (result.code === 0 && result.data?.token) {
			const newToken = result.data.token;
			const newRefreshToken = result.data.refreshToken;

			// 保存新的 token
			uni.setStorageSync('token', newToken);
			if (newRefreshToken) {
				uni.setStorageSync('refreshToken', newRefreshToken);
			}

			logger.info('Token 刷新成功');
			return newToken;
		} else {
			throw new Error('Token refresh failed');
		}
	} catch (error) {
		logger.error('Token 刷新失败', error);
		throw error;
	}
}

// 定义请求数据类型
type RequestData = Record<string, unknown> | unknown[];

// 定义请求头类型
interface RequestHeader {
	[key: string]: string;
}

interface RequestOptions {
	url: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	data?: RequestData;
	header?: RequestHeader;
}

export interface ResponseData<T = unknown> {
	code: number;
	message: string;
	data: T;
}

// uni.request 的响应类型
interface UniRequestResponse {
	data: unknown;
	statusCode: number;
	header: Record<string, string>;
	cookies?: string[];
}

/**
 * 统一请求方法（内部实现）
 */
function doRequest<T = unknown>(options: RequestOptions, retryCount = 0): Promise<ResponseData<T>> {
	return new Promise((resolve, reject) => {
		// 记录请求日志
		logger.logRequest(options.method || 'GET', options.url, options.data);

		// 如果使用Mock数据
		if (USE_MOCK) {
			mockRequest(options)
				.then((response) => {
					logger.logResponse(options.method || 'GET', options.url, 200, response);
					resolve(response);
				})
				.catch((error) => {
					logger.error('Mock请求失败', error);
					reject(error);
				});
			return;
		}

		// 真实API请求
		const { url, method = 'GET', data, header = {} } = options;

		// 获取token
		const token = uni.getStorageSync('token');
		if (token && typeof token === 'string') {
			header['Authorization'] = `Bearer ${token}`;
		}

		uni.request({
			url: BASE_URL + url,
			method,
			data,
			header: {
				'Content-Type': 'application/json',
				...header
			},
			success: (res: UniRequestResponse) => {
				// 验证响应数据结构
				const rawData = res.data
				if (!rawData || typeof rawData !== 'object') {
					logger.error('响应数据格式错误', { statusCode: res.statusCode, data: rawData })
					reject(new Error('响应数据格式错误'))
					return
				}

				const response = rawData as ResponseData<T>

				// 记录响应日志
				logger.logResponse(method, url, res.statusCode, response)

				if (response.code === 0) {
					resolve(response)
				} else if (response.code === 401 && retryCount === 0) {
					// 判断是否应该刷新 token
					// 登录相关接口的 401 错误不应触发 token 刷新
					const isAuthEndpoint = url.includes('/auth/login') ||
						url.includes('/auth/register') ||
						url.includes('/auth/send-code')

					if (isAuthEndpoint) {
						// 认证接口的 401 是业务错误（如密码错误），不是 token 过期
						handleBusinessError(response)
						reject(response)
					} else {
						// 其他接口的 401 才是 token 过期，需要刷新
						handleTokenExpired(options, resolve, reject)
					}
				} else {
					// 其他业务错误处理
					handleBusinessError(response)
					reject(response)
				}
			},
			fail: (error: unknown) => {
				// 网络错误处理
				logger.error('网络请求失败', error)
				handleNetworkError(error)
				reject(error instanceof Error ? error : new Error('网络请求失败'))
			}
		});
	});
}

/**
 * 处理 Token 过期
 */
async function handleTokenExpired<T>(
	options: RequestOptions,
	resolve: (value: ResponseData<T>) => void,
	reject: (reason: any) => void
): Promise<void> {
	if (!isRefreshing) {
		// 开始刷新 token
		isRefreshing = true;
		try {
			const newToken = await doRefreshToken();
			isRefreshing = false;
			// 通知所有等待的请求
			onTokenRefreshed(newToken);
			// 重试当前请求
			doRequest<T>(options, 1).then(resolve).catch(reject);
		} catch (error) {
			isRefreshing = false;
			refreshSubscribers = [];
			// Token 刷新失败，清除登录信息并跳转登录页
			uni.removeStorageSync('token');
			uni.removeStorageSync('refreshToken');
			uni.removeStorageSync('userInfo');
			uni.showToast({
				title: '登录已过期，请重新登录',
				icon: 'none'
			});
			setTimeout(() => {
				uni.reLaunch({ url: '/pages/auth/login' });
			}, 1500);
			reject(error);
		}
	} else {
		// 正在刷新 token，将请求加入队列
		subscribeTokenRefresh((newToken) => {
			// Token 刷新成功，重试请求
			doRequest<T>(options, 1).then(resolve).catch(reject);
		});
	}
}

/**
 * 统一请求方法（对外接口）
 */
export function request<T = unknown>(options: RequestOptions): Promise<ResponseData<T>> {
	return doRequest<T>(options, 0);
}

/**
 * 处理业务错误
 */
function handleBusinessError(response: ResponseData<unknown>): void {
	const { code, message } = response;

	// 特殊错误码处理
	switch (code) {
		case 403:
			// 无权限
			uni.showToast({
				title: '没有权限访问',
				icon: 'none'
			});
			break;
		case 404:
			// 资源不存在
			uni.showToast({
				title: '请求的资源不存在',
				icon: 'none'
			});
			break;
		case 500:
			// 服务器错误
			uni.showToast({
				title: '服务器错误，请稍后重试',
				icon: 'none'
			});
			break;
		default:
			// 其他业务错误
			uni.showToast({
				title: message || '请求失败',
				icon: 'none'
			});
	}

	// 记录错误日志
	logger.error(`业务错误 [${code}]`, { code, message });
}

/**
 * 处理网络错误
 */
function handleNetworkError(error: unknown): void {
	uni.showToast({
		title: '网络请求失败，请检查网络连接',
		icon: 'none'
	});
}

/**
 * GET请求
 */
export function get<T = unknown>(url: string, data?: RequestData): Promise<ResponseData<T>> {
	return request<T>({ url, method: 'GET', data });
}

/**
 * POST请求
 */
export function post<T = unknown>(url: string, data?: RequestData): Promise<ResponseData<T>> {
	return request<T>({ url, method: 'POST', data });
}

/**
 * PUT请求
 */
export function put<T = unknown>(url: string, data?: RequestData): Promise<ResponseData<T>> {
	return request<T>({ url, method: 'PUT', data });
}

/**
 * DELETE请求
 */
export function del<T = unknown>(url: string, data?: RequestData): Promise<ResponseData<T>> {
	return request<T>({ url, method: 'DELETE', data });
}
