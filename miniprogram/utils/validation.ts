/**
 * 表单验证工具
 * 统一管理所有表单验证逻辑,避免重复代码
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * 手机号验证
 * 支持1开头的11位手机号(包含虚拟运营商)
 * @param phone 手机号
 * @returns 验证结果
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      message: '请输入手机号'
    };
  }

  const trimmedPhone = phone.trim();

  // 支持1开头的11位手机号（包含虚拟运营商）
  const phoneReg = /^1\d{10}$/;

  if (!phoneReg.test(trimmedPhone)) {
    return {
      valid: false,
      message: '请输入正确的手机号'
    };
  }

  return { valid: true };
}

/**
 * 简化版手机号验证(仅返回布尔值)
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  return validatePhone(phone).valid;
}

/**
 * 身份证号验证
 * 支持15位和18位身份证号,包含校验位验证
 * @param idCard 身份证号
 * @returns 验证结果
 */
export function validateIdCard(idCard: string): ValidationResult {
  if (!idCard || idCard.trim() === '') {
    return {
      valid: false,
      message: '请输入身份证号'
    };
  }

  const trimmedIdCard = idCard.trim();

  // 15位或18位身份证号
  if (!/^\d{15}$|^\d{17}[\dXx]$/.test(trimmedIdCard)) {
    return {
      valid: false,
      message: '请输入正确的身份证号'
    };
  }

  // 18位身份证校验位验证
  if (trimmedIdCard.length === 18) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(trimmedIdCard[i]) * weights[i];
    }

    const checkCode = checkCodes[sum % 11];
    const lastChar = trimmedIdCard[17].toUpperCase();

    if (lastChar !== checkCode) {
      return {
        valid: false,
        message: '身份证号校验位错误'
      };
    }
  }

  return { valid: true };
}

/**
 * 简化版身份证验证(仅返回布尔值)
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function isValidIdCard(idCard: string): boolean {
  return validateIdCard(idCard).valid;
}

/**
 * 邮箱验证
 * @param email 邮箱地址
 * @returns 验证结果
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: '请输入邮箱地址'
    };
  }

  const trimmedEmail = email.trim();
  const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailReg.test(trimmedEmail)) {
    return {
      valid: false,
      message: '请输入正确的邮箱地址'
    };
  }

  return { valid: true };
}

/**
 * 简化版邮箱验证(仅返回布尔值)
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid;
}

/**
 * 日期范围验证
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 验证结果
 */
export function validateDateRange(startDate: string | Date, endDate: string | Date): ValidationResult {
  if (!startDate || !endDate) {
    return {
      valid: false,
      message: '请选择日期'
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      message: '日期格式错误'
    };
  }

  if (end <= start) {
    return {
      valid: false,
      message: '结束日期必须晚于开始日期'
    };
  }

  return { valid: true };
}

/**
 * 验证日期是否在未来
 * @param date 日期
 * @returns 验证结果
 */
export function validateFutureDate(date: string | Date): ValidationResult {
  if (!date) {
    return {
      valid: false,
      message: '请选择日期'
    };
  }

  const targetDate = new Date(date);
  const now = new Date();

  if (isNaN(targetDate.getTime())) {
    return {
      valid: false,
      message: '日期格式错误'
    };
  }

  if (targetDate <= now) {
    return {
      valid: false,
      message: '日期必须是未来时间'
    };
  }

  return { valid: true };
}

/**
 * 验证非空字符串
 * @param value 字符串值
 * @param fieldName 字段名称(用于错误提示)
 * @returns 验证结果
 */
export function validateRequired(value: string, fieldName: string = '此项'): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      message: `${fieldName}不能为空`
    };
  }
  return { valid: true };
}

/**
 * 验证字符串长度
 * @param value 字符串值
 * @param min 最小长度
 * @param max 最大长度
 * @param fieldName 字段名称(用于错误提示)
 * @returns 验证结果
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = '此项'
): ValidationResult {
  if (!value) {
    return {
      valid: false,
      message: `${fieldName}不能为空`
    };
  }

  const length = value.trim().length;

  if (length < min) {
    return {
      valid: false,
      message: `${fieldName}长度不能少于${min}个字符`
    };
  }

  if (length > max) {
    return {
      valid: false,
      message: `${fieldName}长度不能超过${max}个字符`
    };
  }

  return { valid: true };
}
