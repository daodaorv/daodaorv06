/**
 * 系统信息工具函数
 * @description 兼容新旧 API，避免废弃警告，支持 HarmonyOS 平台
 */

/**
 * 安全区域接口
 */
export interface SafeArea {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}

/**
 * 安全区域边距接口
 */
export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 窗口信息接口
 */
export interface WindowInfo {
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  pixelRatio: number
  statusBarHeight: number
  safeArea?: SafeArea
  safeAreaInsets?: SafeAreaInsets
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  platform: string
  system: string
  brand?: string
  model?: string
  devicePixelRatio?: number
}

/**
 * 应用基础信息接口
 */
export interface AppBaseInfo {
  version?: string
  SDKVersion?: string
  language?: string
  theme?: string
}

/**
 * 完整系统信息接口
 */
export interface SystemInfo extends WindowInfo, DeviceInfo, AppBaseInfo {}

/**
 * 判断是否为 HarmonyOS 平台
 * @returns 是否为 HarmonyOS
 */
export function isHarmonyOS(): boolean {
  // #ifdef MP-WEIXIN
  try {
    const deviceInfo = uni.getDeviceInfo()
    return deviceInfo.platform === 'harmony' || deviceInfo.platform === 'harmonyos'
  } catch (error) {
    return false
  }
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

/**
 * 获取窗口信息（屏幕宽高、像素比等）
 * @returns 窗口信息对象
 */
export function getWindowInfo(): WindowInfo {
  // #ifdef MP-WEIXIN
  // 微信小程序使用新 API
  return uni.getWindowInfo()
  // #endif

  // #ifndef MP-WEIXIN
  // 其他平台使用旧 API
  const info = uni.getSystemInfoSync()
  return {
    screenWidth: info.screenWidth,
    screenHeight: info.screenHeight,
    windowWidth: info.windowWidth,
    windowHeight: info.windowHeight,
    pixelRatio: info.pixelRatio,
    statusBarHeight: info.statusBarHeight || 0,
    safeArea: info.safeArea,
    safeAreaInsets: info.safeAreaInsets
  }
  // #endif
}

/**
 * 获取设备信息（平台、系统版本等）
 * @returns 设备信息对象
 */
export function getDeviceInfo(): DeviceInfo {
  // #ifdef MP-WEIXIN
  // 微信小程序使用新 API
  return uni.getDeviceInfo()
  // #endif

  // #ifndef MP-WEIXIN
  // 其他平台使用旧 API
  const info = uni.getSystemInfoSync()
  return {
    platform: info.platform,
    system: info.system,
    brand: info.brand,
    model: info.model,
    devicePixelRatio: info.pixelRatio
  }
  // #endif
}

/**
 * 获取应用基础信息（版本、SDK版本等）
 * @returns 应用信息对象
 */
export function getAppBaseInfo(): AppBaseInfo {
  // #ifdef MP-WEIXIN
  // 微信小程序使用新 API
  return uni.getAppBaseInfo()
  // #endif

  // #ifndef MP-WEIXIN
  // 其他平台使用旧 API
  const info = uni.getSystemInfoSync()
  return {
    version: info.version,
    SDKVersion: info.SDKVersion,
    language: info.language,
    theme: info.theme
  }
  // #endif
}

/**
 * 获取完整系统信息（兼容旧代码）
 * @returns 系统信息对象
 */
export function getSystemInfo(): SystemInfo {
  // #ifdef MP-WEIXIN
  // 微信小程序组合新 API
  const windowInfo = uni.getWindowInfo()
  const deviceInfo = uni.getDeviceInfo()
  const appBaseInfo = uni.getAppBaseInfo()

  return {
    ...windowInfo,
    ...deviceInfo,
    ...appBaseInfo
  }
  // #endif

  // #ifndef MP-WEIXIN
  // 其他平台使用旧 API
  return uni.getSystemInfoSync()
  // #endif
}

/**
 * 获取平台特定的适配信息
 * @description 用于处理不同平台的特殊适配需求
 */
export function getPlatformAdaptation() {
  const deviceInfo = getDeviceInfo()
  const windowInfo = getWindowInfo()

  return {
    isHarmonyOS: isHarmonyOS(),
    isIOS: deviceInfo.platform === 'ios',
    isAndroid: deviceInfo.platform === 'android',
    isDevtools: deviceInfo.platform === 'devtools',
    statusBarHeight: windowInfo.statusBarHeight,
    safeAreaInsets: windowInfo.safeAreaInsets,
    // 计算安全区域底部高度（用于适配全面屏）
    safeAreaBottom: windowInfo.safeAreaInsets?.bottom || 0
  }
}

