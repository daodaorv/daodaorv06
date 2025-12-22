/**
 * 页面认证检查 Composable
 * 用于需要登录才能访问的页面
 */

import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn, requireLogin, buildRedirectUrl } from '@/utils/auth'
import { logger } from '@/utils/logger'

interface UsePageAuthOptions {
  /** 当前页面路径 */
  pagePath: string
  /** 页面初始化函数 */
  onSetup: (options: Record<string, string>) => void | Promise<void>
  /** 是否在 onShow 时重新检查（默认 true） */
  checkOnShow?: boolean
}

interface UsePageAuthReturn {
  /** 页面是否准备就绪 */
  pageReady: ReturnType<typeof ref<boolean>>
  /** 重定向 URL */
  redirectUrl: ReturnType<typeof ref<string>>
  /** 手动检查认证状态 */
  checkAuth: () => boolean
}

/**
 * 页面认证检查 Composable
 * @param options 配置选项
 * @returns 认证相关状态和方法
 *
 * @example
 * ```ts
 * const { pageReady, redirectUrl } = usePageAuth({
 *   pagePath: '/pages/order/confirm',
 *   onSetup: (options) => {
 *     // 页面初始化逻辑
 *     loadOrderData(options.orderId)
 *   }
 * })
 *
 * // 在模板中使用
 * <view v-if="pageReady">
 *   <!-- 页面内容 -->
 * </view>
 * <view v-else>
 *   <u-loading-page loading></u-loading-page>
 * </view>
 * ```
 */
export function usePageAuth(options: UsePageAuthOptions): UsePageAuthReturn {
  const { pagePath, onSetup, checkOnShow = true } = options

  const pageReady = ref(false)
  const redirectUrl = ref(pagePath)
  let cachedRouteParams: Record<string, string> | null = null

  /**
   * 检查认证状态
   */
  const checkAuth = (): boolean => {
    if (isLoggedIn()) {
      return true
    }
    return requireLogin(redirectUrl.value)
  }

  /**
   * 确保已认证
   */
  const ensureAuth = (routeOptions: Record<string, string>): boolean => {
    redirectUrl.value = buildRedirectUrl(pagePath, routeOptions)
    return checkAuth()
  }

  /**
   * 设置页面
   */
  const setupPage = async (routeOptions: Record<string, string>): Promise<void> => {
    try {
      await onSetup(routeOptions)
      pageReady.value = true
    } catch (error) {
      logger.error('页面初始化失败', error)
      pageReady.value = false
    }
  }

  // 页面加载时检查认证
  onLoad((routeOptions) => {
    const options = (routeOptions || {}) as Record<string, string>
    cachedRouteParams = options
    pageReady.value = false

    if (!ensureAuth(options)) {
      return
    }

    setupPage(options)
  })

  // 页面显示时重新检查（用于登录后返回）
  if (checkOnShow) {
    onShow(() => {
      if (!pageReady.value && cachedRouteParams && isLoggedIn()) {
        setupPage(cachedRouteParams)
      }
    })
  }

  return {
    pageReady,
    redirectUrl,
    checkAuth
  }
}

export default usePageAuth
