<template>
  <view class="register-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
    </view>

    <!-- 头部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#fff"></uni-icons>
        </view>
        <text class="nav-title">注册账号</text>
        <view class="nav-item"></view>
      </view>
    </view>

    <!-- 注册表单 -->
    <view class="register-form">
      <!-- 步骤指示器 -->
      <view class="step-indicator">
        <view
          class="step-item"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <view class="step-number">1</view>
          <text class="step-text">手机号</text>
        </view>
        <view class="step-line" :class="{ active: currentStep > 1 }"></view>
        <view
          class="step-item"
          :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
        >
          <view class="step-number">2</view>
          <text class="step-text">验证码</text>
        </view>
        <view class="step-line" :class="{ active: currentStep > 2 }"></view>
        <view
          class="step-item"
          :class="{ active: currentStep >= 3 }"
        >
          <view class="step-number">3</view>
          <text class="step-text">设置密码</text>
        </view>
      </view>

      <!-- 表单内容 -->
      <view class="form-content">
        <!-- 第一步：手机号 -->
        <view v-if="currentStep === 1" class="step-content">
          <view class="step-header">
            <text class="step-title">输入手机号</text>
            <text class="step-desc">用于登录和找回密码</text>
          </view>
          <view class="form-item">
            <uni-icons type="phone" size="20" color="#999"></uni-icons>
            <input
              class="input"
              type="number"
              v-model="registerData.phone"
              placeholder="请输入手机号"
              maxlength="11"
              @blur="validatePhone"
            />
            <view v-if="registerData.phone && isValidPhone" class="valid-icon">
              <uni-icons type="checkmarkempty" size="16" color="#67C23A"></uni-icons>
            </view>
          </view>
          <button
            class="next-btn"
            :class="{ disabled: !isValidPhone }"
            :disabled="!isValidPhone"
            @tap="nextStep"
          >
            下一步
          </button>
        </view>

        <!-- 第二步：验证码 -->
        <view v-else-if="currentStep === 2" class="step-content">
          <view class="step-header">
            <text class="step-title">输入验证码</text>
            <text class="step-desc">验证码已发送至 {{ maskedPhone }}</text>
          </view>
          <view class="form-item">
            <uni-icons type="chatbubble" size="20" color="#999"></uni-icons>
            <input
              class="input"
              type="number"
              v-model="registerData.verificationCode"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <button
              class="code-btn"
              :class="{ disabled: codeCountdown > 0 }"
              :disabled="codeCountdown > 0"
              @tap="sendVerificationCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '重新发送' }}
            </button>
          </view>
          <button
            class="next-btn"
            :class="{ disabled: !isValidCode }"
            :disabled="!isValidCode"
            @tap="nextStep"
          >
            下一步
          </button>
          <view class="resend-hint">
            <text class="hint-text">收不到验证码？</text>
            <text class="hint-link" @tap="changePhone">更换手机号</text>
          </view>
        </view>

        <!-- 第三步：设置密码 -->
        <view v-else class="step-content">
          <view class="step-header">
            <text class="step-title">设置密码</text>
            <text class="step-desc">请设置8-20位密码，包含字母和数字</text>
          </view>
          <view class="form-item">
            <uni-icons type="locked" size="20" color="#999"></uni-icons>
            <input
              class="input"
              :type="showPassword ? 'text' : 'password'"
              v-model="registerData.password"
              placeholder="请输入密码"
              @input="onPasswordInput"
            />
            <view class="toggle-btn" @tap="showPassword = !showPassword">
              <uni-icons
                :type="showPassword ? 'eye-filled' : 'eye-slash-filled'"
                size="20"
                color="#999"
              ></uni-icons>
            </view>
          </view>

          <!-- 密码强度指示器 -->
          <view class="password-strength" v-if="registerData.password">
            <view class="strength-bar">
              <view class="strength-fill" :class="passwordStrengthClass"></view>
            </view>
            <text class="strength-text">{{ passwordStrengthText }}</text>
          </view>

          <view class="form-item">
            <uni-icons type="locked" size="20" color="#999"></uni-icons>
            <input
              class="input"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="registerData.confirmPassword"
              placeholder="请确认密码"
            />
            <view class="toggle-btn" @tap="showConfirmPassword = !showConfirmPassword">
              <uni-icons
                :type="showConfirmPassword ? 'eye-filled' : 'eye-slash-filled'"
                size="20"
                color="#999"
              ></uni-icons>
            </view>
          </view>

          <view class="password-match" v-if="registerData.confirmPassword">
            <uni-icons
              :type="isPasswordMatch ? 'checkmarkempty' : 'closeempty'"
              size="16"
              :color="isPasswordMatch ? '#67C23A' : '#F56C6C'"
            ></uni-icons>
            <text class="match-text" :class="{ match: isPasswordMatch }">
              {{ isPasswordMatch ? '密码一致' : '密码不一致' }}
            </text>
          </view>

          <!-- 注册按钮 -->
          <button
            class="register-btn"
            :class="{ disabled: !canRegister }"
            :disabled="!canRegister || loading"
            :loading="loading"
            @tap="handleRegister"
          >
            立即注册
          </button>
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

      <!-- 快捷登录 -->
      <view class="quick-login">
        <text class="quick-login-text">已有账号？</text>
        <text class="link-text" @tap="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/auth';

const userStore = useUserStore();

// 注册数据
const registerData = ref({
  phone: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
});

// 状态
const currentStep = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreedToTerms = ref(false);
const loading = ref(false);
const codeCountdown = ref(0);

// 计算属性
const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(registerData.value.phone);
});

const isValidCode = computed(() => {
  return registerData.value.verificationCode.length === 6;
});

const isPasswordMatch = computed(() => {
  return registerData.value.password === registerData.value.confirmPassword;
});

const canRegister = computed(() => {
  return (
    agreedToTerms.value &&
    isValidPhone.value &&
    isValidCode.value &&
    registerData.value.password.length >= 8 &&
    registerData.value.password.length <= 20 &&
    isPasswordMatch.value &&
    passwordStrength.value >= 2
  );
});

const maskedPhone = computed(() => {
  if (!registerData.value.phone) return '';
  const phone = registerData.value.phone;
  return phone.substring(0, 3) + '****' + phone.substring(7);
});

const passwordStrength = computed(() => {
  const password = registerData.value.password;
  if (!password) return 0;

  let strength = 0;
  // 长度检查
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 包含数字
  if (/\d/.test(password)) strength++;
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 5);
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return '弱';
  if (strength <= 3) return '中';
  return '强';
});

// 页面加载
onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/profile/index' });
    return;
  }
});

// 验证手机号
const validatePhone = () => {
  if (registerData.value.phone && !isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
  }
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }

  try {
    await authApi.sendCode({
      phone: registerData.value.phone,
      code_type: 'register'
    });

    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    });

    // 开始倒计时
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);

  } catch (error) {
    uni.showToast({
      title: error.message || '发送失败',
      icon: 'none'
    });
  }
};

// 密码输入时检查
const onPasswordInput = () => {
  if (registerData.value.confirmPassword) {
    // 实时检查密码一致性
  }
};

// 下一步
const nextStep = () => {
  if (currentStep.value === 1 && isValidPhone.value) {
    currentStep.value = 2;
    // 自动发送验证码
    sendVerificationCode();
  } else if (currentStep.value === 2 && isValidCode.value) {
    currentStep.value = 3;
  }
};

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 更换手机号
const changePhone = () => {
  currentStep.value = 1;
  registerData.value.verificationCode = '';
};

// 处理注册
const handleRegister = async () => {
  if (!canRegister.value) return;

  loading.value = true;

  try {
    const result = await authApi.register({
      phone: registerData.value.phone,
      verification_code: registerData.value.verificationCode,
      password: registerData.value.password,
      platform: 'miniprogram'
    });

    // 保存用户信息
    userStore.setToken(result.token);
    userStore.setUserInfo(result.user);

    uni.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      uni.switchTab({ url: '/pages/profile/index' });
    }, 1500);

  } catch (error) {
    console.error('注册失败:', error);
    uni.showToast({
      title: error.message || '注册失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 去登录
const goToLogin = () => {
  uni.navigateBack();
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
</script>

<style>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
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
      width: 150rpx;
      height: 150rpx;
      top: -30rpx;
      right: -30rpx;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 100rpx;
      height: 100rpx;
      bottom: 200rpx;
      left: -20rpx;
      animation-delay: 2s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

// 头部
.header  { .nav-bar { display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10rpx);

    .nav-item { width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center; }.nav-title { font-size: 36rpx;
      font-weight: 600;
      color: #ffffff; } }
}

// 注册表单
.register-form {
  margin: 48rpx;
  position: relative;
  z-index: 1;

  // 步骤指示器
  .step-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 48rpx;
    padding: 32rpx;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    backdrop-filter: blur(10rpx);

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      flex: 1;

      .step-number {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
        transition: all 0.3s ease;
      }

      .step-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }

      &.active  { .step-number { background-color: #FF9F29;
          color: #ffffff;
          border: 2rpx solid #ffffff; }.step-text { color: #ffffff; } }

      &.completed  { .step-number { background-color: #67C23A;
          color: #ffffff; }.step-text { color: #67C23A; } }
    }

    .step-line {
      flex: 1;
      height: 2rpx;
      background-color: rgba(255, 255, 255, 0.3);
      margin: 0 16rpx;

      &.active {
        background-color: #FF9F29;
      }
    }
  }

  // 表单内容
  .form-content {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 24rpx;
    padding: 48rpx;
    backdrop-filter: blur(10rpx);

    .step-header {
      text-align: center;
      margin-bottom: 48rpx;

      .step-title {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 12rpx;
      }

      .step-desc {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    // 表单项
    .form-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      margin-bottom: 24rpx;
      background-color: #f8f8f8;
      border-radius: 16rpx;

      .input {
        flex: 1;
        margin-left: 16rpx;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
      }

      .valid-icon {
        margin-left: 16rpx;
      }

      .code-btn {
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        color: #FF9F29;
        background-color: transparent;
        border: 2rpx solid #FF9F29;
        border-radius: 25rpx;
        line-height: 1.2;
        margin-left: 16rpx;

        &.disabled {
          color: #ccc;
          border-color: #eee;
          background-color: #f5f5f5;
        }
      }

      .toggle-btn {
        padding: 8rpx;
      }
    }

    // 密码强度
    .password-strength {
      margin: 16rpx 0;

      .strength-bar {
        height: 6rpx;
        background-color: #f0f0f0;
        border-radius: 3rpx;
        overflow: hidden;
        margin-bottom: 8rpx;

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 3rpx;

          &.weak {
            width: 33%;
            background-color: #F56C6C;
          }

          &.medium {
            width: 66%;
            background-color: #E6A23C;
          }

          &.strong {
            width: 100%;
            background-color: #67C23A;
          }
        }
      }

      .strength-text {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    // 密码匹配
    .password-match {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-top: 16rpx;

      .match-text {
        font-size: 24rpx;
        color: #F56C6C;

        &.match {
          color: #67C23A;
        }
      }
    }

    // 按钮
    .next-btn,
    .register-btn {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      margin-top: 48rpx;
      border: none;
      box-shadow: 0 8rpx 24rpx rgba(255, 159, 41, 0.3);

      &.disabled {
        background: linear-gradient(135deg, #ccc 0%, #999 100%);
        box-shadow: none;
      }

      &::after {
        border: none;
      }
    }

    // 重发提示
    .resend-hint {
      text-align: center;
      margin-top: 24rpx;

      .hint-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
        margin-right: 8rpx;
      }

      .hint-link {
        font-size: 26rpx;
        color: #FF9F29;
      }
    }
  }

  // 协议
  .agreement {
    margin-top: 32rpx;
    padding: 24rpx;
    background-color: rgba(255, 255, 255, 0.1);
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

  // 快捷登录
  .quick-login {
    text-align: center;
    margin-top: 32rpx;

    .quick-login-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-right: 8rpx;
    }

    .link-text {
      font-size: 26rpx;
      color: #ffffff;
      font-weight: 500;
    }
  }
}
</style>