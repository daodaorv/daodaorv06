<template>
	<view class="coupon-mall">
		<!-- 顶部Banner区 -->
		<view class="banner-section">
			<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
				<swiper-item v-for="(banner, index) in banners" :key="index">
					<image :src="banner.image" mode="aspectFill" class="banner-image"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 积分余额卡片 -->
		<view class="points-card" @tap="goToPointsCenter">
			<view class="points-info">
				<view class="points-label">我的积分</view>
				<view class="points-value">{{ userPoints }}</view>
			</view>
			<view class="points-action">
				<text class="action-text">查看明细</text>
				<u-icon name="arrow-right" size="16" color="#999"></u-icon>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="quick-entry">
			<view class="entry-item" @tap="goToNewUserZone">
				<u-icon name="gift" size="24" color="#FF6B6B"></u-icon>
				<text class="entry-text">新人专区</text>
			</view>
			<view class="entry-item" @tap="goToMemberZone">
				<u-icon name="level" size="24" color="#FFD700"></u-icon>
				<text class="entry-text">会员专属</text>
			</view>
			<view class="entry-item" @tap="goToExpiringSoon">
				<u-icon name="clock" size="24" color="#FF9F29"></u-icon>
				<text class="entry-text">即将过期</text>
			</view>
		</view>

		<!-- 分类导航 -->
		<scroll-view class="category-nav" scroll-x="true" :show-scrollbar="false">
			<view
				v-for="(category, index) in categories"
				:key="index"
				class="category-item"
				:class="{ active: currentCategory === category.id }"
				@tap="selectCategory(category.id)"
			>
				<text class="category-text">{{ category.name }}</text>
			</view>
		</scroll-view>

		<!-- 热门推荐区 -->
		<view class="hot-section" v-if="hotCoupons.length > 0">
			<view class="section-header">
				<view class="header-left">
					<u-icon name="star-fill" size="20" color="#FF6B6B"></u-icon>
					<text class="section-title">热门推荐</text>
				</view>
			</view>
			<scroll-view class="hot-scroll" scroll-x="true" :show-scrollbar="false">
				<view class="hot-list">
					<view
						v-for="coupon in hotCoupons"
						:key="coupon.id"
						class="hot-coupon-card"
						@tap="goToCouponDetail(coupon.id)"
					>
						<view class="coupon-badge" v-if="coupon.badge">{{ coupon.badge }}</view>
						<view class="coupon-amount">
							<text class="amount-symbol">¥</text>
							<text class="amount-value">{{ coupon.amount }}</text>
						</view>
						<view class="coupon-name">{{ coupon.name }}</view>
						<view class="coupon-condition">{{ coupon.condition }}</view>
						<view class="coupon-action">
							<text class="action-price" v-if="coupon.price > 0">{{ coupon.price }}积分</text>
							<text class="action-price" v-else>免费领取</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 优惠券列表 -->
		<view class="coupon-list">
			<view class="section-header">
				<text class="section-title">全部优惠券</text>
			</view>
			<view
				v-for="coupon in filteredCoupons"
				:key="coupon.id"
				class="coupon-item"
				@tap="goToCouponDetail(coupon.id)"
			>
				<!-- 优惠券左侧 -->
				<view class="coupon-left" :class="getCouponTypeClass(coupon.type)">
					<view class="coupon-amount-large">
						<text class="amount-symbol">¥</text>
						<text class="amount-value">{{ coupon.amount }}</text>
					</view>
					<view class="coupon-type-label">{{ getCouponTypeLabel(coupon.type) }}</view>
				</view>

				<!-- 优惠券右侧 -->
				<view class="coupon-right">
					<view class="coupon-header">
						<text class="coupon-name">{{ coupon.name }}</text>
						<view class="coupon-tags">
							<text class="tag" v-if="coupon.isNew">新人专享</text>
							<text class="tag vip" v-if="coupon.isVip">会员专属</text>
							<text class="tag hot" v-if="coupon.isHot">热门</text>
						</view>
					</view>
					<view class="coupon-info">
						<text class="info-text">{{ coupon.condition }}</text>
					</view>
					<view class="coupon-scope">
						<text class="scope-text">适用：{{ coupon.scope }}</text>
					</view>
					<view class="coupon-footer">
						<view class="coupon-validity">
							<u-icon name="calendar" size="14" color="#999"></u-icon>
							<text class="validity-text">{{ coupon.validity }}</text>
						</view>
						<view class="coupon-stock" v-if="coupon.stock">
							<text class="stock-text">剩余{{ coupon.stock }}张</text>
						</view>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="coupon-action-btn" @tap.stop="handleCouponAction(coupon)">
					<text class="btn-text" v-if="coupon.claimed">已领取</text>
					<text class="btn-text" v-else-if="coupon.soldOut">已售罄</text>
					<text class="btn-text active" v-else-if="coupon.price === 0">免费领</text>
					<text class="btn-text active" v-else-if="coupon.pointsPrice > 0 && coupon.price > 0">
						{{ coupon.pointsPrice }}积分+¥{{ coupon.price }}
					</text>
					<text class="btn-text active" v-else-if="coupon.pointsPrice > 0">
						{{ coupon.pointsPrice }}积分
					</text>
					<text class="btn-text active" v-else>¥{{ coupon.price }}</text>
				</view>
			</view>

			<!-- 加载更多 -->
			<uni-load-more :status="loadMoreStatus"></uni-load-more>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onReachBottom, onShow } from '@dcloudio/uni-app';
import { mockCoupons, getHotCoupons, getCouponsByType, type CouponData } from '@/mock/data/coupon';
import { isLoggedIn } from '@/utils/auth';
import { getPointsBalance } from '@/api/points';

// 类型定义
interface Banner {
	id: string;
	image: string;
	link?: string;
}

interface Category {
	id: string;
	name: string;
}

// 响应式数据
const isLogin = ref(false);
const userPoints = ref(0);
const currentCategory = ref('all');
const currentFilter = ref<'all' | 'new' | 'vip' | 'expiring'>('all');
const loadMoreStatus = ref('noMore');

// Banner数据
const banners = ref<Banner[]>([
	{ id: '1', image: '/static/c1.png' },
	{ id: '2', image: '/static/c2.png' },
	{ id: '3', image: '/static/c3.png' }
]);

// 分类数据
const categories = ref<Category[]>([
	{ id: 'all', name: '全部' },
	{ id: 'discount', name: '满减券' },
	{ id: 'rate', name: '折扣券' },
	{ id: 'daily', name: '日租抵扣' },
	{ id: 'service', name: '服务费减免' },
	{ id: 'special', name: '特殊券种' }
]);

// 使用统一的 Mock 数据源
const hotCoupons = ref<CouponData[]>([]);
const allCoupons = ref<CouponData[]>([]);

// 检查登录状态
const checkLoginStatus = () => {
	isLogin.value = isLoggedIn();
};

// 加载积分数据
const loadPointsData = async () => {
	if (!isLogin.value) {
		userPoints.value = 0;
		return;
	}
	try {
		const balance = await getPointsBalance();
		userPoints.value = balance.balance;
	} catch (error) {
		userPoints.value = 0;
	}
};

// 加载优惠券数据
const loadCouponData = () => {
	if (!isLogin.value) {
		hotCoupons.value = [];
		allCoupons.value = [];
		return;
	}
	hotCoupons.value = getHotCoupons();
	allCoupons.value = [...mockCoupons];
};

// 初始化数据
onMounted(() => {
	checkLoginStatus();
	loadPointsData();
	loadCouponData();
});

// 页面显示时刷新状态
onShow(() => {
	checkLoginStatus();
	loadPointsData();
	loadCouponData();
});

// 计算属性：筛选后的优惠券列表
const filteredCoupons = computed(() => {
	if (!isLogin.value) {
		return [];
	}

	let result = [...allCoupons.value];

	// 先按特殊筛选条件过滤
	if (currentFilter.value === 'new') {
		result = result.filter((coupon: CouponData) => coupon.isNew);
	} else if (currentFilter.value === 'vip') {
		result = result.filter((coupon: CouponData) => coupon.isVip);
	} else if (currentFilter.value === 'expiring') {
		// 筛选即将过期的优惠券（假设有效期在7天内）
		result = result.filter((coupon: CouponData) => {
			// 简单模拟：根据validity字段判断
			return coupon.validity && coupon.validity.includes('天');
		});
	}

	// 再按分类过滤
	if (currentCategory.value !== 'all') {
		result = result.filter((coupon: CouponData) => coupon.type === currentCategory.value);
	}

	return result;
});

// 方法
const goToPointsCenter = () => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/profile-sub/points' });
		return;
	}
	uni.navigateTo({
		url: '/pages/profile-sub/points'
	});
};

const goToNewUserZone = () => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/business/coupon-mall/index' });
		return;
	}
	currentFilter.value = 'new';
	currentCategory.value = 'all';
	uni.showToast({
		title: '已筛选新人专区',
		icon: 'none'
	});
};

const goToMemberZone = () => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/business/coupon-mall/index' });
		return;
	}
	currentFilter.value = 'vip';
	currentCategory.value = 'all';
	uni.showToast({
		title: '已筛选会员专属',
		icon: 'none'
	});
};

const goToExpiringSoon = () => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/profile-sub/coupons?tab=expiring' });
		return;
	}
	currentFilter.value = 'expiring';
	currentCategory.value = 'all';
	uni.showToast({
		title: '已筛选即将过期',
		icon: 'none'
	});
};

const selectCategory = (categoryId: string) => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/business/coupon-mall/index' });
		return;
	}
	currentCategory.value = categoryId;
	// 切换分类时重置特殊筛选
	currentFilter.value = 'all';
};

const goToCouponDetail = (couponId: string) => {
	if (!isLogin.value) {
		uni.navigateTo({ url: `/pages/auth/login?redirect=/pages/business/coupon-mall/detail?id=${couponId}` });
		return;
	}
	uni.navigateTo({
		url: `/pages/business/coupon-mall/detail?id=${couponId}`
	});
};

const handleCouponAction = (coupon: CouponData) => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/auth/login?redirect=/pages/business/coupon-mall/index' });
		return;
	}

	if (coupon.claimed) {
		uni.showToast({
			title: '已领取该优惠券',
			icon: 'none'
		});
		return;
	}

	if (coupon.soldOut) {
		uni.showToast({
			title: '优惠券已售罄',
			icon: 'none'
		});
		return;
	}

	// 显示领取/购买确认弹窗
	let actionText = '';
	if (coupon.price === 0 && coupon.pointsPrice === 0) {
		actionText = '免费领取';
	} else if (coupon.pointsPrice > 0 && coupon.price > 0) {
		actionText = `使用${coupon.pointsPrice}积分+¥${coupon.price}购买`;
	} else if (coupon.pointsPrice > 0) {
		actionText = `使用${coupon.pointsPrice}积分兑换`;
	} else {
		actionText = `支付¥${coupon.price}购买`;
	}

	uni.showModal({
		title: '确认操作',
		content: `确定${actionText}该优惠券吗？`,
		success: (res: { confirm: boolean; cancel: boolean }) => {
			if (res.confirm) {
				claimCoupon(coupon);
			}
		}
	});
};

const claimCoupon = (coupon: CouponData) => {
	// Mock实现 - 待后端API开发
	uni.showLoading({
		title: '领取中...'
	});

	setTimeout(() => {
		uni.hideLoading();
		uni.showToast({
			title: '领取成功',
			icon: 'success'
		});
		coupon.claimed = true;
	}, 1000);
};

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

const getCouponTypeLabel = (type: string) => {
	const labelMap: Record<string, string> = {
		discount: '满减券',
		rate: '折扣券',
		daily: '日租抵扣',
		service: '服务费减免',
		special: '特殊券'
	};
	return labelMap[type] || '优惠券';
};

// 生命周期
onReachBottom(() => {
	// 加载更多
	if (loadMoreStatus.value === 'more') {
		loadMoreStatus.value = 'loading';
		// Mock实现 - 待后端API开发
		setTimeout(() => {
			loadMoreStatus.value = 'noMore';
		}, 1000);
	}
});
</script>

<style scoped lang="scss">
.coupon-mall {
	min-height: 100vh;
	background-color: $uni-bg-color;
}

// Banner区域
.banner-section {
	width: 100%;
	height: 320rpx;
	background-color: $uni-bg-color-card;
}

.banner-swiper {
	width: 100%;
	height: 100%;
}

.banner-image {
	width: 100%;
	height: 100%;
}

// 积分卡片
.points-card {
	margin: $uni-spacing-lg;
	padding: $uni-spacing-xl;
	background: $uni-color-primary-gradient;
	border-radius: $uni-radius-lg;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: $uni-shadow-glow;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
}

.points-info {
	display: flex;
	flex-direction: column;
	gap: $uni-spacing-sm;
}

.points-label {
	font-size: $uni-font-size-base;
	color: rgba(255, 255, 255, 0.9);
}

.points-value {
	font-size: 48rpx;
	font-weight: bold;
	color: $uni-text-color-inverse;
	font-family: 'DIN Alternate', sans-serif;
}

.points-action {
	display: flex;
	align-items: center;
	gap: $uni-spacing-sm;
}

.action-text {
	font-size: $uni-font-size-base;
	color: rgba(255, 255, 255, 0.9);
}

// 快捷入口
.quick-entry {
	display: flex;
	justify-content: space-around;
	padding: $uni-spacing-xl $uni-spacing-lg;
	background-color: $uni-bg-color-card;
	margin: 0 $uni-spacing-lg $uni-spacing-lg;
	border-radius: $uni-radius-lg;
	box-shadow: $uni-shadow-card;
}

.entry-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: $uni-spacing-md;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.95);
		opacity: 0.8;
	}
}

.entry-text {
	font-size: $uni-font-size-sm;
	color: $uni-text-color;
}

// 分类导航
.category-nav {
	white-space: nowrap;
	padding: $uni-spacing-lg $uni-spacing-lg $uni-spacing-lg 0;
	background-color: $uni-bg-color-card;
	margin-bottom: $uni-spacing-lg;
}

.category-item {
	display: inline-block;
	padding: $uni-spacing-md $uni-spacing-xl;
	margin-left: $uni-spacing-lg;
	font-size: $uni-font-size-base;
	color: $uni-text-color-secondary;
	border-radius: $uni-radius-btn;
	transition: all 0.3s ease;

	&.active {
		background-color: $uni-color-primary;
		color: $uni-text-color-inverse;
		font-weight: 500;
	}
}

// 热门推荐区
.hot-section {
	margin-bottom: $uni-spacing-lg;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: $uni-spacing-lg;
}

.header-left {
	display: flex;
	align-items: center;
	gap: $uni-spacing-md;
}

.section-title {
	font-size: $uni-font-size-lg;
	font-weight: bold;
	color: $uni-text-color;
}

.hot-scroll {
	white-space: nowrap;
}

.hot-list {
	display: inline-flex;
	gap: $uni-spacing-lg;
	padding: 0 $uni-spacing-lg $uni-spacing-lg;
}

.hot-coupon-card {
	position: relative;
	width: 280rpx;
	padding: $uni-spacing-xl $uni-spacing-lg;
	background: linear-gradient(135deg, rgba(255, 159, 41, 0.08) 0%, rgba(255, 159, 41, 0.15) 100%);
	border-radius: $uni-radius-lg;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	gap: $uni-spacing-md;
	box-shadow: $uni-shadow-card;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.98);
	}
}

.coupon-badge {
	position: absolute;
	top: $uni-spacing-md;
	right: $uni-spacing-md;
	padding: $uni-spacing-xs $uni-spacing-md;
	background-color: $uni-color-error;
	color: $uni-text-color-inverse;
	font-size: $uni-font-size-xs;
	border-radius: $uni-radius-btn;
}

.coupon-amount {
	display: flex;
	align-items: baseline;
	color: $uni-color-primary;
}

.amount-symbol {
	font-size: $uni-font-size-lg;
	font-weight: bold;
}

.amount-value {
	font-size: 56rpx;
	font-weight: bold;
	font-family: 'DIN Alternate', sans-serif;
}

.coupon-name {
	font-size: $uni-font-size-base;
	color: $uni-text-color;
	text-align: center;
}

.coupon-condition {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-secondary;
	text-align: center;
}

.coupon-action {
	margin-top: $uni-spacing-md;
	padding: $uni-spacing-md $uni-spacing-xl;
	background-color: $uni-color-primary;
	color: $uni-text-color-inverse;
	font-size: $uni-font-size-sm;
	border-radius: $uni-radius-btn;
	transition: all 0.2s ease;

	&:active {
		opacity: 0.8;
	}
}

.action-price {
	color: $uni-text-color-inverse;
}

// 优惠券列表
.coupon-list {
	padding: 0 $uni-spacing-lg $uni-spacing-lg;
}

.coupon-item {
	position: relative;
	display: flex;
	background-color: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	margin-bottom: $uni-spacing-lg;
	overflow: hidden;
	box-shadow: $uni-shadow-card;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.99);
	}
}

.coupon-left {
	width: 200rpx;
	padding: $uni-spacing-xl $uni-spacing-lg;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: $uni-spacing-md;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 2rpx;
		height: 80%;
		background: linear-gradient(to bottom, transparent 0%, transparent 45%, $uni-border-color-light 45%, $uni-border-color-light 55%, transparent 55%, transparent 100%);
		background-size: 2rpx 20rpx;
	}

	&.type-discount {
		background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.2) 100%);
	}

	&.type-rate {
		background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.2) 100%);
	}

	&.type-daily {
		background: linear-gradient(135deg, rgba(255, 159, 41, 0.1) 0%, rgba(255, 159, 41, 0.2) 100%);
	}

	&.type-service {
		background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.2) 100%);
	}

	&.type-special {
		background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0.2) 100%);
	}
}

.coupon-amount-large {
	display: flex;
	align-items: baseline;
	color: $uni-color-error;

	.amount-symbol {
		font-size: $uni-font-size-lg;
		font-weight: bold;
	}

	.amount-value {
		font-size: 64rpx;
		font-weight: bold;
		font-family: 'DIN Alternate', sans-serif;
	}
}

.coupon-type-label {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-secondary;
}

.coupon-right {
	flex: 1;
	padding: $uni-spacing-lg;
	display: flex;
	flex-direction: column;
	gap: $uni-spacing-md;
}

.coupon-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.coupon-name {
	font-size: $uni-font-size-md;
	font-weight: 500;
	color: $uni-text-color;
	flex: 1;
}

.coupon-tags {
	display: flex;
	gap: $uni-spacing-sm;
	flex-shrink: 0;
}

.tag {
	padding: 4rpx $uni-spacing-md;
	font-size: $uni-font-size-xs;
	color: $uni-color-error;
	background-color: rgba(255, 107, 107, 0.1);
	border-radius: $uni-radius-xs;

	&.vip {
		color: #FFD700;
		background-color: rgba(255, 215, 0, 0.1);
	}

	&.hot {
		color: $uni-color-primary;
		background-color: rgba(255, 159, 41, 0.1);
	}
}

.coupon-info {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-secondary;
}

.coupon-scope {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-placeholder;
}

.coupon-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: $uni-spacing-sm;
}

.coupon-validity {
	display: flex;
	align-items: center;
	gap: $uni-spacing-sm;
}

.validity-text {
	font-size: $uni-font-size-sm;
	color: $uni-text-color-placeholder;
}

.coupon-stock {
	font-size: $uni-font-size-sm;
	color: $uni-color-primary;
}

.coupon-action-btn {
	position: absolute;
	right: $uni-spacing-lg;
	bottom: $uni-spacing-lg;
	padding: $uni-spacing-md $uni-spacing-lg;
	background-color: $uni-bg-color-grey;
	border-radius: $uni-radius-btn;
	font-size: $uni-font-size-sm;
	color: $uni-text-color-secondary;
	transition: all 0.2s ease;

	&:active {
		background-color: $uni-border-color;
	}

	.btn-text.active {
		color: $uni-color-primary;
		font-weight: 500;
	}
}
</style>
