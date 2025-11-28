// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar?: string
  role: 'admin' | 'manager' | 'staff'
  permissions: string[]
  status: 'active' | 'inactive' | 'banned'
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