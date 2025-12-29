// 用户相关类型
import type { UserRole, Role } from './permission'

export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar?: string
  role: UserRole // 保留用于兼容性
  roles: Role[] // 新增：用户的角色列表
  permissions: string[] // 用户的权限代码列表
  status: 'active' | 'inactive' | 'banned'
  storeId?: string // 所属门店ID
  regionId?: string // 所属区域ID
  createdAt: string
  updatedAt: string
}

export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  captcha: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}
