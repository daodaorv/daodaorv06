<template>
  <view class="password-page">
    <view class="tips">支付密码用于余额支付、提现等敏感操作，请设置6位数字密码。</view>
    <view class="form-box">
      <u-form ref="formRef" :model="formData" :rules="rules">
        <u-form-item label="当前密码" prop="oldPassword" required>
          <u-input v-model="formData.oldPassword" type="password" placeholder="未设置可留空" />
        </u-form-item>
        <u-form-item label="新支付密码" prop="newPassword" required>
          <u-input v-model="formData.newPassword" type="password" placeholder="6位数字" maxlength="6" />
        </u-form-item>
        <u-form-item label="确认密码" prop="confirmPassword" required>
          <u-input v-model="formData.confirmPassword" type="password" placeholder="再次输入6位数字" maxlength="6" />
        </u-form-item>
      </u-form>
    </view>

    <view class="btn-box">
      <button class="submit-btn" :loading="submitting" @tap="handleSubmit">确认设置</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formRef = ref<any>(null)
const submitting = ref(false)
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const numberPattern = /^\d{6}$/

const validateConfirm = (rule: any, value: string, callback: (error?: string) => void) => {
  if (value !== formData.value.newPassword) {
    callback('两次密码输入不一致')
  } else {
    callback()
  }
}

const rules = {
  newPassword: {
    rules: [
      { required: true, errorMessage: '请输入6位数字密码' },
      { pattern: numberPattern, errorMessage: '支付密码必须为6位数字' }
    ]
  },
  confirmPassword: {
    rules: [
      { required: true, errorMessage: '请确认支付密码' },
      { validator: validateConfirm }
    ]
  }
}

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    submitting.value = true
    setTimeout(() => {
      submitting.value = false
      uni.showToast({ title: '设置成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    }, 1000)
  }).catch(() => {
    uni.showToast({ title: '请完善信息', icon: 'none' })
  })
}
</script>

<style scoped lang="scss">
.password-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding: $uni-spacing-xl;
}

.tips {
  background-color: rgba($uni-color-success, 0.1);
  color: $uni-color-success;
  padding: $uni-spacing-lg $uni-spacing-xl;
  border-radius: $uni-radius-md;
  font-size: $uni-font-size-sm;
  line-height: 1.6;
}

.form-box {
  margin-top: $uni-spacing-xl;
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.btn-box {
  margin: 60rpx $uni-spacing-xl;
}

.submit-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  border-radius: $uni-radius-btn;
  height: 88rpx;
  line-height: 88rpx;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &::after {
    border: none;
  }
}
</style>
