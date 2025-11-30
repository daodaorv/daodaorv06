import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/user'
import {
  mockGetUserList,
  mockGetUserDetail,
  mockCreateUser,
  mockUpdateUser,
  mockDeleteUser,
  mockChangeUserStatus,
} from '@/mock/users'

// 是否使用 Mock 数据（开发环境默认使用）
const USE_MOCK = import.meta.env.DEV

// 用户管理API接口类型定义
export interface UserListParams {
  page?: number
  pageSize?: number
  phone?: string
  username?: string
  userType?: string
  status?: string
}

export interface UserInfo {
  id: number
  username: string
  phone: string
  email?: string
  userType: 'customer' | 'mobile_admin' | 'pc_admin'
  status: 'active' | 'inactive' | 'banned'
  realName?: string
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  list: UserInfo[]
  total: number
  page: number
  pageSize: number
}

export interface CreateUserParams {
  username: string
  phone: string
  password: string
  email?: string
  userType: 'customer' | 'mobile_admin' | 'pc_admin'
  realName?: string
}

export interface UpdateUserParams {
  id: number
  username?: string
  email?: string
  userType?: 'customer' | 'mobile_admin' | 'pc_admin'
  status?: 'active' | 'inactive' | 'banned'
  realName?: string
}

export const userApi = {
  // 获取用户列表
  getUserList: (params: UserListParams) => {
    if (USE_MOCK) {
      return mockGetUserList(params) as Promise<ApiResponse<UserListResponse>>
    }
    return request.get<ApiResponse<UserListResponse>>('/users', params)
  },

  // 获取用户详情
  getUserDetail: (id: number) => {
    if (USE_MOCK) {
      return mockGetUserDetail(id) as Promise<ApiResponse<UserInfo>>
    }
    return request.get<ApiResponse<UserInfo>>(`/users/${id}`)
  },

  // 创建用户
  createUser: (data: CreateUserParams) => {
    if (USE_MOCK) {
      return mockCreateUser(data) as Promise<ApiResponse<UserInfo>>
    }
    return request.post<ApiResponse<UserInfo>>('/users', data)
  },

  // 更新用户信息
  updateUser: (data: UpdateUserParams) => {
    if (USE_MOCK) {
      return mockUpdateUser(data) as Promise<ApiResponse<UserInfo>>
    }
    return request.put<ApiResponse<UserInfo>>(`/users/${data.id}`, data)
  },

  // 删除用户
  deleteUser: (id: number) => {
    if (USE_MOCK) {
      return mockDeleteUser(id) as Promise<ApiResponse>
    }
    return request.delete<ApiResponse>(`/users/${id}`)
  },

  // 更改用户状态
  changeUserStatus: (id: number, status: 'active' | 'inactive' | 'banned') => {
    if (USE_MOCK) {
      return mockChangeUserStatus(id, status) as Promise<ApiResponse>
    }
    return request.put<ApiResponse>(`/users/${id}/status`, { status })
  },

  // 重置用户密码
  resetPassword: (id: number, newPassword: string) =>
    request.put<ApiResponse>(`/users/${id}/reset-password`, { password: newPassword }),
}
