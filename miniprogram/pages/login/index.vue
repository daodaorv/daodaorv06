<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">叨叨房车</text>
      <text class="app-slogan">让房车旅行更简单</text>
    </view>

    <!-- 登录表单容器 -->
    <view class="login-form-container">
      <uni-card class="login-form" :padding="'32rpx'">
        <!-- 登录方式选择 -->
        <view class="login-methods">
          <view
            class="method-item"
            :class="{ active: loginMethod === 'wechat' }"
            @tap="switchLoginMethod('wechat')"
          >
            <uni-icons type="weixin" size="24" color="#09BB07"></uni-icons>
            <text class="method-text">微信登录</text>
          </view>
          <view
            class="method-item"
            :class="{ active: loginMethod === 'phone' }"
            @tap="switchLoginMethod('phone')"
          >
            <uni-icons type="phone" size="24" color="#FF9F29"></uni-icons>
            <text class="method-text">手机登录</text>
          </view>
        </view>

        <!-- 微信登录 -->
        <view v-if="loginMethod === 'wechat'" class="wechat-login">
          <view class="wechat-info">
            <uni-icons type="info" size="20" color="#999"></uni-icons>
            <text class="info-text">使���微信账号快速登录</text>
          </view>
          <uni-button
            type="success"
            size="default"
            text="微信一键登录"
            :loading="loading"
            @click="wechatLogin"
          />
        </view>

        <!-- 手机号登录 -->
        <view v-else class="phone-login">
          <!-- Tab切换 -->
          <view class="login-tabs">
            <view
              class="tab-item"
              :class="{ active: loginType === 'code' }"
              @tap="switchLoginType('code')"
            >
              <text>验证码登录</text>
            </view>
            <view
              class="tab-item"
              :class="{ active: loginType === 'password' }"
              @tap="switchLoginType('password')"
            >
              <text>密码登录</text>
            </view>
          </view>

          <!-- 登录表单 -->
          <AuthForm
            :login-type="loginType"
            :phone="phone"
            :verification-code="verificationCode"
            :password="password"
            :show-password="showPassword"
            :code-countdown="codeCountdown"
            :is-valid-phone="isValidPhone"
            @update:phone="phone = $event"
            @update:verification-code="verificationCode = $event"
            @update:password="password = $event"
            @update:show-password="showPassword = $event"
            @send-code="sendCode"
            @validate-phone="validatePhone"
          />

          <!-- 登录按钮 -->
          <uni-button
            type="primary"
            size="default"
            :text="loginType === 'code' ? '验证码登录' : '密码登录'"
            :disabled="!canLogin"
            :loading="loading"
            @click="handleLogin"
          />

          <!-- 忘记密码 -->
          <view v-if="loginType === 'password'" class="forgot-password">
            <text class="forgot-text" @tap="forgotPassword">忘记密码？</text>
          </view>
        </view>

        <!-- 注册链接 -->
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link-text" @tap="goToRegister">立即注册</text>
        </view>

        <!-- 第三方登录 -->
        <view class="third-party-login">
          <view class="divider">
            <view class="divider-line"></view>
            <text class="divider-text">其他登录方式</text>
            <view class="divider-line"></view>
          </view>
          <view class="third-party-buttons">
            <view class="third-party-btn" @tap="loginByQQ">
              <uni-icons type="qq" size="24" color="#1296db"></uni-icons>
              <text class="btn-text">QQ</text>
            </view>
            <view class="third-party-btn" @tap="loginByApple">
              <uni-icons type="apple-filled" size="24" color="#000"></uni-icons>
              <text class="btn-text">Apple</text>
            </view>
          </view>
        </view>

        <!-- 协议 -->
        <view class="agreement">
          <checkbox-group @change="onAgreementChange">
            <label>
              <checkbox :checked="agreedToTerms" :color="'#FF9F29'" />
              <text class="agreement-text">我已阅读并同意</text>
              <text class="link-text" @tap.stop="showUserAgreement">《用户协议》</text>
              <text class="agreement-text">和</text>
              <text class="link-text" @tap.stop="showPrivacyPolicy">《隐私政策》</text>
            </label>
          </checkbox-group>
        </view>
      </uni-card>
    </view>

    <!-- 快捷登录提示 -->
    <view v-if="showQuickLogin" class="quick-login-toast">
      <view class="toast-content">
        <uni-icons type="info" size="16" color="#FF9F29"></uni-icons>
        <text class="toast-text">首次登录自动注册账号</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
// 导入组件 - 使用easycom自动导入，无需手动引入
// import AuthForm from '@/components/form/AuthForm.vue';

// 登录方式
const loginMethod = ref('phone'); // 'wechat' or 'phone'
const loginType = ref('code'); // 'code' or 'password'

// 表单数据
const phone = ref('');
const password = ref('');
const verificationCode = ref('');
const showPassword = ref(false);
const agreedToTerms = ref(false);
const loading = ref(false);
const codeCountdown = ref(0);
const showQuickLogin = ref(false);

// 计算属性
const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value);
});

const canLogin = computed(() => {
  if (!agreedToTerms.value) return false;
  if (!isValidPhone.value) return false;

  if (loginType.value === 'code') {
    return verificationCode.value.length === 6;
  } else {
    return password.value.length >= 6;
  }
});

// 页面加载
onMounted(() => {
  // 检查是否已登录
  const token = uni.getStorageSync('token');
  if (token) {
    uni.switchTab({ url: '/pages/profile/index' });
    return;
  }

  // 3秒后显示快捷登录提示
  setTimeout(() => {
    showQuickLogin.value = true;
    setTimeout(() => {
      showQuickLogin.value = false;
    }, 3000);
  }, 1000);
});

let countdownTimer = null;

// 切换登录方式
const switchLoginMethod = (method) => {
  loginMethod.value = method;

  // 重置表单状态
  resetForm();

  // 微信登录时自动勾选协议
  if (method === 'wechat') {
    agreedToTerms.value = true;
  }
};

// 切换登录类型
const switchLoginType = (type) => {
  loginType.value = type;
  // 清空验证码和密码
  verificationCode.value = '';
  password.value = '';
};

// 验证手机号
const validatePhone = () => {
  if (phone.value && !isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
  }
};

// 微信登录
const wechatLogin = async () => {
  if (!agreedToTerms.value) {
    uni.showToast({
      title: '请同意用户协议和隐私政策',
      icon: 'none'
    });
    return;
  }

  try {
    loading.value = true;

    // 获取微信登录授权
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });

    // 获取用户信息
    const userInfoRes = await new Promise((resolve, reject) => {
      uni.getUserInfo({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });

    // 调用后端微信登录接口
    console.log('微信登录数据:', { loginRes, userInfoRes });

    // 模拟登录成功
    const mockResult = {
      token: 'mock_wechat_token_' + Date.now(),
      user: {
        id: 1,
        nickname: userInfoRes.userInfo.nickName || '微信用户',
        phone: '',
        avatarUrl: userInfoRes.userInfo.avatarUrl || '/static/default-avatar.png',
        isVerified: false
      }
    };

    // 保存用户信息
    uni.setStorageSync('token', mockResult.token);
    uni.setStorageSync('userInfo', mockResult.user);

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      uni.switchTab({ url: '/pages/profile/index' });
    }, 1500);

  } catch (error) {
    console.error('微信登录失败:', error);

    if (error.errMsg && error.errMsg.includes('getUserInfo:fail')) {
      // 用户拒绝授权
      uni.showModal({
        title: '提示',
        content: '需要获取您的微信信息才能完成登录',
        confirmText: '重新授权',
        success: (res) => {
          if (res.confirm) {
            wechatLogin();
          }
        }
      });
    } else {
      uni.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
  } finally {
    loading.value = false;
  }
};

// QQ登录
const loginByQQ = () => {
  uni.showToast({
    title: 'QQ登录功能开发中',
    icon: 'none'
  });
};

// Apple登录
const loginByApple = () => {
  uni.showToast({
    title: 'Apple登录功能开发中',
    icon: 'none'
  });
};

// 发送验证码
const sendCode = async () => {
  if (!isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }

  try {
    // 调用API发送验证码
    console.log('发送验证码到:', phone.value);

    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    });

    // 开始倒计时
    codeCountdown.value = 60;
    countdownTimer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (error) {
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    });
  }
};

// 处理登录
const handleLogin = async () => {
  if (!canLogin.value) return;

  loading.value = true;

  try {
    // 调用API进行登录
    console.log('登录数据:', {
      phone: phone.value,
      loginType: loginType.value,
      verificationCode: verificationCode.value,
      password: password.value
    });

    // 模拟登录成功
    const mockResult = {
      token: 'mock_phone_token_' + Date.now(),
      user: {
        id: 1,
        nickname: '用户' + phone.value.slice(-4),
        phone: phone.value,
        avatarUrl: '/static/default-avatar.png',
        isVerified: false
      }
    };

    // 保存用户信息
    uni.setStorageSync('token', mockResult.token);
    uni.setStorageSync('userInfo', mockResult.user);

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      // 检查是否有返回页面
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({ url: '/pages/profile/index' });
      }
    }, 1500);

  } catch (error) {
    console.error('登录失败:', error);
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 忘记密码
const forgotPassword = () => {
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  });
};

// 注册
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  });
};

// 协议变更
const onAgreementChange = (e) => {
  agreedToTerms.value = e.detail.value.length > 0;
};

// 显示用户协议
const showUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/auth/agreement?type=user'
  });
};

// 显示隐私政策
const showPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/auth/agreement?type=privacy'
  });
};

// 重置表单
const resetForm = () => {
  verificationCode.value = '';
  password.value = '';
  showPassword.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    codeCountdown.value = 0;
  }
};

// 页面卸载时清理
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style>
// 导入统一变量文件
// 色彩系统
#FF9F29: #FF9F29;
#67C23A: #67C23A;
#FF4D4F: #FF4D4F;
#4B91FF: #4B91FF;
#F6AD55: #F6AD55;
#333333: #1A1A1A;
#666666: #667085;
#999999: #98A1B2;
#F8F8F8: #F7F8FA;
#FFFFFF: #FFFFFF;
#E8E8E8: #EEF0F3;

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;

    &.circle-1 {
      width: 200rpx;
      height: 200rpx;
      top: -50rpx;
      right: -50rpx;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 150rpx;
      height: 150rpx;
      top: 300rpx;
      left: -30rpx;
      animation-delay: 2s;
    }

    &.circle-3 {
      width: 100rpx;
      height: 100rpx;
      bottom: 200rpx;
      right: 100rpx;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

// Logo区域
.logo-section {
  text-align: center;
  padding: 100rpx 0 60rpx;
  position: relative;
  z-index: 1;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 24rpx;
  }

  .app-name {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  }

  .app-slogan {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 登录表单容器
.login-form-container {
  margin: 0 48rpx 40rpx;
  position: relative;
  z-index: 1;

  .login-form {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10rpx);
  }
}

// 登录方式选择
.login-methods {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50rpx;
  padding: 8rpx;
  margin-bottom: 48rpx;

  .method-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 20rpx 0;
    border-radius: 42rpx;
    transition: all 0.3s ease;

    .method-text {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }

    &.active {
      background: rgba(255, 255, 255, 0.2);

      .method-text {
        color: #ffffff;
        font-weight: 500;
      }
    }
  }
}

// 微信登录
.wechat-login  { .wechat-info { display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 32rpx;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12rpx;

    .info-text { font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8); } }
}

// 手机号登录
.phone-login {
  // Tab切换
  .login-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50rpx;
    padding: 8rpx;
    margin-bottom: 48rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 20rpx 0;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      border-radius: 42rpx;
      transition: all 0.3s ease;

      &.active {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        font-weight: 500;
      }
    }
  }

  // 忘记密码
  .forgot-password {
    text-align: right;
    margin-top: 24rpx;

    .forgot-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 注册链接
.register-link {
  text-align: center;
  margin-top: 48rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);

  .link-text {
    color: #ffffff;
    font-weight: 500;
    margin-left: 8rpx;
  }
}

// 第三方登录
.third-party-login {
  margin-top: 60rpx;

  .divider {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 32rpx;

    .divider-line {
      flex: 1;
      height: 2rpx;
      background: rgba(255, 255, 255, 0.3);
    }

    .divider-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .third-party-buttons {
    display: flex;
    justify-content: center;
    gap: 48rpx;

    .third-party-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      padding: 24rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16rpx;
      min-width: 120rpx;

      .btn-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

// 协议
.agreement {
  margin-top: 48rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;

  label {
    display: flex;
    align-items: center;
    font-size: 24rpx;

    .agreement-text {
      color: rgba(255, 255, 255, 0.8);
      margin: 0 6rpx;
    }

    .link-text {
      color: #ffffff;
      text-decoration: underline;
    }
  }
}

// 快捷登录提示
.quick-login-toast {
  position: fixed;
  top: 160rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.5s ease;

  .toast-content {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx 24rpx;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 25rpx;
    backdrop-filter: blur(10rpx);

    .toast-text {
      font-size: 24rpx;
      color: #ffffff;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>