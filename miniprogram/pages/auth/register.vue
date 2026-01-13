<template>
	<view class="register-page">
		<!-- 顶部标题 -->
		<view class="header">
			<text class="title">注册账号</text>
			<text class="subtitle">欢迎加入叨叨房车</text>
		</view>

		<!-- 注册表单 -->
		<view class="register-form">
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

			<!-- 密码输入 -->
			<view class="form-item">
				<view class="label">
					<text class="label-text">设置密码</text>
					<text class="optional">（可选）</text>
				</view>
				<view class="input-wrapper">
					<u-icon name="lock" size="20" color="#999999" />
					<input
						v-model="formData.password"
						:password="!showPassword"
						placeholder="6-20位字母、数字或符号"
						class="input"
					/>
					<u-icon
						:name="showPassword ? 'eye-fill' : 'eye-off'"
						size="20"
						color="#999999"
						@click="showPassword = !showPassword"
					/>
				</view>
				<view class="hint">设置密码后可使用密码登录</view>
			</view>

			<!-- 昵称输入 -->
			<view class="form-item">
				<view class="label">
					<text class="label-text">昵称</text>
					<text class="optional">（可选）</text>
				</view>
				<view class="input-wrapper">
					<u-icon name="account-fill" size="20" color="#999999" />
					<input
						v-model="formData.nickname"
						maxlength="20"
						placeholder="请输入昵称"
						class="input"
					/>
				</view>
			</view>

			<!-- 邀请码输入 -->
			<view class="form-item">
				<view class="label">
					<text class="label-text">邀请码</text>
					<text class="optional">（可选）</text>
				</view>
				<view class="input-wrapper">
					<u-icon name="gift" size="20" color="#999999" />
					<input
						v-model="formData.inviteCode"
						maxlength="8"
						placeholder="请输入邀请码"
						class="input"
					/>
				</view>
				<view class="hint">填写邀请码可获得额外积分奖励</view>
			</view>

			<!-- 用户协议 -->
			<view class="agreement">
				<checkbox-group @change="handleAgreementChange">
					<label class="agreement-label">
						<checkbox :checked="agreed" color="#FF9F29" />
						<text class="agreement-text">
							我已阅读并同意
							<text class="link-text" @click.stop="viewAgreement('user')">《用户协议》</text>
							和
							<text class="link-text" @click.stop="viewAgreement('privacy')">《隐私政策》</text>
						</text>
					</label>
				</checkbox-group>
			</view>

			<!-- 注册按钮 -->
			<button class="register-btn" :disabled="!canSubmit" @click="handleRegister">
				{{ loading ? '注册中...' : '立即注册' }}
			</button>

			<!-- 登录提示 -->
			<view class="login-tip">
				<text class="tip-text">已有账号？</text>
				<text class="link-text" @click="goToLogin">立即登录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { register, sendCode, type RegisterParams } from '@/api/auth'
import { saveLoginInfo, handleLoginSuccess } from '@/utils/auth'
import { validatePhone } from '@/utils/validation'
import { VALIDATION_MESSAGES } from '@/constants/messages'

// 表单数据
const formData = ref({
	phone: '',
	code: '',
	password: '',
	nickname: '',
	inviteCode: ''
})

// 状态
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const showPassword = ref(false)
const agreed = ref(false)

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
	if (!agreed.value) return false
	// 使用统一验证工具验证手机号
	const phoneValidation = validatePhone(formData.value.phone)
	if (!phoneValidation.valid) return false
	if (!formData.value.code || formData.value.code.length !== 6) return false
	// 如果填写了密码，需要验证密码长度
	if (formData.value.password && formData.value.password.length < 6) return false
	return true
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

// 注册
const handleRegister = async () => {
	if (!agreed.value) {
		uni.showToast({
			title: '请先同意用户协议和隐私政策',
			icon: 'none'
		})
		return
	}

	// 验证密码长度（如果填写了密码）
	if (formData.value.password && formData.value.password.length < 6) {
		uni.showToast({
			title: '密码长度不能少于6位',
			icon: 'none'
		})
		return
	}

	try {
		loading.value = true

		// 构建注册参数
		const params: RegisterParams = {
			phone: formData.value.phone,
			code: formData.value.code
		}

		// 可选参数
		if (formData.value.password) {
			params.password = formData.value.password
		}
		if (formData.value.nickname) {
			params.nickname = formData.value.nickname
		}
		if (formData.value.inviteCode) {
			params.inviteCode = formData.value.inviteCode
		}

		// 调用注册接口
		const result = await register(params)

		// 保存登录信息
		saveLoginInfo(result.token, result.refreshToken, result.user)

		uni.showToast({
			title: '注册成功',
			icon: 'success'
		})

		// 延迟跳转
		setTimeout(() => {
			handleLoginSuccess()
		}, 1500)
	} catch (error: any) {
		uni.showToast({
			title: error.message || '注册失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 去登录
const goToLogin = () => {
	uni.navigateBack()
}

// 协议变更
const handleAgreementChange = (e: any) => {
	agreed.value = e.detail.value.length > 0
}

// 查看协议
const viewAgreement = (type: 'user' | 'privacy') => {
	const title = type === 'user' ? '用户协议' : '隐私政策'
	uni.showToast({
		title: `查看${title}`,
		icon: 'none'
	})
	// 功能开发中 - 协议页面待实现
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
.register-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF8E1 0%, $uni-bg-color 50%);
	padding: 0 $uni-spacing-lg;
	padding-bottom: $uni-spacing-xl;
}

// 顶部标题
.header {
	padding: 80rpx 0 64rpx;

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

// 注册表单
.register-form {
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

			.optional {
				font-size: $uni-font-size-sm;
				color: $uni-text-color-placeholder;
				margin-left: $uni-spacing-xs;
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

		.hint {
			margin-top: $uni-spacing-xs;
			font-size: $uni-font-size-xs;
			color: $uni-text-color-placeholder;
			padding-left: $uni-spacing-sm;
		}
	}

	.agreement {
		margin: $uni-spacing-xl 0 $uni-spacing-lg;

		.agreement-label {
			display: flex;
			align-items: flex-start;
			gap: $uni-spacing-xs;

			.agreement-text {
				flex: 1;
				font-size: $uni-font-size-xs;
				color: $uni-text-color-placeholder;
				line-height: 1.6;
			}
		}
	}

	.register-btn {
		width: 100%;
		height: 96rpx;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		font-size: $uni-font-size-md;
		font-weight: 600;
		border-radius: $uni-radius-btn;
		border: none;
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

	.login-tip {
		text-align: center;
		font-size: $uni-font-size-sm;

		.tip-text {
			color: $uni-text-color-placeholder;
		}
	}
}

// 链接文本
.link-text {
	color: $uni-color-primary;
	font-weight: 500;
}
</style>
