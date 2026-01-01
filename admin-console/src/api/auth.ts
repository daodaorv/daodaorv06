import { get, post } from '@/utils/request'
import type { LoginForm, ApiResponse, User } from '@/types/user'
import { mockLogin, mockGetUserInfo, mockLogout } from '@/mock/auth'

// 是否使用 Mock 数据（已切换到真实 API）
const USE_MOCK = false

export const authApi = {
  // 登录
  login: (data: LoginForm) => {
    if (USE_MOCK) {
      return mockLogin(data.username, data.password) as Promise<
        ApiResponse<{ token: string; user: User }>
      >
    }
    return post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      phone: data.username,
      password: data.password,
    })
  },

  // 登出
  logout: () => {
    if (USE_MOCK) {
      return mockLogout() as Promise<ApiResponse>
    }
    return post<ApiResponse>('/auth/logout')
  },

  // 获取用户信息
  getUserInfo: () => {
    if (USE_MOCK) {
      const token = localStorage.getItem('token') || ''
      return mockGetUserInfo(token) as Promise<ApiResponse<User>>
    }
    return get<ApiResponse<User>>('/auth/me')
  },

  // 刷新token
  refreshToken: () => post<ApiResponse<{ token: string }>>('/auth/refresh'),

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    post<ApiResponse>('/auth/change-password', data),
}
