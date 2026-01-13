/**
 * 统一错误提示文案
 * 避免重复硬编码提示文案
 */

/**
 * 通用提示
 */
export const COMMON_MESSAGES = {
  LOADING_FAILED: '加载失败，请稍后再试',
  SUBMIT_FAILED: '提交失败，请稍后再试',
  SAVE_SUCCESS: '保存成功',
  SAVE_FAILED: '保存失败',
  DELETE_SUCCESS: '删除成功',
  DELETE_FAILED: '删除失败',
  OPERATION_SUCCESS: '操作成功',
  OPERATION_FAILED: '操作失败',
  NETWORK_ERROR: '网络错误，请检查网络连接',
  UNKNOWN_ERROR: '未知错误，请稍后再试'
} as const;

/**
 * 表单验证提示
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_NAME: '请输入姓名',
  REQUIRED_PHONE: '请输入手机号',
  INVALID_PHONE: '手机号格式不正确',
  REQUIRED_ID_CARD: '请输入身份证号',
  INVALID_ID_CARD: '身份证号格式不正确',
  REQUIRED_EMAIL: '请输入邮箱',
  INVALID_EMAIL: '邮箱格式不正确',
  REQUIRED_INFO: '请完善信息'
} as const;

/**
 * 订单相关提示
 */
export const ORDER_MESSAGES = {
  SUBMIT_SUCCESS: '订单提交成功',
  SUBMIT_FAILED: '订单提交失败',
  CANCEL_SUCCESS: '订单取消成功',
  CANCEL_FAILED: '订单取消失败',
  PAY_SUCCESS: '支付成功',
  PAY_FAILED: '支付失败',
  LOADING_FAILED: '订单加载失败'
} as const;
