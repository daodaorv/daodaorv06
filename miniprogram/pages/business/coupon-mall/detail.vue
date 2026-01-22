<template>
	<view class="coupon-detail">
		<!-- 券面大图 -->
		<view class="coupon-card">
			<view class="card-bg" :class="getCouponTypeClass(coupon.type)">
				<view class="card-header">
					<view class="coupon-tags">
						<text class="tag" v-if="coupon.isNew">新人专享</text>
						<text class="tag vip" v-if="coupon.isVip">会员专属</text>
						<text class="tag hot" v-if="coupon.isHot">热门</text>
					</view>
				</view>
				<view class="card-content">
					<view class="coupon-amount">
						<text class="amount-symbol">¥</text>
						<text class="amount-value">{{ coupon.amount }}</text>
					</view>
					<view class="coupon-name">{{ coupon.name }}</view>
					<view class="coupon-condition">{{ coupon.condition }}</view>
				</view>
			</view>
		</view>

		<!-- 优惠说明 -->
		<view class="section">
			<view class="section-title">
				<u-icon name="info" size="20" color="#FF9F29"></u-icon>
				<text class="title-text">优惠说明</text>
			</view>
			<view class="section-content">
				<text class="content-text">{{ coupon.description }}</text>
			</view>
		</view>

		<!-- 使用规则 -->
		<view class="section">
			<view class="section-title">
				<u-icon name="list" size="20" color="#FF9F29"></u-icon>
				<text class="title-text">使用规则</text>
			</view>
			<view class="section-content">
				<view class="rule-item">
					<text class="rule-label">适用范围：</text>
					<text class="rule-value">{{ coupon.scope }}</text>
				</view>
				<view class="rule-item">
					<text class="rule-label">使用条件：</text>
					<text class="rule-value">{{ coupon.condition }}</text>
				</view>
				<view class="rule-item">
					<text class="rule-label">叠加规则：</text>
					<text class="rule-value">{{ coupon.stackRule }}</text>
				</view>
				<view class="rule-item">
					<text class="rule-label">有效期：</text>
					<text class="rule-value">{{ coupon.validity }}</text>
				</view>
				<view class="rule-item" v-if="coupon.specialLimit">
					<text class="rule-label">特殊限制：</text>
					<text class="rule-value">{{ coupon.specialLimit }}</text>
				</view>
			</view>
		</view>

		<!-- 获取信息 -->
		<view class="section">
			<view class="section-title">
				<u-icon name="gift" size="20" color="#FF9F29"></u-icon>
				<text class="title-text">获取信息</text>
			</view>
			<view class="section-content">
				<view class="info-item">
					<text class="info-label">获取方式：</text>
					<text class="info-value">{{ getAcquisitionMethod() }}</text>
				</view>
				<view class="info-item" v-if="coupon.stock">
					<text class="info-label">库存状态：</text>
					<text class="info-value stock">剩余{{ coupon.stock }}张</text>
				</view>
				<view class="info-item" v-if="coupon.limitPerUser">
					<text class="info-label">限领次数：</text>
					<text class="info-value">每人限领{{ coupon.limitPerUser }}次</text>
				</view>
			</view>
		</view>

		<!-- 使用说明 -->
		<view class="section">
			<view class="section-title">
				<u-icon name="question-circle" size="20" color="#FF9F29"></u-icon>
				<text class="title-text">使用说明</text>
			</view>
			<view class="section-content">
				<view class="usage-steps">
					<view class="step-item" v-for="(step, index) in usageSteps" :key="index">
						<view class="step-number">{{ Number(index) + 1 }}</view>
						<text class="step-text">{{ step }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 常见问题 -->
		<view class="section">
			<view class="section-title">
				<u-icon name="chat" size="20" color="#FF9F29"></u-icon>
				<text class="title-text">常见问题</text>
			</view>
			<view class="section-content">
				<view class="faq-item" v-for="(faq, index) in faqs" :key="index">
					<view class="faq-question">
						<text class="question-mark">Q{{ Number(index) + 1 }}：</text>
						<text class="question-text">{{ faq.question }}</text>
					</view>
					<view class="faq-answer">
						<text class="answer-mark">A：</text>
						<text class="answer-text">{{ faq.answer }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部占位 -->
		<view class="bottom-placeholder"></view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<button class="share-btn" @tap="handleShare">
				<u-icon name="reload" size="20" color="#666"></u-icon>
				<text class="share-text">分享</text>
			</button>
			<view class="bar-right">
				<button class="action-btn" :disabled="coupon.claimed || coupon.soldOut" @tap="handleAction">
					<text v-if="coupon.claimed">已领取</text>
					<text v-else-if="coupon.soldOut">已售罄</text>
					<text v-else>立即{{ getActionText() }}</text>
				</button>
			</view>
		</view>

		<!-- 分享面板 -->
		<ShareSheet
			v-model:show="showShareSheet"
			@select="handleShareSelect"
		/>

		<!-- 海报预览 -->
		<PosterPreview
			v-model:show="showPosterPopup"
			:poster-image="posterImage"
			@save="savePoster"
		/>
	</view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { getCouponById, type CouponData } from '@/mock/data/coupon';
import { useShare } from '@/composables/useShare';
import { ShareScene } from '@/types/share';
import ShareSheet from '@/components/share/ShareSheet.vue';
import PosterPreview from '@/components/share/PosterPreview.vue';

// 类型定义
interface FAQ {
	question: string;
	answer: string;
}

// 响应式数据
const couponId = ref('');
const coupon = ref<CouponData>({
	id: '1',
	name: '房车租赁50元满减券',
	type: 'discount',
	amount: 50,
	condition: '满500元可用',
	scope: '适用于所有房车租赁订单',
	validity: '领取后30天内有效',
	description: '本优惠券适用于所有房车租赁订单，满500元即可使用，立减50元。新用户首次租车专享优惠，让您的房车之旅更加实惠。',
	stackRule: '不可与其他满减券叠加使用，可与会员折扣叠加',
	specialLimit: '仅限新用户首单使用，每人限领1次',
	price: 0,
	pointsPrice: 0,
	stock: 1000,
	limitPerUser: 1,
	claimed: false,
	soldOut: false,
	isNew: true,
	isVip: false,
	isHot: true
});

// 使用步骤
const usageSteps = ref([
	'在特惠商城领取或购买优惠券',
	'选择心仪的房车并填写预订信息',
	'在订单确认页面选择可用优惠券',
	'系统自动计算优惠后的价格',
	'完成支付，享受优惠价格'
]);

// 常见问题
const faqs = ref<FAQ[]>([
	{
		question: '优惠券可以叠加使用吗？',
		answer: '同类优惠券不可叠加使用，但日租抵扣券可与其他券叠加。会员折扣与优惠券可以叠加，会员折扣优先计算。'
	},
	{
		question: '优惠券有效期是多久？',
		answer: '不同优惠券有效期不同，一般为领取后7-90天有效。具体有效期请查看优惠券详情页面的"有效期"说明。'
	},
	{
		question: '优惠券可以转赠给他人吗？',
		answer: '优惠券不支持转赠，仅限本人账号使用。如需赠送，可以通过"邀请好友"功能邀请好友注册，双方都可获得优惠券奖励。'
	},
	{
		question: '优惠券过期了还能用吗？',
		answer: '优惠券过期后将自动失效，无法使用。建议在有效期内及时使用，系统会在优惠券即将过期时提醒您。'
	},
	{
		question: '购买的优惠券可以退款吗？',
		answer: '未使用的优惠券可在购买后24小时内申请退款。已使用或超过24小时的优惠券不支持退款。'
	}
]);

// 方法
const getCouponTypeClass = (type: string) => {
	const classMap: Record<string, string> = {
		discount: 'type-discount',
		rate: 'type-rate',
		daily: 'type-daily',
		service: 'type-service',
		special: 'type-special'
	};
	return classMap[type] || '';
};

const getAcquisitionMethod = () => {
	if (coupon.value.price === 0 && coupon.value.pointsPrice === 0) {
		return '免费领取';
	} else if (coupon.value.pointsPrice > 0 && coupon.value.price > 0) {
		return `${coupon.value.pointsPrice}积分+¥${coupon.value.price}组合购买`;
	} else if (coupon.value.pointsPrice > 0) {
		return `${coupon.value.pointsPrice}积分兑换`;
	} else {
		return `¥${coupon.value.price}现金购买`;
	}
};

const getActionText = () => {
	if (coupon.value.price === 0 && coupon.value.pointsPrice === 0) {
		return '领取';
	} else if (coupon.value.pointsPrice > 0 && coupon.value.price > 0) {
		return '购买';
	} else if (coupon.value.pointsPrice > 0) {
		return '兑换';
	} else {
		return '购买';
	}
};

const handleAction = () => {
	if (coupon.value.claimed) {
		uni.showToast({
			title: '已领取该优惠券',
			icon: 'none'
		});
		return;
	}

	if (coupon.value.soldOut) {
		uni.showToast({
			title: '优惠券已售罄',
			icon: 'none'
		});
		return;
	}

	// 显示确认弹窗
	let actionText = getActionText();
	let content = `确定${actionText}该优惠券吗？`;

	if (coupon.value.pointsPrice > 0 && coupon.value.price > 0) {
		content = `将使用${coupon.value.pointsPrice}积分+¥${coupon.value.price}购买该优惠券，确定继续吗？`;
	} else if (coupon.value.pointsPrice > 0) {
		content = `将使用${coupon.value.pointsPrice}积分兑换该优惠券，确定继续吗？`;
	} else if (coupon.value.price > 0) {
		content = `将支付¥${coupon.value.price}购买该优惠券，确定继续吗？`;
	}

	uni.showModal({
		title: '确认操作',
		content: content,
		success: (res) => {
			if (res.confirm) {
				claimCoupon();
			}
		}
	});
};

const claimCoupon = () => {
	// Mock实现 - 待后端API开发
	uni.showLoading({
		title: '处理中...'
	});

	setTimeout(() => {
		uni.hideLoading();
		uni.showToast({
			title: '操作成功',
			icon: 'success'
		});
		coupon.value.claimed = true;

		// 延迟跳转到我的优惠券页面
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/profile-sub/coupons'
			});
		}, 1500);
	}, 1000);
};

const loadCouponDetail = (id: string) => {
	// 从统一的 Mock 数据源加载优惠券详情
	const couponData = getCouponById(id);
	if (couponData) {
		coupon.value = couponData;
		logger.debug('成功加载优惠券详情', { id, couponData });
	} else {
		logger.warn('未找到优惠券', { id });
		uni.showToast({
			title: '优惠券不存在',
			icon: 'none'
		});
		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
	}
};

// 分享功能
const {
	showShareSheet,
	showPosterPopup,
	posterImage,
	openShareSheet,
	handleShareSelect,
	savePoster,
	getShareContent
} = useShare({
	title: `【叨叨房车】${coupon.value.name}`,
	desc: coupon.value.description,
	imageUrl: '/static/优惠政策.jpg',
	path: '/pages/business/coupon-mall/detail',
	scene: ShareScene.SPECIAL_OFFER,
	businessId: couponId.value || 'demo_coupon',
	query: {
		id: couponId.value || 'demo_coupon'
	}
});

// 配置微信分享
onShareAppMessage(() => {
	return getShareContent();
});

// 打开分享面板
const handleShare = () => {
	openShareSheet();
};

// 生命周期
onLoad((options) => {
	if (options?.id) {
		couponId.value = options.id;
		loadCouponDetail(options.id);
	}
});
</script>

<style scoped lang="scss">
.coupon-detail {
	min-height: 100vh;
	background-color: $uni-bg-color;
	padding-bottom: 120rpx;
}

// 券面卡片
.coupon-card {
	margin: $uni-spacing-lg;
	border-radius: $uni-radius-lg;
	overflow: hidden;
	box-shadow: $uni-shadow-float;
}

.card-bg {
	padding: $uni-spacing-xl $uni-spacing-xl;
	position: relative;

	&.type-discount {
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
	}

	&.type-rate {
		background: linear-gradient(135deg, #4A90E2 0%, #6BA3E8 100%);
	}

	&.type-daily {
		background: $uni-color-primary-gradient;
	}

	&.type-service {
		background: linear-gradient(135deg, $uni-color-success 0%, #73D13D 100%);
	}

	&.type-special {
		background: linear-gradient(135deg, #9B59B6 0%, #B370CF 100%);
	}
}

.card-header {
	display: flex;
	justify-content: flex-end;
	margin-bottom: $uni-spacing-xl;
}

.coupon-tags {
	display: flex;
	gap: $uni-spacing-md;
}

.tag {
	padding: $uni-spacing-sm $uni-spacing-md;
	font-size: $uni-font-size-xs;
	color: $uni-text-color-inverse;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: $uni-radius-btn;
	backdrop-filter: blur(10rpx);
}

.card-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: $uni-spacing-md;
}

.coupon-amount {
	display: flex;
	align-items: baseline;
	color: $uni-text-color-inverse;
}

.amount-symbol {
	font-size: 48rpx;
	font-weight: bold;
}

.amount-value {
	font-size: 96rpx;
	font-weight: bold;
	font-family: 'DIN Alternate', sans-serif;
}

.coupon-name {
	font-size: 36rpx;
	font-weight: 500;
	color: $uni-text-color-inverse;
	text-align: center;
}

.coupon-condition {
	font-size: $uni-font-size-base;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
}

// 内容区块
.section {
	margin: $uni-spacing-lg;
	padding: $uni-spacing-xl;
	background-color: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	box-shadow: $uni-shadow-card;
}

.section-title {
	display: flex;
	align-items: center;
	gap: $uni-spacing-md;
	margin-bottom: $uni-spacing-lg;
}

.title-text {
	font-size: $uni-font-size-lg;
	font-weight: bold;
	color: $uni-text-color;
}

.section-content {
	display: flex;
	flex-direction: column;
	gap: $uni-spacing-md;
}

.content-text {
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
	line-height: 1.6;
}

// 规则项
.rule-item {
	display: flex;
	padding: $uni-spacing-md 0;
	border-bottom: 1rpx solid $uni-border-color-light;

	&:last-child {
		border-bottom: none;
	}
}

.rule-label {
	flex-shrink: 0;
	width: 180rpx;
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
}

.rule-value {
	flex: 1;
	font-size: $uni-font-size-base;
	color: $uni-text-color;
	line-height: 1.5;
}

// 信息项
.info-item {
	display: flex;
	padding: $uni-spacing-md 0;
	border-bottom: 1rpx solid $uni-border-color-light;

	&:last-child {
		border-bottom: none;
	}
}

.info-label {
	flex-shrink: 0;
	width: 180rpx;
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
}

.info-value {
	flex: 1;
	font-size: $uni-font-size-base;
	color: $uni-text-color;

	&.stock {
		color: $uni-color-primary;
		font-weight: 500;
	}
}

// 使用步骤
.usage-steps {
	display: flex;
	flex-direction: column;
	gap: $uni-spacing-lg;
}

.step-item {
	display: flex;
	align-items: flex-start;
	gap: $uni-spacing-md;
}

.step-number {
	flex-shrink: 0;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: $uni-color-primary;
	color: $uni-text-color-inverse;
	font-size: $uni-font-size-sm;
	font-weight: bold;
	border-radius: $uni-radius-circle;
}

.step-text {
	flex: 1;
	font-size: $uni-font-size-base;
	color: $uni-text-color;
	line-height: 48rpx;
}

// FAQ
.faq-item {
	padding: $uni-spacing-lg 0;
	border-bottom: 1rpx solid $uni-border-color-light;

	&:last-child {
		border-bottom: none;
	}
}

.faq-question {
	display: flex;
	margin-bottom: $uni-spacing-md;
}

.question-mark {
	flex-shrink: 0;
	font-size: $uni-font-size-base;
	font-weight: bold;
	color: $uni-color-primary;
}

.question-text {
	flex: 1;
	font-size: $uni-font-size-base;
	font-weight: 500;
	color: $uni-text-color;
	line-height: 1.5;
}

.faq-answer {
	display: flex;
	padding-left: $uni-spacing-xl;
}

.answer-mark {
	flex-shrink: 0;
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
}

.answer-text {
	flex: 1;
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
	line-height: 1.6;
}

// 底部占位
.bottom-placeholder {
	height: 120rpx;
}

// 底部操作栏
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	gap: $uni-spacing-lg;
	padding: $uni-spacing-lg;
	padding-bottom: calc(#{$uni-spacing-lg} + env(safe-area-inset-bottom));
	background-color: $uni-bg-color-card;
	border-top: 1rpx solid $uni-border-color-light;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.share-btn {
	width: 120rpx;
	height: 88rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4rpx;
	background-color: $uni-bg-color-grey;
	border-radius: $uni-radius-btn;
	border: none;
	transition: all 0.2s ease;

	&:active {
		background-color: $uni-border-color;
	}

	&::after {
		border: none;
	}
}

.share-text {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-secondary;
}

.bar-right {
	flex: 1;
}

.action-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: $uni-color-primary-gradient;
	color: $uni-text-color-inverse;
	font-size: $uni-font-size-lg;
	font-weight: 500;
	border-radius: $uni-radius-btn;
	border: none;
	box-shadow: $uni-shadow-glow;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}

	&[disabled] {
		background: $uni-bg-color-grey;
		color: $uni-text-color-placeholder;
		box-shadow: none;
	}

	&::after {
		border: none;
	}
}
</style>
