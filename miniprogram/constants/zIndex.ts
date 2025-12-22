/**
 * z-index 层级管理常量
 * 统一管理项目中所有弹窗、遮罩等元素的层级
 */

export const Z_INDEX = {
  /** 基础层级 */
  BASE: 1,

  /** 导航栏 */
  NAVBAR: 100,

  /** 悬浮按钮 */
  FAB: 500,

  /** 底部操作栏 */
  BOTTOM_BAR: 100,

  /** 弹窗基础层级 */
  POPUP_BASE: 10000,

  /** 城市选择器 */
  CITY_PICKER: 10050,

  /** 日期选择器 */
  DATE_PICKER: 10060,

  /** 联系人选择器 */
  CONTACT_PICKER: 10070,

  /** 分享面板 */
  SHARE_SHEET: 10080,

  /** 确认对话框 */
  CONFIRM_DIALOG: 10090,

  /** 模态框 */
  MODAL: 10100,

  /** Toast 提示 */
  TOAST: 10200,

  /** 加载遮罩 */
  LOADING: 10300
} as const

export type ZIndexKey = keyof typeof Z_INDEX
export type ZIndexValue = typeof Z_INDEX[ZIndexKey]

export default Z_INDEX
