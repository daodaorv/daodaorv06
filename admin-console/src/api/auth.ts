import { request } from '@/utils/request'
import type { LoginForm, ApiResponse, User } from '@/types/user'

export const authApi = {
  // 登录
  login: (data: LoginForm) =>
    request.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      phone: data.username,
      password: data.password,
    }),

  // 登出
  logout: () =>
    request.post<ApiResponse>('/auth/logout'),

  // 获取用户信息
  getUserInfo: () =>
    request.get<ApiResponse<User>>('/auth/me'),

  // 刷新token
  refreshToken: () =>
    request.post<ApiResponse<{ token: string }>>('/auth/refresh'),

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.post<ApiResponse>('/auth/change-password', data),
}