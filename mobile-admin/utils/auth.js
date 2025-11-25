/**
 * 权限控制和安全验证工具 - 移动管理端
 */

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  const token = uni.getStorageSync('mobile_admin_token')
  return !!token
}

/**
 * 检查Token是否过期
 * @returns {boolean}
 */
export const isTokenExpired = () => {
  const token = uni.getStorageSync('mobile_admin_token')
  if (!token) return true

  try {
    // 解析JWT Token
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000

    // 提前5分钟判断为过期，避免请求时才发现过期
    return payload.exp < (currentTime + 300)
  } catch (error) {
    console.error('Token解析失败:', error)
    return true
  }
}

/**
 * 检查用户权限
 * @param {string} permission - 权限标识
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const userInfo = uni.getStorageSync('mobile_admin_userInfo')
  if (!userInfo) return false

  // 超级管理员拥有所有权限
  if (userInfo.role === 'super_admin') return true

  // 检查用户权限列表
  const userPermissions = userInfo.permissions || []
  return userPermissions.includes(permission)
}

/**
 * 检查用户角色
 * @param {string|array} roles - 角色或角色数组
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const userInfo = uni.getStorageSync('mobile_admin_userInfo')
  if (!userInfo) return false

  const userRole = userInfo.role
  if (Array.isArray(roles)) {
    return roles.includes(userRole)
  }

  return userRole === roles
}

/**
 * 权限守卫 - 路由跳转前检查
 * @param {string} requiredRole - 需要的角色
 * @param {string} requiredPermission - 需要的权限
 * @returns {boolean}
 */
export const routeGuard = (requiredRole = null, requiredPermission = null) => {
  // 检查登录状态
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/login' })
    return false
  }

  // 检查Token过期
  if (isTokenExpired()) {
    uni.showModal({
      title: '登录过期',
      content: '登录已过期，请重新登录',
      showCancel: false,
      success: () => {
        clearAuthData()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    })
    return false
  }

  // 检查角色权限
  if (requiredRole && !hasRole(requiredRole)) {
    uni.showToast({
      title: '权限不足',
      icon: 'none'
    })
    return false
  }

  // 检查具体权限
  if (requiredPermission && !hasPermission(requiredPermission)) {
    uni.showToast({
      title: '权限不足',
      icon: 'none'
    })
    return false
  }

  return true
}

/**
 * 清除认证数据
 */
export const clearAuthData = () => {
  uni.removeStorageSync('mobile_admin_token')
  uni.removeStorageSync('mobile_admin_userInfo')
}

/**
 * 安全退出登录
 */
export const safeLogout = async (authApi) => {
  try {
    // 调用后端退出接口
    await authApi.logout()
  } catch (error) {
    console.error('退出登录API调用失败:', error)
  } finally {
    // 无论API调用是否成功，都清除本地数据
    clearAuthData()
    uni.reLaunch({ url: '/pages/login/login' })
  }
}

/**
 * 敏感操作二次确认
 * @param {string} message - 确认消息
 * @param {string} placeholder - 输入框占位符
 * @returns {Promise}
 */
export const confirmSensitiveOperation = (message, placeholder = '') => {
  return new Promise((resolve) => {
    uni.showModal({
      title: '安全确认',
      content: message,
      editable: !!placeholder,
      placeholderText: placeholder,
      success: (res) => {
        if (res.confirm) {
          resolve(res.content || true)
        } else {
          resolve(false)
        }
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 记录操作日志
 * @param {string} action - 操作类型
 * @param {string} module - 模块名称
 * @param {Object} data - 操作数据
 */
export const logOperation = (action, module, data = {}) => {
  const userInfo = uni.getStorageSync('mobile_admin_userInfo')
  const logData = {
    userId: userInfo?.id,
    userName: userInfo?.nickname || userInfo?.phone,
    action,
    module,
    data,
    timestamp: new Date().toISOString(),
    platform: 'mobile_admin'
  }

  // 这里可以调用日志记录API
  console.log('操作日志:', logData)

  // TODO: 发送到后端日志服务
  // request.post('/logs/operation', logData)
}

/**
 * 检查操作频率限制
 * @param {string} action - 操作类型
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {boolean}
 */
export const checkRateLimit = (action, interval = 1000) => {
  const key = `rate_limit_${action}`
  const lastTime = uni.getStorageSync(key)

  if (!lastTime) {
    uni.setStorageSync(key, Date.now())
    return true
  }

  const currentTime = Date.now()
  if (currentTime - lastTime < interval) {
    uni.showToast({
      title: '操作过于频繁，请稍后再试',
      icon: 'none'
    })
    return false
  }

  uni.setStorageSync(key, currentTime)
  return true
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object}
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    message: '',
    strength: 0
  }

  if (!password) {
    result.message = '密码不能为空'
    return result
  }

  if (password.length < 6) {
    result.message = '密码长度不能少于6位'
    return result
  }

  if (password.length > 20) {
    result.message = '密码长度不能超过20位'
    return result
  }

  // 计算密码强度
  let strength = 0
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  result.strength = strength
  result.isValid = true
  result.message = strength >= 2 ? '密码强度良好' : '建议使用包含大小写字母和数字的密码'

  return result
}

/**
 * 数据脱敏处理
 * @param {string} data - 原始数据
 * @param {string} type - 数据类型
 * @returns {string}
 */
export const maskSensitiveData = (data, type) => {
  if (!data) return ''

  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    case 'email':
      return data.replace(/(.{2}).*(@.*)/, '$1****$2')
    case 'idcard':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    default:
      return data
  }
}