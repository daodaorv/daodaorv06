/**
 * 本地存储工具
 * 封装uni.storage API，提供类型安全和错误处理
 */

/**
 * 存储数据
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('[Storage Error] setStorage:', e)
    return false
  }
}

/**
 * 获取数据
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('[Storage Error] getStorage:', e)
    return defaultValue
  }
}

/**
 * 删除数据
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('[Storage Error] removeStorage:', e)
    return false
  }
}

/**
 * 清空所有数据
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
    return true
  } catch (e) {
    console.error('[Storage Error] clearStorage:', e)
    return false
  }
}

/**
 * 获取存储信息
 */
export function getStorageInfo() {
  try {
    return uni.getStorageInfoSync()
  } catch (e) {
    console.error('[Storage Error] getStorageInfo:', e)
    return null
  }
}

// 常用存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SETTINGS: 'settings',
  CACHE_DATA: 'cacheData',
  OFFLINE_DATA: 'offlineData'
}

export default {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo,
  STORAGE_KEYS
}
