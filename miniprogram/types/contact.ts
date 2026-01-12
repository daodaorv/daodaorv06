/**
 * 联系人相关类型定义
 */

/**
 * 联系人信息
 */
export interface Contact {
  /** 联系人ID */
  id: string
  /** 用户ID */
  userId?: number
  /** 姓名 */
  name: string
  /** 手机号 */
  phone: string
  /** 身份证号 */
  idCard: string
  /** 驾驶证号 */
  driverLicenseNo: string
  /** 驾驶证正面照片 */
  driverLicenseFront: string
  /** 驾驶证反面照片 */
  driverLicenseBack: string
  /** 是否为默认联系人 */
  isDefault: boolean
  /** 状态 */
  status?: string
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 创建联系人参数
 */
export interface CreateContactParams {
  /** 姓名 */
  name: string
  /** 手机号 */
  phone: string
  /** 身份证号 */
  idCard: string
  /** 驾驶证号 */
  driverLicenseNo: string
  /** 驾驶证正面照片 */
  driverLicenseFront: string
  /** 驾驶证反面照片 */
  driverLicenseBack: string
  /** 是否设为默认 */
  isDefault?: boolean
}

/**
 * 更新联系人参数
 */
export interface UpdateContactParams {
  /** 姓名 */
  name?: string
  /** 手机号 */
  phone?: string
  /** 身份证号 */
  idCard?: string
  /** 驾驶证号 */
  driverLicenseNo?: string
  /** 驾驶证正面照片 */
  driverLicenseFront?: string
  /** 驾驶证反面照片 */
  driverLicenseBack?: string
  /** 是否设为默认 */
  isDefault?: boolean
}
