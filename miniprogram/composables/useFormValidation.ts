/**
 * 表单验证 Composable
 * 提供常用的表单验证规则和方法
 */

import { ref, computed } from 'vue'

// 验证规则类型
export interface ValidationRule {
  /** 验证函数 */
  validator: (value: string) => boolean
  /** 错误提示信息 */
  message: string
}

// 字段验证配置
export interface FieldConfig {
  /** 字段值 */
  value: () => string
  /** 验证规则列表 */
  rules: ValidationRule[]
  /** 是否必填 */
  required?: boolean
  /** 必填提示信息 */
  requiredMessage?: string
}

// 验证结果
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息 */
  message: string
}

// 预定义验证规则
export const ValidationRules = {
  /** 手机号验证 */
  phone: {
    validator: (value: string) => /^1[3-9]\d{9}$/.test(value),
    message: '请输入正确的手机号'
  },

  /** 验证码验证（6位数字） */
  verificationCode: {
    validator: (value: string) => /^\d{6}$/.test(value),
    message: '请输入6位验证码'
  },

  /** 密码验证（6-20位） */
  password: {
    validator: (value: string) => value.length >= 6 && value.length <= 20,
    message: '密码长度为6-20位'
  },

  /** 用户名验证（2-20位） */
  username: {
    validator: (value: string) => value.length >= 2 && value.length <= 20,
    message: '用户名长度为2-20位'
  },

  /** 昵称验证（1-20位） */
  nickname: {
    validator: (value: string) => value.length >= 1 && value.length <= 20,
    message: '昵称长度为1-20位'
  },

  /** 邮箱验证 */
  email: {
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '请输入正确的邮箱地址'
  },

  /** 身份证号验证 */
  idCard: {
    validator: (value: string) => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value),
    message: '请输入正确的身份证号'
  },

  /** 驾驶证号验证 */
  driverLicense: {
    validator: (value: string) => value.length >= 12 && value.length <= 18,
    message: '请输入正确的驾驶证号'
  },

  /** 非空验证 */
  notEmpty: {
    validator: (value: string) => value.trim().length > 0,
    message: '此项不能为空'
  }
}

/**
 * 创建自定义验证规则
 */
export function createRule(validator: (value: string) => boolean, message: string): ValidationRule {
  return { validator, message }
}

/**
 * 创建长度验证规则
 */
export function lengthRule(min: number, max: number, fieldName = '内容'): ValidationRule {
  return {
    validator: (value: string) => value.length >= min && value.length <= max,
    message: `${fieldName}长度为${min}-${max}位`
  }
}

/**
 * 创建最小长度验证规则
 */
export function minLengthRule(min: number, fieldName = '内容'): ValidationRule {
  return {
    validator: (value: string) => value.length >= min,
    message: `${fieldName}至少${min}位`
  }
}

/**
 * 创建匹配验证规则（用于确认密码等场景）
 */
export function matchRule(getTargetValue: () => string, message = '两次输入不一致'): ValidationRule {
  return {
    validator: (value: string) => value === getTargetValue(),
    message
  }
}

/**
 * 表单验证 Composable
 */
export function useFormValidation() {
  const errors = ref<Record<string, string>>({})

  /**
   * 验证单个字段
   */
  const validateField = (fieldName: string, value: string, rules: ValidationRule[], required = false, requiredMessage?: string): ValidationResult => {
    // 必填验证
    if (required && !value.trim()) {
      const message = requiredMessage || `请输入${fieldName}`
      errors.value[fieldName] = message
      return { valid: false, message }
    }

    // 如果非必填且为空，跳过其他验证
    if (!required && !value.trim()) {
      delete errors.value[fieldName]
      return { valid: true, message: '' }
    }

    // 执行验证规则
    for (const rule of rules) {
      if (!rule.validator(value)) {
        errors.value[fieldName] = rule.message
        return { valid: false, message: rule.message }
      }
    }

    delete errors.value[fieldName]
    return { valid: true, message: '' }
  }

  /**
   * 验证多个字段
   */
  const validateFields = (fields: Record<string, FieldConfig>): boolean => {
    let allValid = true

    for (const [fieldName, config] of Object.entries(fields)) {
      const result = validateField(
        fieldName,
        config.value(),
        config.rules,
        config.required,
        config.requiredMessage
      )
      if (!result.valid) {
        allValid = false
      }
    }

    return allValid
  }

  /**
   * 验证并显示 Toast 提示
   */
  const validateWithToast = (fields: Record<string, FieldConfig>): boolean => {
    for (const [fieldName, config] of Object.entries(fields)) {
      const result = validateField(
        fieldName,
        config.value(),
        config.rules,
        config.required,
        config.requiredMessage
      )
      if (!result.valid) {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
        return false
      }
    }
    return true
  }

  /**
   * 清除所有错误
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * 清除指定字段错误
   */
  const clearFieldError = (fieldName: string) => {
    delete errors.value[fieldName]
  }

  /**
   * 获取字段错误信息
   */
  const getFieldError = (fieldName: string): string => {
    return errors.value[fieldName] || ''
  }

  /**
   * 是否有错误
   */
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  return {
    errors,
    hasErrors,
    validateField,
    validateFields,
    validateWithToast,
    clearErrors,
    clearFieldError,
    getFieldError
  }
}

export default useFormValidation
