/**
 * 短信验证码 Composable
 * 负责验证码发送和倒计时逻辑
 */

import { ref, computed } from 'vue';
import { VALIDATION } from '@/constants/validation';

export function useSmsCode() {
  const codeSending = ref(false);
  const countdown = ref(0);
  let timer: number | null = null;

  /**
   * 验证码按钮文本
   */
  const codeButtonText = computed(() => {
    if (codeSending.value) {
      return '发送中...';
    }
    if (countdown.value > 0) {
      return `${countdown.value}秒后重试`;
    }
    return '获取验证码';
  });

  /**
   * 开始倒计时
   */
  const startCountdown = () => {
    countdown.value = VALIDATION.CODE_COUNTDOWN;

    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        stopCountdown();
      }
    }, 1000) as unknown as number;
  };

  /**
   * 停止倒计时
   */
  const stopCountdown = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    countdown.value = 0;
  };

  /**
   * 发送验证码
   */
  const sendCode = async (phone: string): Promise<boolean> => {
    if (!phone || !VALIDATION.PHONE_REGEX.test(phone)) {
      uni.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return false;
    }

    if (codeSending.value || countdown.value > 0) {
      return false;
    }

    codeSending.value = true;

    try {
      // TODO: 调用发送验证码 API
      // await sendSmsCode(phone);

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      startCountdown();
      return true;
    } catch (error) {
      uni.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      });
      return false;
    } finally {
      codeSending.value = false;
    }
  };

  /**
   * 清理定时器
   */
  const cleanup = () => {
    stopCountdown();
  };

  return {
    codeSending,
    countdown,
    codeButtonText,
    sendCode,
    cleanup
  };
}
