<template>
	<view class="bind-phone-page">
		<!-- 顶部说明 -->
		<view class="header">
			<image class="icon" src="/static/icons/phone-bind.png" mode="aspectFit" />
			<text class="title">绑定手机号</text>
			<text class="subtitle">为了您的账号安全，请绑定手机号</text>
		</view>

		<!-- 绑定表单 -->
		<view class="bind-form">
			<!-- 手机号输入 -->
			<view class="form-item">
				<view class="label">
					<text class="label-text">手机号</text>
					<text class="required">*</text>
				</view>
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

			<!-- 验证码输入 -->
			<view class="form-item">
				<view class="label">
					<text class="label-text">验证码</text>
					<text class="required">*</text>
				</view>
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

			<!-- 提示信息 -->
			<view class="tips">
				<view class="tip-item">
					<u-icon name="info" size="16" color="#FF9F29" />
					<text class="tip-text">绑定手机号后可使用手机号登录</text>
				</view>
				<view class="tip-item">
					<u-icon name="info" size="16" color="#FF9F29" />
					<text class="tip-text">手机号将用于接收订单通知和重要信息</text>
				</view>
			</view>

			<!-- 绑定按钮 -->
			<button class="bind-btn" :disabled="!canSubmit" @click="handleBind">
				{{ loading ? '绑定中...' : '确认绑定' }}
			</button>

			<!-- 跳过按钮 -->
			<button class="skip-btn" @click="handleSkip">暂不绑定</button>
		</view>

		<!-- 安全说明 -->
		<view class="security-info">
			<view class="info-title">
				<u-icon name="lock" size="16" color="#4CAF50" />
				<text class="title-text">安全保障</text>
			</view>
			<view class="info-list">
				<view class="info-item">
					<text class="dot">•</text>
					<text class="info-text">您的手机号仅用于账号安全验证</text>
				</view>
				<view class="info-item">
					<text class="dot">•</text>
					<text class="info-text">我们承诺不会泄露您的个人信息</text>
				</view>
				<view class="info-item">
					<text class="dot">•</text>
					<text class="info-text">您可以随时在设置中修改绑定手机号</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { bindPhone, sendCode } from '@/api/auth'
import { validatePhone } from '@/utils/validation'
import { VALIDATION_MESSAGES } from '@/constants/messages'

// 表单数据
const formData = ref({
	phone: '',
	code: ''
})

// 状态
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)

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
	const phoneValidation = validatePhone(formData.value.phone)
	return phoneValidation.valid && formData.value.code.length === 6
})

// 发送验证码
const handleSendCode = async () => {
	// 使用统一验证工具验证手机号
	const phoneValidation = validatePhone(formData.value.phone)
	if (!phoneValidation.valid) {
		uni.showToast({
			title: phoneValidation.message || VALIDATION_MESSAGES.INVALID_PHONE,
			icon: 'none'
		})
		return
	}

	try {
		codeSending.value = true
		await sendCode(formData.value.phone, 'bind')
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

// 绑定手机号
const handleBind = async () => {
	try {
		loading.value = true

		// 调用绑定接口
		await bindPhone({
			phone: formData.value.phone,
			code: formData.value.code
		})

		// 更新本地存储的用户信息
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo) {
			userInfo.phone = formData.value.phone
			uni.setStorageSync('userInfo', userInfo)
		}

		uni.showToast({
			title: '绑定成功',
			icon: 'success'
		})

		// 延迟跳转
		setTimeout(() => {
			// 获取来源页面
			const pages = getCurrentPages()
			if (pages.length > 1) {
				// 返回上一页
				uni.navigateBack()
			} else {
				// 跳转到首页
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}, 1500)
	} catch (error: any) {
		uni.showToast({
			title: error.message || '绑定失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 跳过绑定
const handleSkip = () => {
	uni.showModal({
		title: '提示',
		content: '暂不绑定手机号将无法进行预订等业务操作，确定要跳过吗？',
		confirmText: '确定跳过',
		cancelText: '继续绑定',
		success: (res) => {
			if (res.confirm) {
				// 跳转到首页
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}
	})
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
.bind-phone-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF8E1 0%, $uni-bg-color 50%);
	padding: 0 $uni-spacing-lg;
	padding-bottom: $uni-spacing-xl;
}

// 顶部说明
.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0 80rpx;

	.icon {
		width: 160rpx;
		height: 160rpx;
		margin-bottom: $uni-spacing-lg;
	}

	.title {
		font-size: $uni-font-size-xxl;
		font-weight: 800;
		color: $uni-text-color;
		margin-bottom: $uni-spacing-sm;
	}

	.subtitle {
		font-size: $uni-font-size-sm;
		color: $uni-text-color-placeholder;
		text-align: center;
	}
}

// 绑定表单
.bind-form {
	.form-item {
		margin-bottom: $uni-spacing-md;

		.label {
			display: flex;
			align-items: center;
			margin-bottom: $uni-spacing-sm;

			.label-text {
				font-size: $uni-font-size-base;
				color: $uni-text-color;
				font-weight: 500;
			}

			.required {
				color: $uni-color-error;
				margin-left: 4rpx;
			}
		}

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

	.tips {
		margin: $uni-spacing-lg 0 $uni-spacing-xl;
		padding: $uni-spacing-md;
		background: rgba(255, 159, 41, 0.08);
		border-radius: $uni-radius-md;

		.tip-item {
			display: flex;
			align-items: flex-start;
			gap: $uni-spacing-xs;
			margin-bottom: $uni-spacing-sm;

			&:last-child {
				margin-bottom: 0;
			}

			.tip-text {
				flex: 1;
				font-size: $uni-font-size-sm;
				color: $uni-text-color-secondary;
				line-height: 1.6;
			}
		}
	}

	.bind-btn {
		width: 100%;
		height: 96rpx;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		font-size: $uni-font-size-md;
		font-weight: 600;
		border-radius: $uni-radius-btn;
		border: none;
		margin-bottom: $uni-spacing-md;
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

	.skip-btn {
		width: 100%;
		height: 96rpx;
		background: transparent;
		color: $uni-text-color-secondary;
		font-size: $uni-font-size-base;
		border-radius: $uni-radius-btn;
		border: 2rpx solid $uni-border-color;
		transition: all 0.2s ease;

		&:active {
			background: $uni-bg-color-grey;
		}
	}
}

// 安全说明
.security-info {
	margin-top: 80rpx;
	padding: $uni-spacing-lg;
	background: $uni-bg-color-grey;
	border-radius: $uni-radius-lg;

	.info-title {
		display: flex;
		align-items: center;
		gap: $uni-spacing-xs;
		margin-bottom: $uni-spacing-md;

		.title-text {
			font-size: $uni-font-size-base;
			font-weight: 600;
			color: $uni-text-color;
		}
	}

	.info-list {
		.info-item {
			display: flex;
			align-items: flex-start;
			gap: $uni-spacing-xs;
			margin-bottom: $uni-spacing-sm;

			&:last-child {
				margin-bottom: 0;
			}

			.dot {
				color: $uni-color-success;
				font-size: $uni-font-size-sm;
				line-height: 1.6;
			}

			.info-text {
				flex: 1;
				font-size: $uni-font-size-sm;
				color: $uni-text-color-secondary;
				line-height: 1.6;
			}
		}
	}
}
</style>
