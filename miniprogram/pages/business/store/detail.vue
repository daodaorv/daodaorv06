<template>
	<view class="store-detail-page">
		<!-- 加载状态 -->
		<u-skeleton
			v-if="loading"
			:loading="true"
			:rows="5"
			:title="true"
			:avatar="false"
			:animate="true"
		></u-skeleton>

		<!-- 门店详情内容 -->
		<view v-else-if="store" class="detail-content">
			<!-- 门店图片轮播 -->
			<swiper class="store-swiper" indicator-dots :autoplay="true" :interval="3000">
				<swiper-item v-for="(image, index) in store.images" :key="index">
					<image :src="image" mode="aspectFill" class="swiper-image"></image>
				</swiper-item>
			</swiper>

			<!-- 门店基本信息 -->
			<view class="store-basic">
				<view class="store-header">
					<text class="store-name">{{ store.name }}</text>
					<view class="rating-box">
						<u-icon name="star-fill" size="16" color="#FFB800"></u-icon>
						<text class="rating">{{ store.rating }}</text>
						<text class="review-count">({{ store.reviewCount }}条评价)</text>
					</view>
				</view>

				<view class="info-row">
					<u-icon name="map-fill" size="16" color="#1989FA"></u-icon>
					<text class="info-text">{{ store.address }}</text>
				</view>

				<view class="info-row">
					<u-icon name="phone-fill" size="16" color="#1989FA"></u-icon>
					<text class="info-text">{{ store.phone }}</text>
				</view>

				<view class="info-row">
					<u-icon name="clock-fill" size="16" color="#1989FA"></u-icon>
					<text class="info-text">营业时间：{{ store.businessHours }}</text>
				</view>

				<view class="info-row">
					<u-icon name="calendar-fill" size="16" color="#1989FA"></u-icon>
					<text class="info-text">开业时间：{{ store.openingDate }}</text>
				</view>
			</view>

			<!-- 门店介绍 -->
			<view class="section">
				<view class="section-title">门店介绍</view>
				<view class="section-content">
					<text class="description">{{ store.description }}</text>
				</view>
			</view>

			<!-- 门店设施 -->
			<view class="section">
				<view class="section-title">门店设施</view>
				<view class="facilities-grid">
					<view v-for="(facility, index) in store.facilities" :key="index" class="facility-item">
						<u-icon name="checkmark-circle-fill" size="18" color="#52C41A"></u-icon>
						<text>{{ facility }}</text>
					</view>
				</view>
			</view>

			<!-- 服务项目 -->
			<view class="section">
				<view class="section-title">服务项目</view>
				<view class="services-list">
					<view v-for="(service, index) in store.services" :key="index" class="service-item">
						<u-icon name="checkmark-circle" size="16" color="#1989FA"></u-icon>
						<text>{{ service }}</text>
					</view>
				</view>
			</view>

			<!-- 可用车辆 -->
			<view class="section">
				<view class="section-title">
					<text>可用车辆</text>
					<text class="vehicle-count">{{ store.vehicleCount }}辆</text>
				</view>
				<view class="vehicle-tip">
					<text>点击下方按钮查看该门店的所有可用车辆</text>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-group">
				<view class="action-btn" @click="callStore">
					<u-icon name="phone-fill" size="22" color="#1989FA"></u-icon>
					<text>电话咨询</text>
				</view>
				<view class="action-btn" @click="navigateToStore">
					<u-icon name="map-fill" size="22" color="#1989FA"></u-icon>
					<text>导航到店</text>
				</view>
			</view>
			<view class="primary-btn" @click="viewVehicles">
				<text>查看车辆</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStoreDetail } from '@/api/store';
import { logger } from '@/utils/logger';

// ==================== 数据定义 ====================
const store = ref<any>(null);
const loading = ref(false);
const storeId = ref('');

// ==================== 生命周期 ====================
onMounted(() => {
	// 获取路由参数
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	storeId.value = (currentPage as any).options.id || '';

	if (storeId.value) {
		loadStoreDetail();
	}
});

// ==================== 方法定义 ====================

/**
 * 加载门店详情
 */
async function loadStoreDetail() {
	try {
		loading.value = true;
		const res = await getStoreDetail(storeId.value);
		store.value = res.data;
	} catch (error) {
		logger.error('加载门店详情失败:', error);
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
}

/**
 * 拨打门店电话
 */
function callStore() {
	if (!store.value) return;
	uni.makePhoneCall({
		phoneNumber: store.value.phone
	});
}

/**
 * 导航到门店
 */
function navigateToStore() {
	if (!store.value) return;
	uni.openLocation({
		latitude: store.value.latitude,
		longitude: store.value.longitude,
		name: store.value.name,
		address: store.value.address
	});
}

/**
 * 查看车辆列表
 */
function viewVehicles() {
	uni.navigateTo({
		url: `/pages/vehicle/list?storeId=${storeId.value}`
	});
}
</script>

<style lang="scss" scoped>
.store-detail-page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding-bottom: 120rpx;
}

/* 门店图片轮播 */
.store-swiper {
	width: 100%;
	height: 500rpx;
}

.swiper-image {
	width: 100%;
	height: 100%;
}

/* 门店基本信息 */
.store-basic {
	background-color: #FFFFFF;
	padding: 32rpx;
	margin-bottom: 20rpx;
}

.store-header {
	margin-bottom: 24rpx;
}

.store-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 12rpx;
	display: block;
}

.rating-box {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.rating {
	font-size: 28rpx;
	color: #FFB800;
	font-weight: 500;
}

.review-count {
	font-size: 24rpx;
	color: #999999;
}

.info-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.info-text {
	flex: 1;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
}

/* 通用区块样式 */
.section {
	background-color: #FFFFFF;
	padding: 32rpx;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.vehicle-count {
	font-size: 28rpx;
	color: #1989FA;
	font-weight: 500;
}

.section-content {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.8;
}

.description {
	display: block;
}

/* 设施网格 */
.facilities-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}

.facility-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 26rpx;
	color: #333333;
}

/* 服务列表 */
.services-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.service-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 26rpx;
	color: #333333;
}

/* 车辆提示 */
.vehicle-tip {
	padding: 24rpx;
	background-color: #F0F9FF;
	border-radius: 12rpx;
	font-size: 26rpx;
	color: #666666;
	text-align: center;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #FFFFFF;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
	z-index: 100;
}

.action-group {
	display: flex;
	gap: 32rpx;
	margin-right: 20rpx;
}

.action-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	font-size: 22rpx;
	color: #1989FA;
}

.primary-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #1989FA 0%, #0C6FD9 100%);
	border-radius: 40rpx;
	font-size: 30rpx;
	font-weight: 500;
	color: #FFFFFF;
}
</style>
