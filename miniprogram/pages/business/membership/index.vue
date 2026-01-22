<template>
	<view class="membership-page">
		<!-- 会员状态卡片 -->
		<view class="member-card" :class="isPlusMember ? 'plus-member' : 'normal-member'">
			<view class="card-bg">
				<image v-if="isPlusMember" src="/static/images/member-plus-bg.png" mode="aspectFill" class="bg-image"></image>
			</view>

			<view class="card-content">
				<view class="member-info">
					<view class="member-level">
						<text class="level-text">{{ isPlusMember ? 'PLUS会员' : '普通会员' }}</text>
						<image v-if="isPlusMember" src="/static/icons/crown.png" class="crown-icon"></image>
					</view>

					<view v-if="isPlusMember" class="member-validity">
						<text class="validity-label">有效期至：</text>
						<text class="validity-date">{{ formatDate(memberInfo.endDate) }}</text>
					</view>

					<view v-else class="upgrade-tip">
						<text>开通PLUS会员，享受更多专属权益</text>
					</view>
				</view>

				<view class="member-action">
					<button v-if="isPlusMember" class="action-btn renew-btn" @click="handleRenew">
						续费
					</button>
					<button v-else class="action-btn upgrade-btn" @click="handleUpgrade">
						立即开通
					</button>
				</view>
			</view>
		</view>

		<!-- 会员权益 -->
		<view class="benefits-section">
			<view class="section-title">
				<text class="title-text">会员权益</text>
				<text class="title-desc">{{ isPlusMember ? '您已享有以下权益' : '开通后即可享有' }}</text>
			</view>

			<view class="benefits-grid">
				<view
					v-for="benefit in benefits"
					:key="benefit.id"
					class="benefit-item"
					:class="isPlusMember ? 'active' : 'inactive'"
				>
					<view class="benefit-icon">
						<u-icon :name="getBenefitIcon(benefit.icon)" size="32" :color="getBenefitIconColor(benefit.icon)"></u-icon>
					</view>
					<view class="benefit-info">
						<text class="benefit-name">{{ benefit.name }}</text>
						<text class="benefit-desc">{{ benefit.description }}</text>
					</view>
					<view v-if="isPlusMember" class="benefit-badge">
						<text>已开通</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 会员说明 -->
		<view class="info-section">
			<view class="section-title">
				<text class="title-text">会员说明</text>
			</view>

			<view class="info-list">
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">会员费用</text>
					</view>
					<text class="info-value">年费99元</text>
				</view>

				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">有效期</text>
					</view>
					<text class="info-value">12个月</text>
				</view>

				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">自动续费</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ memberInfo.autoRenew ? '已开启' : '未开启' }}</text>
						<switch
							v-if="isPlusMember"
							:checked="memberInfo.autoRenew"
							@change="handleAutoRenewChange"
							color="#FF9F29"
						/>
					</view>
				</view>

				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">退款政策</text>
					</view>
					<text class="info-value">购买后7天内可申请退款</text>
				</view>
			</view>
		</view>

		<!-- 常见问题 -->
		<view class="faq-section">
			<view class="section-title">
				<text class="title-text">常见问题</text>
			</view>

			<view class="faq-list">
				<view
					v-for="(faq, index) in faqs"
					:key="index"
					class="faq-item"
					@click="toggleFaq(index)"
				>
					<view class="faq-question">
						<text class="question-text">{{ faq.question }}</text>
						<text class="arrow-icon" :class="faq.expanded ? 'expanded' : ''">›</text>
					</view>
					<view v-if="faq.expanded" class="faq-answer">
						<text>{{ faq.answer }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view v-if="!isPlusMember" class="bottom-bar">
			<view class="price-info">
				<text class="price-label">年费</text>
				<text class="price-value">¥99</text>
				<text class="price-original">¥199</text>
			</view>
			<button class="purchase-btn" @click="handleUpgrade">
				立即开通
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { mockGetMembershipInfo, mockGetMembershipPackages, type MembershipInfo, type MemberBenefit } from '@/api/membership'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'

// 用户 Store
const userStore = useUserStore()

// 登录状态
const isLogin = ref(false)

// 计算属性：是否为 PLUS 会员
const isPlusMember = computed(() => userStore.isPlusMember)

// 会员信息
const memberInfo = ref<MembershipInfo>({
	id: '',
	userId: '',
	tagName: 'PLUS会员',
	startDate: '',
	endDate: '',
	autoRenew: false,
	status: 'EXPIRED',
	benefits: []
})

// 会员权益列表
const benefits = ref<MemberBenefit[]>([])

// 常见问题
const faqs = ref([
	{
		question: 'PLUS会员有哪些权益？',
		answer: 'PLUS会员享有租车95折优惠、免费取消订单、专属客服、生日优惠券、积分翻倍、优先取车等6大专属权益。',
		expanded: false
	},
	{
		question: '会员费用如何计算？',
		answer: 'PLUS会员年费99元，有效期12个月。支持自动续费，续费价格与首次购买相同。',
		expanded: false
	},
	{
		question: '租车95折如何使用？',
		answer: '开通PLUS会员后，租车时系统自动应用95折优惠。注意：特惠套餐等特价商品不享受会员折扣。',
		expanded: false
	},
	{
		question: '可以退款吗？',
		answer: '购买后7天内，如未使用任何会员权益，可申请全额退款。超过7天或已使用权益则不支持退款。',
		expanded: false
	},
	{
		question: '自动续费如何取消？',
		answer: '在会员中心可随时关闭自动续费。关闭后，会员到期将不会自动扣费，需手动续费。',
		expanded: false
	}
])

// 格式化日期
const formatDate = (dateStr: string) => {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// 获取权益图标（使用 uView UI 字体图标）
const getBenefitIcon = (icon: string) => {
	const iconMap: Record<string, string> = {
		discount: 'tags-fill',        // 租车95折
		cancel: 'close-circle-fill',  // 免费取消
		service: 'server-man',        // 专属客服
		gift: 'gift-fill',            // 生日优惠
		points: 'integral-fill',      // 积分翻倍
		priority: 'medal-fill'        // 优先取车
	}
	return iconMap[icon] || 'star-fill'
}

// 获取权益图标颜色
const getBenefitIconColor = (icon: string) => {
	const colorMap: Record<string, string> = {
		discount: '#FF6B6B',   // 红色 - 折扣
		cancel: '#4ECDC4',     // 青色 - 取消
		service: '#95E1D3',    // 绿色 - 客服
		gift: '#FFD93D',       // 黄色 - 礼物
		points: '#FF9F29',     // 橙色 - 积分
		priority: '#A8E6CF'    // 浅绿 - 优先
	}
	return colorMap[icon] || '#999999'
}

// 切换FAQ展开状态
const toggleFaq = (index: number) => {
	faqs.value[index].expanded = !faqs.value[index].expanded
}

// 处理续费
const handleRenew = () => {
	if (!isLogin.value) {
		uni.navigateTo({
			url: '/pages/auth/login?redirect=/pages/business/membership/purchase?type=renew'
		})
		return
	}
	uni.navigateTo({
		url: '/pages/business/membership/purchase?type=renew'
	})
}

// 处理升级/开通
const handleUpgrade = () => {
	if (!isLogin.value) {
		uni.navigateTo({
			url: '/pages/auth/login?redirect=/pages/business/membership/purchase?type=purchase'
		})
		return
	}
	uni.navigateTo({
		url: '/pages/business/membership/purchase?type=purchase'
	})
}

// 处理自动续费开关
const handleAutoRenewChange = (e: any) => {
	const enabled = e.detail.value

	uni.showModal({
		title: enabled ? '开启自动续费' : '关闭自动续费',
		content: enabled
			? '开启后，会员到期前将自动续费，确保权益不中断。'
			: '关闭后，会员到期将不会自动扣费，需手动续费。',
		success: (res) => {
			if (res.confirm) {
				// Mock实现 - 待后端API开发
				memberInfo.value.autoRenew = enabled
				uni.showToast({
					title: enabled ? '已开启自动续费' : '已关闭自动续费',
					icon: 'success'
				})
			}
		}
	})
}

// 检查登录状态
const checkLoginStatus = () => {
	isLogin.value = isLoggedIn()
}

// 加载会员信息
const loadMembershipInfo = async () => {
	if (!isLogin.value) {
		// 未登录时使用默认空数据
		benefits.value = [
			{ id: '1', name: '租车95折', description: '房车租赁享受95折优惠', icon: 'discount' },
			{ id: '2', name: '免费取消', description: '取车前24小时内免费取消', icon: 'cancel' },
			{ id: '3', name: '专属客服', description: '专属客服优先响应', icon: 'service' },
			{ id: '4', name: '生日优惠', description: '生日当月8折优惠券', icon: 'gift' }
		]
		return
	}

	try {
		uni.showLoading({ title: '加载中...' })

		// 使用Mock数据
		const info = await mockGetMembershipInfo()
		memberInfo.value = info
		benefits.value = info.benefits

		uni.hideLoading()
	} catch (error) {
		logger.error('加载会员信息失败:', error)
		uni.hideLoading()
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

onMounted(() => {
	checkLoginStatus()
	loadMembershipInfo()
})

onShow(() => {
	checkLoginStatus()
	loadMembershipInfo()
})
</script>

<style lang="scss" scoped>
.membership-page {
	min-height: 100vh;
	background: $uni-bg-color;
	padding-bottom: 120rpx;
}

// 会员卡片
.member-card {
	position: relative;
	margin: $uni-spacing-xl;
	border-radius: $uni-radius-lg;
	overflow: hidden;
	box-shadow: $uni-shadow-float;

	&.plus-member {
		background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
	}

	&.normal-member {
		background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
	}

	.card-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		.bg-image {
			width: 100%;
			height: 100%;
			opacity: 0.3;
		}
	}

	.card-content {
		position: relative;
		padding: $uni-spacing-xl $uni-spacing-xl;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.member-info {
		flex: 1;

		.member-level {
			display: flex;
			align-items: center;
			margin-bottom: $uni-spacing-md;

			.level-text {
				font-size: 40rpx;
				font-weight: bold;
				color: $uni-text-color-inverse;
			}

			.crown-icon {
				width: 48rpx;
				height: 48rpx;
				margin-left: $uni-spacing-md;
			}
		}

		.member-validity {
			.validity-label {
				font-size: $uni-font-size-sm;
				color: rgba(255, 255, 255, 0.8);
			}

			.validity-date {
				font-size: $uni-font-size-base;
				color: $uni-text-color-inverse;
				margin-left: $uni-spacing-sm;
			}
		}

		.upgrade-tip {
			text {
				font-size: $uni-font-size-sm;
				color: rgba(255, 255, 255, 0.9);
			}
		}
	}

	.member-action {
		flex-shrink: 0;

		.action-btn {
			min-width: 160rpx;
			height: 64rpx;
			line-height: 64rpx;
			padding: 0 32rpx;
			border-radius: 32rpx;
			font-size: $uni-font-size-base;
			font-weight: 500;
			border: none;
			white-space: nowrap;
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.98);
				opacity: 0.9;
			}

			&::after {
				border: none;
			}

			&.renew-btn {
				background: rgba(255, 255, 255, 0.3);
				color: $uni-text-color-inverse;
			}

			&.upgrade-btn {
				background: $uni-bg-color-card;
				color: $uni-color-primary;
			}
		}
	}
}

// 权益区域
.benefits-section {
	margin: $uni-spacing-xl;
	background: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	padding: $uni-spacing-xl;
	box-shadow: $uni-shadow-card;
}

.section-title {
	margin-bottom: $uni-spacing-xl;

	.title-text {
		font-size: $uni-font-size-lg;
		font-weight: bold;
		color: $uni-text-color;
	}

	.title-desc {
		font-size: $uni-font-size-sm;
		color: $uni-text-color-placeholder;
		margin-left: $uni-spacing-md;
	}
}

.benefits-grid {
	.benefit-item {
		display: flex;
		align-items: flex-start;
		padding: $uni-spacing-lg 0;
		border-bottom: 1rpx solid $uni-border-color-light;
		transition: all 0.2s ease;

		&:last-child {
			border-bottom: none;
		}

		&.inactive {
			opacity: 0.5;
		}

		&:active {
			background-color: $uni-bg-color-grey;
		}

		.benefit-icon {
			width: 64rpx;
			height: 64rpx;
			margin-right: $uni-spacing-lg;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(255, 159, 41, 0.1);
			border-radius: $uni-radius-circle;
		}

		.benefit-info {
			flex: 1;

			.benefit-name {
				display: block;
				font-size: $uni-font-size-base;
				font-weight: 500;
				color: $uni-text-color;
				margin-bottom: $uni-spacing-sm;
			}

			.benefit-desc {
				display: block;
				font-size: $uni-font-size-sm;
				color: $uni-text-color-placeholder;
				line-height: 1.5;
			}
		}

		.benefit-badge {
			padding: 4rpx $uni-spacing-md;
			background: rgba(76, 175, 80, 0.1);
			border-radius: $uni-radius-xs;

			text {
				font-size: $uni-font-size-xs;
				color: $uni-color-success;
			}
		}
	}
}

// 会员说明
.info-section {
	margin: $uni-spacing-xl;
	background: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	padding: $uni-spacing-xl;
	box-shadow: $uni-shadow-card;
}

.info-list {
	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: $uni-spacing-lg 0;
		border-bottom: 1rpx solid $uni-border-color-light;

		&:last-child {
			border-bottom: none;
		}

		.info-label {
			display: flex;
			align-items: center;

			.label-icon {
				font-size: $uni-font-size-lg;
				color: $uni-color-primary;
				margin-right: $uni-spacing-md;
			}

			.label-text {
				font-size: $uni-font-size-base;
				color: $uni-text-color;
			}
		}

		.info-value {
			font-size: $uni-font-size-base;
			color: $uni-text-color-secondary;
		}

		.info-value-row {
			display: flex;
			align-items: center;
			gap: $uni-spacing-md;
		}
	}
}

// 常见问题
.faq-section {
	margin: $uni-spacing-xl;
	background: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	padding: $uni-spacing-xl;
	box-shadow: $uni-shadow-card;
}

.faq-list {
	.faq-item {
		padding: $uni-spacing-lg 0;
		border-bottom: 1rpx solid $uni-border-color-light;

		&:last-child {
			border-bottom: none;
		}

		.faq-question {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.question-text {
				flex: 1;
				font-size: $uni-font-size-base;
				font-weight: 500;
				color: $uni-text-color;
			}

			.arrow-icon {
				font-size: 40rpx;
				color: $uni-text-color-placeholder;
				transform: rotate(0deg);
				transition: transform 0.3s ease;

				&.expanded {
					transform: rotate(90deg);
				}
			}
		}

		.faq-answer {
			margin-top: $uni-spacing-md;
			padding: $uni-spacing-md;
			background: $uni-bg-color-grey;
			border-radius: $uni-radius-md;

			text {
				font-size: $uni-font-size-sm;
				color: $uni-text-color-secondary;
				line-height: 1.6;
			}
		}
	}
}

// 底部操作栏
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: $uni-bg-color-card;
	padding: $uni-spacing-lg $uni-spacing-xl;
	padding-bottom: calc(#{$uni-spacing-lg} + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 100;

	.price-info {
		display: flex;
		align-items: baseline;

		.price-label {
			font-size: $uni-font-size-sm;
			color: $uni-text-color-placeholder;
			margin-right: $uni-spacing-sm;
		}

		.price-value {
			font-size: 40rpx;
			font-weight: bold;
			color: $uni-color-primary;
			font-family: 'DIN Alternate', sans-serif;
		}

		.price-original {
			font-size: $uni-font-size-sm;
			color: $uni-text-color-placeholder;
			text-decoration: line-through;
			margin-left: $uni-spacing-md;
		}
	}

	.purchase-btn {
		padding: $uni-spacing-lg $uni-spacing-xl;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		border-radius: $uni-radius-btn;
		font-size: $uni-font-size-lg;
		font-weight: bold;
		border: none;
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
}
</style>
