/**
 * 用户相关类型定义
 */

/**
 * 用户角色
 */
export interface UserRole {
  /** 角色ID */
  id: number
  /** 角色代码 */
  code: string
  /** 角色名称 */
  name: string
  /** 角色类型 */
  type: 'customer' | 'admin'
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: string
  /** 用户名 */
  username?: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  gender?: number
  /** 实名认证状态 */
  isVerified?: boolean
  /** 会员等级 */
  memberLevel?: number
  /** 会员等级名称 */
  memberLevelName?: string
  /** 余额 */
  balance?: number
  /** 用户类型 */
  userType?: string
  /** 用户状态 */
  status?: string
  /** 用户角色列表 */
  roles?: UserRole[]
  /** 创建时间 */
  createdAt?: string
}

/**
 * 登录参数
 */
export interface LoginParams extends Record<string, unknown> {
  /** 手机号 */
  phone: string
  /** 密码或验证码 */
  code: string
  /** 登录类型: password | sms */
  type: 'password' | 'sms'
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken: string
  /** 用户信息 */
  userInfo: UserInfo
  /** 是否为新用户 */
  isNewUser?: boolean
}

/**
 * 驾驶证信息
 */
export interface DriverLicense {
  /** 驾驶证号 */
  licenseNo: string
  /** 姓名 */
  name: string
  /** 有效期开始 */
  validFrom: string
  /** 有效期结束 */
  validTo: string
  /** 准驾车型 */
  vehicleType: string
  /** 驾驶证正面照 */
  frontImage: string
  /** 驾驶证反面照 */
  backImage: string
  /** 审核状态 */
  status: 'pending' | 'approved' | 'rejected'
}

/**
 * 用户统计信息
 */
export interface UserStats {
  /** 订单总数 */
  totalOrders: number
  /** 进行中订单 */
  ongoingOrders: number
  /** 已完成订单 */
  completedOrders: number
  /** 优惠券数量 */
  couponCount: number
}
