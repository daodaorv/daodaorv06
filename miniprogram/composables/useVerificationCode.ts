/**
 * 验证码倒计时 Composable
 * 用于认证页面的验证码发送和倒计时功能
 */

import { ref, computed, onUnmounted } from 'vue'
import { logger } from '@/utils/logger'

interface UseVerificationCodeOptions {
  /** 倒计时秒数，默认 60 */
  countdownSeconds?: number
  /** 发送验证码的 API 函数 */
  sendCodeApi: (phone: string, type: string) => Promise<unknown>
  /** 验证码类型，如 'login', 'register', 'reset' */
  codeType: string
}

interface UseVerificationCodeReturn {
  /** 倒计时秒数 */
  countdown: ReturnType<typeof ref<number>>
  /** 是否正在发送 */
  codeSending: ReturnType<typeof ref<boolean>>
  /** 按钮文本 */
  codeButtonText: ReturnType<typeof computed<string>>
  /** 是否可以发送 */
  canSend: ReturnType<typeof computed<boolean>>
  /** 发送验证码 */
  sendCode: (phone: string) => Promise<boolean>
  /** 重置状态 */
  reset: () => void
}

/**
 * 验证码倒计时 Composable
 * @param options 配置选项
 * @returns 验证码相关状态和方法
 *
 * @example
 * ```ts
 * const { countdown, codeSending, codeButtonText, canSend, sendCode } = useVerificationCode({
 *   countdownSeconds: 60,
 *   sendCodeApi: authApi.sendCode,
 *   codeType: 'login'
 * })
 *
 * // 在模板中使用
 * <button :disabled="!canSend" @click="handleSendCode">{{ codeButtonText }}</button>
 *
 * // 发送验证码
 * const handleSendCode = async () => {
 *   const success = await sendCode(phone.value)
 *   if (success) {
 *     // 发送成功
 *   }
 * }
 * ```
 */
export function useVerificationCode(options: UseVerificationCodeOptions): UseVerificationCodeReturn {
  const { countdownSeconds = 60, sendCodeApi, codeType } = options

  const countdown = ref(0)
  const codeSending = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  // 按钮文本
  const codeButtonText = computed(() => {
    if (codeSending.value) return '发送中...'
    if (countdown.value > 0) return `${countdown.value}s`
    return '获取验证码'
  })

  // 是否可以发送
  const canSend = computed(() => {
    return !codeSending.value && countdown.value <= 0
  })

  // 开始倒计时
  const startCountdown = () => {
    countdown.value = countdownSeconds
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        stopCountdown()
      }
    }, 1000)
  }

  // 停止倒计时
  const stopCountdown = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    countdown.value = 0
  }

  // 发送验证码
  const sendCode = async (phone: string): Promise<boolean> => {
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      uni.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }

    // 检查是否可以发送
    if (!canSend.value) {
      return false
    }

    try {
      codeSending.value = true
      await sendCodeApi(phone, codeType)

      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      startCountdown()
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '发送失败'
      logger.error('发送验证码失败', error)
      uni.showToast({
        title: errorMessage,
        icon: 'none'
      })
      return false
    } finally {
      codeSending.value = false
    }
  }

  // 重置状态
  const reset = () => {
    stopCountdown()
    codeSending.value = false
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopCountdown()
  })

  return {
    countdown,
    codeSending,
    codeButtonText,
    canSend,
    sendCode,
    reset
  }
}

export default useVerificationCode
