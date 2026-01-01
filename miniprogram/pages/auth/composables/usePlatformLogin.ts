/**
 * 平台登录 Composable
 * 负责微信/支付宝/抖音等平台的一键登录
 */

import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';

export type PlatformType = 'weixin' | 'alipay' | 'douyin';

/**
 * 微信手机号授权事件
 */
interface WechatPhoneNumberEvent {
  detail: {
    errMsg: string;
    code?: string;
    encryptedData?: string;
    iv?: string;
  };
}

export function usePlatformLogin() {
  const userStore = useUserStore();
  const loading = ref(false);
  const platform = ref<PlatformType>('weixin');

  /**
   * 检测当前平台
   */
  const detectPlatform = (): PlatformType => {
    // #ifdef MP-WEIXIN
    return 'weixin';
    // #endif

    // #ifdef MP-ALIPAY
    return 'alipay';
    // #endif

    // #ifdef MP-TOUTIAO
    return 'douyin';
    // #endif

    return 'weixin';
  };

  /**
   * 一键登录按钮文本
   */
  const oneClickLoginText = computed(() => {
    const platformNames: Record<PlatformType, string> = {
      weixin: '微信一键登录',
      alipay: '支付宝一键登录',
      douyin: '抖音一键登录'
    };
    return platformNames[platform.value];
  });

  /**
   * 微信手机号登录
   */
  const handleWechatPhoneLogin = async (event: WechatPhoneNumberEvent): Promise<boolean> => {
    if (event.detail.errMsg !== 'getPhoneNumber:ok') {
      uni.showToast({
        title: '获取手机号失败',
        icon: 'none'
      });
      return false;
    }

    loading.value = true;

    try {
      const { code, encryptedData, iv } = event.detail;
      // TODO: 调用后端解密手机号并登录
      const success = await userStore.doWechatLogin(code, { encryptedData, iv });

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
   * 支付宝一键登录
   */
  const handleAlipayLogin = async (): Promise<boolean> => {
    loading.value = true;

    try {
      // 获取支付宝授权码
      const authResult = await new Promise<any>((resolve, reject) => {
        uni.login({
          provider: 'alipay',
          success: resolve,
          fail: reject
        });
      });

      if (!authResult.code) {
        throw new Error('获取授权码失败');
      }

      // TODO: 调用后端登录接口
      const success = await userStore.doWechatLogin(authResult.code);

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
   * 抖音一键登录
   */
  const handleDouyinLogin = async (): Promise<boolean> => {
    loading.value = true;

    try {
      // 获取抖音授权码
      const authResult = await new Promise<any>((resolve, reject) => {
        uni.login({
          provider: 'toutiao',
          success: resolve,
          fail: reject
        });
      });

      if (!authResult.code) {
        throw new Error('获取授权码失败');
      }

      // TODO: 调用后端登录接口
      const success = await userStore.doWechatLogin(authResult.code);

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
   * 统一的一键登录处理
   */
  const handleOneClickLogin = async (): Promise<boolean> => {
    const handlers: Record<PlatformType, () => Promise<boolean>> = {
      weixin: async () => {
        uni.showToast({
          title: '请使用按钮授权',
          icon: 'none'
        });
        return false;
      },
      alipay: handleAlipayLogin,
      douyin: handleDouyinLogin
    };

    return handlers[platform.value]();
  };

  // 初始化时检测平台
  platform.value = detectPlatform();

  return {
    platform,
    loading,
    oneClickLoginText,
    handleWechatPhoneLogin,
    handleOneClickLogin
  };
}
