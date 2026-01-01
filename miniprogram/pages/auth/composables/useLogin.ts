/**
 * 登录逻辑 Composable
 * 负责各种登录方式的处理
 */

import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { VALIDATION_MESSAGES } from '@/constants/validation';

export function useLogin() {
  const userStore = useUserStore();
  const loading = ref(false);

  /**
   * 手机号验证码登录
   */
  const loginWithPhoneCode = async (phone: string, code: string): Promise<boolean> => {
    if (!phone) {
      uni.showToast({
        title: VALIDATION_MESSAGES.PHONE_REQUIRED,
        icon: 'none'
      });
      return false;
    }

    if (!code) {
      uni.showToast({
        title: VALIDATION_MESSAGES.CODE_REQUIRED,
        icon: 'none'
      });
      return false;
    }

    loading.value = true;

    try {
      // TODO: 调用登录 API
      const success = await userStore.doLogin(phone, code);

      if (success) {
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        return true;
      }

      uni.showToast({
        title: '登录失败',
        icon: 'none'
      });
      return false;
    } catch (error) {
      uni.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 手机号密码登录
   */
  const loginWithPhonePassword = async (phone: string, password: string): Promise<boolean> => {
    if (!phone) {
      uni.showToast({
        title: VALIDATION_MESSAGES.PHONE_REQUIRED,
        icon: 'none'
      });
      return false;
    }

    if (!password) {
      uni.showToast({
        title: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        icon: 'none'
      });
      return false;
    }

    loading.value = true;

    try {
      const success = await userStore.doLogin(phone, password);

      if (success) {
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        return true;
      }

      return false;
    } catch (error) {
      uni.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 用户名密码登录
   */
  const loginWithUsername = async (username: string, password: string): Promise<boolean> => {
    if (!username) {
      uni.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return false;
    }

    if (!password) {
      uni.showToast({
        title: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        icon: 'none'
      });
      return false;
    }

    loading.value = true;

    try {
      // TODO: 调用用户名登录 API
      const success = await userStore.doLogin(username, password);

      if (success) {
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        return true;
      }

      return false;
    } catch (error) {
      uni.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    loginWithPhoneCode,
    loginWithPhonePassword,
    loginWithUsername
  };
}
