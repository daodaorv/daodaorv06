<!-- 认证表单组件 -->
<template>
  <view class="auth-form">
    <!-- 手机号输入 -->
    <view class="form-item">
      <uni-icons type="phone" size="20" color="#999"></uni-icons>
      <input
        class="form-input"
        type="number"
        :value="phone"
        placeholder="请输入手机号"
        maxlength="11"
        @input="handlePhoneInput"
        @blur="validatePhone"
      />
      <view v-if="phone && isValidPhone" class="valid-icon">
        <uni-icons type="checkmarkempty" size="16" color="#67C23A"></uni-icons>
      </view>
    </view>

    <!-- 验证码登录 -->
    <view v-if="loginType === 'code'" class="form-item">
      <uni-icons type="chatbubble" size="20" color="#999"></uni-icons>
      <input
        class="form-input"
        type="number"
        :value="verificationCode"
        placeholder="请输入验证码"
        maxlength="6"
        @input="handleCodeInput"
      />
      <button
        class="code-btn"
        :class="{ disabled: !isValidPhone || codeCountdown > 0 }"
        :disabled="!isValidPhone || codeCountdown > 0"
        @click="sendCode"
      >
        {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码' }}
      </button>
    </view>

    <!-- 密码登录 -->
    <view v-else class="form-item">
      <uni-icons type="locked" size="20" color="#999"></uni-icons>
      <input
        class="form-input"
        :type="showPassword ? 'text' : 'password'"
        :value="password"
        placeholder="请输入密码"
        @input="handlePasswordInput"
      />
      <view class="password-actions">
        <view v-if="password" class="toggle-btn" @click="togglePassword">
          <uni-icons
            :type="showPassword ? 'eye-filled' : 'eye-slash-filled'"
            size="20"
            color="#999"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface AuthFormProps {
  /** 登录类型 */
  loginType: 'code' | 'password';
  /** 手机号 */
  phone: string;
  /** 验证码 */
  verificationCode: string;
  /** 密码 */
  password: string;
  /** 是否显示密码 */
  showPassword: boolean;
  /** 验证码倒计时 */
  codeCountdown: number;
  /** 手机号是否有效 */
  isValidPhone: boolean;
}

interface AuthFormEmits {
  (e: 'update:phone', value: string): void;
  (e: 'update:verificationCode', value: string): void;
  (e: 'update:password', value: string): void;
  (e: 'update:showPassword', value: boolean): void;
  (e: 'send-code'): void;
  (e: 'validate-phone'): void;
}

const props = defineProps<AuthFormProps>();
const emit = defineEmits<AuthFormEmits>();

// 计算属性
const canSendCode = computed(() => {
  return props.isValidPhone && props.codeCountdown === 0;
});

// 处理手机号输入
const handlePhoneInput = (e: any) => {
  emit('update:phone', e.detail.value);
};

// 处理验证码输入
const handleCodeInput = (e: any) => {
  emit('update:verificationCode', e.detail.value);
};

// 处理密码输入
const handlePasswordInput = (e: any) => {
  emit('update:password', e.detail.value);
};

// 切换密码显示状态
const togglePassword = () => {
  emit('update:showPassword', !props.showPassword);
};

// 发送验证码
const sendCode = () => {
  if (!canSendCode.value) return;
  emit('send-code');
};

// 验证手机号
const validatePhone = () => {
  emit('validate-phone');
};
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

.auth-form {
  // 表单项
  .form-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    margin-bottom: 24rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16rpx;
    backdrop-filter: blur(10rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    .hover {
      background: rgba(255, 255, 255, 1);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .form-input {
      flex: 1;
      margin-left: 16rpx;
      font-size: 28rpx;
      color: #333333;
      background: transparent;
      border: none;
      outline: none;

      &::placeholder {
        color: #999999;
      }
    }

    .valid-icon {
      margin-left: 16rpx;
    }

    .code-btn {
      padding: 12rpx 24rpx;
      font-size: 24rpx;
      color: #FF9F29;
      background: transparent;
      border: 2rpx solid #FF9F29;
      border-radius: 25rpx;
      line-height: 1.2;
      margin-left: 16rpx;
      min-width: 160rpx;
      transition: all 0.3s ease;

      &.disabled {
        color: #999999;
        border-color: #E8E8E8;
        background: #F8F8F8;
        cursor: not-allowed;
      }

      .not(.disabled):active {
        background: #FF9F29;
        color: #FFFFFF;
      }
    }

    .password-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .toggle-btn {
        padding: 8rpx;
        border-radius: 8rpx;
        transition: background-color 0.2s ease;

        .active {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
}
</style>