<template>
	<view class="store-list-page">
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<u-search
				v-model="searchKeyword"
				placeholder="搜索门店名称或地址"
				:show-action="false"
				bg-color="#F5F5F5"
				@search="handleSearch"
				@clear="handleClear"
			></u-search>
		</view>

		<!-- 城市选择 -->
		<view class="city-selector">
			<scroll-view scroll-x class="city-scroll">
				<view class="city-list">
					<view
						v-for="city in cities"
						:key="city.id"
						class="city-item"
						:class="{ active: selectedCityId === city.id }"
						@click="selectCity(city.id)"
					>
						<text class="city-name">{{ city.name }}</text>
						<text class="store-count">{{ city.storeCount }}家</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 门店列表 -->
		<scroll-view scroll-y class="store-scroll" @scrolltolower="loadMore">
			<!-- 加载状态 -->
			<u-skeleton
				v-if="loading && stores.length === 0"
				:loading="true"
				:rows="3"
				:title="false"
				:avatar="false"
				:animate="true"
			></u-skeleton>

			<!-- 空状态 -->
			<EmptyState
				v-else-if="!loading && stores.length === 0"
				mode="search"
				text="暂无门店信息"
				buttonText="切换城市"
				@button-click="showCityPicker"
			/>

			<!-- 门店列表 -->
			<view v-else class="store-list">
				<view
					v-for="store in filteredStores"
					:key="store.id"
					class="store-card"
					@click="goToDetail(store.id)"
				>
					<!-- 门店图片 -->
					<view class="store-image">
						<image :src="store.images[0]" mode="aspectFill"></image>
						<view v-if="store.isRecommended" class="recommend-tag">
							<text>推荐</text>
						</view>
					</view>

					<!-- 门店信息 -->
					<view class="store-info">
						<view class="store-header">
							<text class="store-name">{{ store.name }}</text>
							<view class="rating-box">
								<u-icon name="star-fill" size="12" color="#FFB800"></u-icon>
								<text class="rating">{{ store.rating }}</text>
							</view>
						</view>

						<view class="store-address">
							<u-icon name="map-fill" size="14" color="#999999"></u-icon>
							<text class="address-text">{{ store.address }}</text>
						</view>

						<view class="store-meta">
							<view class="meta-item">
								<u-icon name="clock" size="14" color="#666666"></u-icon>
								<text>{{ store.businessHours }}</text>
							</view>
							<view class="meta-item">
								<u-icon name="car" size="14" color="#666666"></u-icon>
								<text>{{ store.vehicleCount }}辆车</text>
							</view>
						</view>

						<!-- 设施标签 -->
						<view class="facilities">
							<view
								v-for="(facility, index) in store.facilities"
								:key="index"
								class="facility-tag"
							>
								<text>{{ facility }}</text>
							</view>
						</view>
					</view>

					<!-- 操作按钮 -->
					<view class="store-actions">
						<view class="action-btn" @click.stop="callStore(store.phone)">
							<u-icon name="phone" size="18" color="#1989FA"></u-icon>
							<text>电话</text>
						</view>
						<view class="action-btn" @click.stop="navigateToStore(store)">
							<u-icon name="map" size="18" color="#1989FA"></u-icon>
							<text>导航</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="loading && stores.length > 0" class="loading-more">
				<u-loading-icon mode="circle"></u-loading-icon>
				<text>加载中...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && stores.length > 0" class="no-more">
				<text>没有更多门店了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCities, getStores } from '@/api/store';
import EmptyState from '@/components/base/EmptyState.vue';
import { logger } from '@/utils/logger';

// ==================== 数据定义 ====================
const cities = ref<any[]>([]);
const stores = ref<any[]>([]);
const selectedCityId = ref('');
const searchKeyword = ref('');
const loading = ref(false);
const hasMore = ref(true);

// ==================== 计算属性 ====================
const filteredStores = computed(() => {
	if (!searchKeyword.value) {
		return stores.value;
	}
	const keyword = searchKeyword.value.toLowerCase();
	return stores.value.filter(store =>
		store.name.toLowerCase().includes(keyword) ||
		store.address.toLowerCase().includes(keyword)
	);
});

// ==================== 生命周期 ====================
onMounted(() => {
	loadCities();
});

// ==================== 方法定义 ====================

/**
 * 加载城市列表
 */
async function loadCities() {
	try {
		loading.value = true;
		const res = await getCities();
		cities.value = res.data;

		// 默认选择第一个城市
		if (cities.value.length > 0) {
			selectedCityId.value = cities.value[0].id;
			loadStores();
		}
	} catch (error) {
		logger.error('加载城市列表失败:', error);
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
}

/**
 * 加载门店列表
 */
async function loadStores() {
	if (!selectedCityId.value) return;

	try {
		loading.value = true;
		const res = await getStores(selectedCityId.value);
		stores.value = (res.data as any).list || [];
		hasMore.value = false; // Mock数据暂时没有分页
	} catch (error) {
		logger.error('加载门店列表失败:', error);
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
}

/**
 * 选择城市
 */
function selectCity(cityId: string) {
	selectedCityId.value = cityId;
	loadStores();
}

/**
 * 搜索门店
 */
function handleSearch() {
	logger.debug('搜索关键词:', searchKeyword.value);
}

/**
 * 清除搜索
 */
function handleClear() {
	searchKeyword.value = '';
}

/**
 * 显示城市选择器
 */
function showCityPicker() {
	uni.showToast({
		title: '请选择其他城市',
		icon: 'none'
	});
}

/**
 * 加载更多
 */
function loadMore() {
	if (!hasMore.value || loading.value) return;
}

/**
 * 跳转到门店详情
 */
function goToDetail(storeId: string) {
	uni.navigateTo({
		url: `/pages/business/store/detail?id=${storeId}`
	});
}

/**
 * 拨打门店电话
 */
function callStore(phone: string) {
	uni.makePhoneCall({
		phoneNumber: phone
	});
}

/**
 * 导航到门店
 */
function navigateToStore(store: any) {
	uni.openLocation({
		latitude: store.latitude,
		longitude: store.longitude,
		name: store.name,
		address: store.address
	});
}
</script>

<style lang="scss" scoped>
.store-list-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #F5F5F5;
}

/* 搜索栏 */
.search-bar {
	padding: 20rpx;
	background-color: #FFFFFF;
}

/* 城市选择器 */
.city-selector {
	background-color: #FFFFFF;
	border-bottom: 1rpx solid #EEEEEE;
}

.city-scroll {
	white-space: nowrap;
}

.city-list {
	display: inline-flex;
	padding: 20rpx;
}

.city-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 24rpx;
	margin-right: 20rpx;
	border-radius: 12rpx;
	background-color: #F5F5F5;
	transition: all 0.3s;

	&.active {
		background-color: #1989FA;

		.city-name {
			color: #FFFFFF;
			font-weight: 500;
		}

		.store-count {
			color: rgba(255, 255, 255, 0.8);
		}
	}
}

.city-name {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 4rpx;
}

.store-count {
	font-size: 22rpx;
	color: #999999;
}

/* 门店列表滚动区 */
.store-scroll {
	flex: 1;
	padding: 20rpx;
}

.store-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

/* 门店卡片 */
.store-card {
	background-color: #FFFFFF;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.store-image {
	position: relative;
	width: 100%;
	height: 320rpx;

	image {
		width: 100%;
		height: 100%;
	}

	.recommend-tag {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 8rpx 16rpx;
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
		border-radius: 20rpx;
		font-size: 22rpx;
		color: #FFFFFF;
	}
}

/* 门店信息 */
.store-info {
	padding: 24rpx;
}

.store-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.store-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.rating-box {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.rating {
	font-size: 24rpx;
	color: #FFB800;
	font-weight: 500;
}

.store-address {
	display: flex;
	align-items: flex-start;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.address-text {
	flex: 1;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
}

.store-meta {
	display: flex;
	gap: 32rpx;
	margin-bottom: 16rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 24rpx;
	color: #666666;
}

/* 设施标签 */
.facilities {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.facility-tag {
	padding: 8rpx 16rpx;
	background-color: #F0F9FF;
	border-radius: 8rpx;
	font-size: 22rpx;
	color: #1989FA;
}

/* 操作按钮 */
.store-actions {
	display: flex;
	border-top: 1rpx solid #EEEEEE;
}

.action-btn {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24rpx;
	gap: 8rpx;
	font-size: 24rpx;
	color: #1989FA;

	&:first-child {
		border-right: 1rpx solid #EEEEEE;
	}
}

/* 加载状态 */
.loading-more,
.no-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	font-size: 24rpx;
	color: #999999;
	gap: 16rpx;
}
</style>
