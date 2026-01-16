/**
 * 用户角色类型定义
 * 与后端和小程序端保持一致
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
 * 角色代码枚举
 */
export enum RoleCode {
  /** 普通注册用户 */
  NORMAL = 'normal',
  /** PLUS会员 */
  PLUS = 'plus',
  /** 自有车托管用户 */
  HOSTING_OWN = 'hosting_own',
  /** 购车托管用户 */
  HOSTING_PURCHASE = 'hosting_purchase',
  /** 众筹托管用户 */
  HOSTING_CROWDFUNDING = 'hosting_crowdfunding'
}
