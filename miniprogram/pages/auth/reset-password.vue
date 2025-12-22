<template>
	<view class="reset-password-page">
		<!-- 顶部 -->
		<view class="header">
			<text class="title">重置密码</text>
			<text class="subtitle">请输入手机号验证身份</text>
		</view>

		<!-- 重置表单 -->
		<view class="reset-form">
			<!-- 手机号 -->
			<view class="form-item">
				<view class="input-wrapper">
					<u-icon name="phone" size="20" color="#999999" />
					<input
						v-model="formData.phone"
						name="number"
						maxlength="11"
						placeholder="请输入手机号"
						class="input"
					/>
				</view>
			</view>

			<!-- 验证码 -->
			<view class="form-item">
				<view class="input-wrapper">
					<u-icon name="chat" size="20" color="#999999" />
					<input
						v-model="formData.code"
						name="number"
						maxlength="6"
						placeholder="请输入验证码"
						class="input"
					/>
					<button
						class="code-btn"
						:disabled="codeSending || countdown > 0"
						@click="handleSendCode"
					>
						{{ codeButtonText }}
					</button>
				</view>
			</view>

			<!-- 新密码 -->
			<view class="form-item">
				<view class="input-wrapper">
					<u-icon name="lock" size="20" color="#999999" />
					<input
						v-model="formData.newPassword"
						:password="!showPassword"
						placeholder="请输入新密码（6-20位）"
						class="input"
					/>
					<u-icon
						:name="showPassword ? 'eye-fill' : 'eye-off'"
						size="20"
						color="#999999"
						@click="showPassword = !showPassword"
					/>
				</view>
			</view>

			<!-- 确认密码 -->
			<view class="form-item">
				<view class="input-wrapper">
					<u-icon name="lock" size="20" color="#999999" />
					<input
						v-model="formData.confirmPassword"
						:password="!showConfirmPassword"
						placeholder="请再次输入新密码"
						class="input"
					/>
					<u-icon
						:name="showConfirmPassword ? 'eye-fill' : 'eye-off'"
						size="20"
						color="#999999"
						@click="showConfirmPassword = !showConfirmPassword"
					/>
				</view>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
				{{ loading ? '提交中...' : '确认重置' }}
			</button>

			<!-- 返回登录 -->
			<view class="back-tip">
				<text class="link-text" @click="goToLogin">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { sendCode } from '@/api/auth'

// 表单数据
const formData = ref({
	phone: '',
	code: '',
	newPassword: '',
	confirmPassword: ''
})

// 状态
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 定时器引用（用于页面卸载时清理）
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 验证码按钮文本
const codeButtonText = computed(() => {
	if (codeSending.value) return '发送中...'
	if (countdown.value > 0) return `${countdown.value}s`
	return '获取验证码'
})

// 是否可以提交
const canSubmit = computed(() => {
	return (
		formData.value.phone.length === 11 &&
		formData.value.code.length === 6 &&
		formData.value.newPassword.length >= 6 &&
		formData.value.newPassword.length <= 20 &&
		formData.value.confirmPassword === formData.value.newPassword
	)
})

// 发送验证码
const handleSendCode = async () => {
	if (!formData.value.phone || formData.value.phone.length !== 11) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	try {
		codeSending.value = true
		await sendCode(formData.value.phone, 'register')
		uni.showToast({
			title: '验证码已发送',
			icon: 'success'
		})

		// 开始倒计时
		countdown.value = 60
		countdownTimer = setInterval(() => {
			countdown.value--
			if (countdown.value <= 0) {
				if (countdownTimer) {
					clearInterval(countdownTimer)
					countdownTimer = null
				}
			}
		}, 1000)
	} catch (error: any) {
		uni.showToast({
			title: error.message || '发送失败',
			icon: 'none'
		})
	} finally {
		codeSending.value = false
	}
}

// 提交重置
const handleSubmit = async () => {
	// 验证两次密码是否一致
	if (formData.value.newPassword !== formData.value.confirmPassword) {
		uni.showToast({
			title: '两次密码输入不一致',
			icon: 'none'
		})
		return
	}

	try {
		loading.value = true

		// Mock: 模拟重置密码
		await new Promise((resolve) => setTimeout(resolve, 1000))

		uni.showToast({
			title: '密码重置成功',
			icon: 'success'
		})

		// 延迟跳转到登录页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	} catch (error: any) {
		uni.showToast({
			title: error.message || '重置失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 返回登录
const goToLogin = () => {
	uni.navigateBack()
}

// 页面卸载时清理定时器
onUnmounted(() => {
	if (countdownTimer) {
		clearInterval(countdownTimer)
		countdownTimer = null
	}
})
</script>

<style lang="scss" scoped>
.reset-password-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF8E1 0%, $uni-bg-color 50%);
	padding: 0 $uni-spacing-lg;
}

.header {
	padding: 120rpx 0 80rpx;

	.title {
		display: block;
		font-size: $uni-font-size-xxl;
		font-weight: 800;
		color: $uni-text-color;
		margin-bottom: $uni-spacing-sm;
	}

	.subtitle {
		display: block;
		font-size: $uni-font-size-sm;
		color: $uni-text-color-placeholder;
	}
}

.reset-form {
	.form-item {
		margin-bottom: $uni-spacing-md;

		.input-wrapper {
			display: flex;
			align-items: center;
			gap: $uni-spacing-sm;
			padding: $uni-spacing-md $uni-spacing-lg;
			background: $uni-bg-color-card;
			border-radius: $uni-radius-lg;
			box-shadow: $uni-shadow-card;
			transition: box-shadow 0.2s ease;

			&:focus-within {
				box-shadow: $uni-shadow-float;
			}

			.input {
				flex: 1;
				font-size: $uni-font-size-base;
				color: $uni-text-color;
			}

			.code-btn {
				padding: $uni-spacing-xs $uni-spacing-md;
				background: $uni-color-primary;
				color: $uni-text-color-inverse;
				font-size: $uni-font-size-sm;
				border-radius: $uni-radius-sm;
				border: none;
				line-height: 1.5;
				font-weight: 500;
				transition: opacity 0.2s ease;

				&:active {
					opacity: 0.8;
				}

				&[disabled] {
					background: $uni-border-color;
					color: $uni-text-color-placeholder;
				}
			}
		}
	}

	.submit-btn {
		width: 100%;
		height: 96rpx;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		font-size: $uni-font-size-md;
		font-weight: 600;
		border-radius: $uni-radius-btn;
		border: none;
		margin-top: $uni-spacing-sm;
		margin-bottom: $uni-spacing-lg;
		box-shadow: $uni-shadow-glow;
		transition: transform 0.2s ease, opacity 0.2s ease;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&[disabled] {
			background: $uni-border-color;
			box-shadow: none;
		}
	}

	.back-tip {
		text-align: center;
		font-size: $uni-font-size-sm;
	}
}

.link-text {
	color: $uni-color-primary;
	font-weight: 500;
}
</style>
