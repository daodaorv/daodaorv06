/**
 * 主题颜色常量
 * 与 uni.scss 中的样式变量保持一致
 * 用于在 JavaScript/TypeScript 中使用颜色值
 */

export const THEME_COLORS = {
  /** 主题色 */
  primary: '#FF9F29',
  /** 次要色 */
  secondary: '#1A1A1A',
  /** 成功色 */
  success: '#00B578',
  /** 警告色 */
  warning: '#FF7D00',
  /** 错误色 */
  error: '#FF4D4F',
  /** 信息色 */
  info: '#2196F3',

  /** 背景色 */
  bgColor: '#F8F9FC',
  /** 卡片背景色 */
  bgColorCard: '#FFFFFF',
  /** 灰色背景 */
  bgColorGrey: '#F2F3F5',

  /** 主要文字颜色 */
  textColor: '#1D2129',
  /** 次要文字颜色 */
  textColorSecondary: '#4E5969',
  /** 占位符颜色 */
  textColorPlaceholder: '#86909C',
  /** 反色文字 */
  textColorInverse: '#FFFFFF',

  /** 边框颜色 */
  borderColor: '#E5E6EB',
  /** 浅边框颜色 */
  borderColorLight: '#F2F3F5'
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS
export type ThemeColorValue = typeof THEME_COLORS[ThemeColorKey]

export default THEME_COLORS
