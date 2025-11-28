<template>
	<view class="index-page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-content">
				<text class="navbar-title">叨叨房车</text>
				<view class="navbar-actions">
					<uni-icons type="notification" size="24" color="#333"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 公告轮播 -->
		<NoticeBanner :notices="notices" @click="handleNoticeClick" />

		<!-- 轮播图 -->
		<view class="banner-swiper">
			<swiper 
				class="swiper" 
				:indicator-dots="true" 
				:autoplay="true" 
				:interval="3000" 
				:circular="true"
				indicator-color="rgba(255,255,255,0.5)"
				indicator-active-color="#FF9F29"
			>
				<swiper-item v-for="(banner, index) in banners" :key="index">
					<image class="banner-image" :src="banner.image" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 预订表单 -->
		<view class="booking-section">
			<BookingForm @search="handleSearch" />
		</view>

		<!-- 服务入口 -->
		<ServiceGrid />

		<!-- 推广卡片 -->
		<view class="promo-cards">
			<view class="promo-card" @tap="navigateTo('/pages/coupon/index')">
				<view class="promo-content">
					<text class="promo-title">特惠商城</text>
					<text class="promo-desc">优惠券入口</text>
				</view>
				<uni-icons type="gift-filled" size="40" color="#FF9F29"></uni-icons>
			</view>
			<view class="promo-card" @tap="navigateTo('/pages/member/index')">
				<view class="promo-content">
					<text class="promo-title">PLUS会员</text>
					<text class="promo-desc">推广入口</text>
				</view>
				<uni-icons type="vip-filled" size="40" color="#FF9F29"></uni-icons>
			</view>
		</view>

		<!-- 内容标签页 -->
		<view class="content-tabs">
			<view class="tab-header">
				<view 
					v-for="(tab, index) in tabs" 
					:key="index"
					class="tab-item"
					:class="{ active: currentTab === index }"
					@tap="switchTab(index)"
				>
					<text class="tab-text">{{ tab }}</text>
				</view>
			</view>

			<!-- 社区内容列表 -->
			<view v-if="currentTab === 0" class="content-list">
				<view 
					v-for="(item, index) in communityList" 
					:key="index"
					class="content-item"
					@tap="navigateTo('/pages/community/detail?id=' + item.id)"
				>
					<image class="content-image" :src="item.image" mode="aspectFill"></image>
					<view class="content-info">
						<text class="content-title">{{ item.title }}</text>
						<text class="content-desc">{{ item.description }}</text>
						<view class="content-meta">
							<text class="meta-text">by @{{ item.author }}</text>
							<view class="meta-likes">
								<uni-icons type="heart" size="14" color="#999"></uni-icons>
								<text class="meta-text">{{ item.likes }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 众筹项目列表 -->
			<view v-else class="content-list">
				<text class="placeholder-text">众筹项目开发中...</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NoticeBanner from '@/components/base/NoticeBanner.vue';
import BookingForm from '@/components/business/BookingForm.vue';
import ServiceGrid from '@/components/business/ServiceGrid.vue';

// 状态栏高度
const statusBarHeight = ref(0);

// 公告数据
const notices = ref([
	{ id: '1', content: '国庆假期房车火热预订中,部分车型已售罄!' },
	{ id: '2', content: '新用户注册即送100元优惠券!' }
]);

// 轮播图数据
const banners = ref([
	{ id: '1', image: '/static/场景推荐2.jpg' },
	{ id: '2', image: '/static/优惠政策.jpg' }
]);

// 标签页
const tabs = ref(['社区内容', '众筹项目']);
const currentTab = ref(0);

// 社区内容
const communityList = ref([
	{
		id: '1',
		title: '我们最爱的海滨营地',
		description: '拥有绝美海景的完美度假地。',
		author: '旅行一家人',
		likes: '1.2k',
		image: '/static/场景推荐2.jpg'
	},
	{
		id: '2',
		title: '优胜美地周末游',
		description: '充分利用国家公园之旅的小贴士。',
		author: '冒险家',
		likes: '980',
		image: '/static/优惠政策.jpg'
	},
	{
		id: '3',
		title: '房车露营初体验',
		description: '第一次租房车需要注意什么？',
		author: '新手上路',
		likes: '560',
		image: '/static/场景推荐2.jpg'
	},
	{
		id: '4',
		title: '川西小环线攻略',
		description: '7天6晚，感受高原的魅力。',
		author: '自驾达人',
		likes: '2.3k',
		image: '/static/优惠政策.jpg'
	}
]);

onMounted(() => {
	// 获取状态栏高度
	const systemInfo = uni.getSystemInfoSync();
	statusBarHeight.value = systemInfo.statusBarHeight || 0;
	
	// 自动定位逻辑
	checkLocationPermission();
});

const checkLocationPermission = () => {
	// #ifdef MP-WEIXIN
	uni.getSetting({
		success(res) {
			if (!res.authSetting['scope.userLocation']) {
				authorizeLocation();
			} else {
				getLocation();
			}
		}
	});
	// #endif
	// #ifndef MP-WEIXIN
	getLocation(); // H5或其他平台直接尝试获取
	// #endif
};

const authorizeLocation = () => {
	uni.authorize({
		scope: 'scope.userLocation',
		success() {
			getLocation();
		},
		fail() {
			console.log('用户拒绝定位权限');
			// 可以选择显示默认城市或提示用户
		}
	});
};

const getLocation = () => {
	uni.getLocation({
		type: 'gcj02',
		success: function (res) {
			console.log('当前位置：' + res.longitude + ',' + res.latitude);
			// TODO: 调用逆地理编码API获取城市名称
			// 这里模拟定位到杭州
			uni.showToast({
				title: '已定位到杭州',
				icon: 'none'
			});
		},
		fail: function () {
			console.log('获取位置失败');
		}
	});
};

const handleNoticeClick = (notice: any) => {
	console.log('点击公告:', notice);
};

const handleSearch = (params: any) => {
	console.log('搜索参数:', params);
	uni.navigateTo({
		url: '/pages/vehicle/list'
	});
};

const switchTab = (index: number) => {
	currentTab.value = index;
};

const navigateTo = (url: string) => {
	uni.navigateTo({ url });
};
</script>

<style scoped lang="scss">
.index-page {
	min-height: 100vh;
	background-color: $uni-bg-color;
}

.custom-navbar {
	background-color: #FFFFFF;
	border-bottom: 1rpx solid $uni-border-color;
}

.navbar-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 32rpx;
}

.navbar-title {
	font-size: 36rpx;
	font-weight: bold;
	color: $uni-color-secondary;
}

.navbar-actions {
	display: flex;
	align-items: center;
}

.banner-swiper {
	width: 100%;
	padding: 0 32rpx;
	margin-top: 16rpx;
}

.swiper {
	width: 100%;
	height: 320rpx; /* 调整为 320rpx */
	border-radius: $uni-border-radius-lg;
	overflow: hidden;
}

.banner-image {
	width: 100%;
	height: 100%;
}

.booking-section {
	padding: 32rpx;
}

.promo-cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32rpx;
	padding: 0 32rpx 32rpx;
}

.promo-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	background-color: $uni-bg-color;
	border-radius: $uni-border-radius-lg;
}

.promo-content {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.promo-title {
	font-size: 32rpx;
	font-weight: bold;
	color: $uni-text-color;
}

.promo-desc {
	font-size: 24rpx;
	color: $uni-text-color-secondary;
}

.content-tabs {
	padding: 32rpx;
}

.tab-header {
	display: flex;
	border-bottom: 2rpx solid $uni-border-color;
	margin-bottom: 32rpx;
}

.tab-item {
	flex: 1;
	padding: 24rpx 0;
	text-align: center;
	position: relative;
	
	&.active {
		.tab-text {
			color: $uni-color-primary;
			font-weight: bold;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 60rpx;
			height: 4rpx;
			background-color: $uni-color-primary;
			border-radius: 2rpx;
		}
	}
}

.tab-text {
	font-size: 28rpx;
	color: $uni-text-color-secondary;
}

.content-list {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.content-item {
	display: flex;
	gap: 24rpx;
	background-color: #FFFFFF;
	border-radius: $uni-border-radius-lg;
	overflow: hidden;
}

.content-image {
	width: 192rpx;
	height: 192rpx;
	flex-shrink: 0;
}

.content-info {
	flex: 1;
	padding: 16rpx 16rpx 16rpx 0;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.content-title {
	font-size: 28rpx;
	font-weight: bold;
	color: $uni-color-primary;
	line-height: 1.4;
}

.content-desc {
	font-size: 24rpx;
	color: $uni-text-color-secondary;
	line-height: 1.5;
}

.content-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
}

.meta-text {
	font-size: 20rpx;
	color: $uni-text-color-secondary;
}

.meta-likes {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.placeholder-text {
	text-align: center;
	padding: 80rpx 0;
	font-size: 28rpx;
	color: $uni-text-color-secondary;
}
</style>
