<template>
	<view class="vehicle-detail-page">
		<!-- 图片轮播 -->
		<swiper class="image-swiper" :indicator-dots="true" :autoplay="false" :circular="true"
			indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FF9F29">
			<swiper-item v-for="(image, index) in vehicleImages" :key="index">
				<image class="swiper-image" :src="image" mode="aspectFill"></image>
			</swiper-item>
		</swiper>

		<scroll-view scroll-y class="detail-scroll">
			<!-- 基本信息 -->
			<view class="info-section">
				<view class="vehicle-header">
					<text class="vehicle-name">{{ vehicle.name }}</text>
					<view class="tags">
						<text v-for="(tag, index) in vehicle.tags" :key="index" class="tag">{{ tag }}</text>
					</view>
				</view>
				<view class="price-box">
					<text class="currency">¥</text>
					<text class="price">{{ vehicle.price }}</text>
					<text class="unit">/日均</text>
				</view>
			</view>

			<!-- 车辆规格 -->
			<view class="section">
				<view class="section-title">车辆规格</view>
				<view class="specs-row">
					<view class="spec-item-inline">
						<uni-icons type="car-filled" size="16" color="#FF9F29"></uni-icons>
						<text class="spec-text">{{ vehicle.type }}</text>
					</view>
					<view class="spec-item-inline">
						<uni-icons type="person-filled" size="16" color="#FF9F29"></uni-icons>
						<text class="spec-text">{{ vehicle.seats }}座</text>
					</view>
					<view class="spec-item-inline">
						<uni-icons type="home-filled" size="16" color="#FF9F29"></uni-icons>
						<text class="spec-text">{{ vehicle.beds }}卧</text>
					</view>
					<view class="spec-item-inline">
						<uni-icons type="gear-filled" size="16" color="#FF9F29"></uni-icons>
						<text class="spec-text">{{ vehicle.transmission }}</text>
					</view>
				</view>
			</view>

			<!-- 车辆配置 -->
			<view class="section">
				<view class="section-title">车辆配置</view>
				<view class="features-list">
					<view v-for="(feature, index) in vehicle.features" :key="index" class="feature-item">
						<uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
						<text class="feature-text">{{ feature }}</text>
					</view>
				</view>
			</view>

			<!-- 车辆详情 -->
			<view class="section">
				<view class="section-title">车辆详情</view>
				<view class="detail-content">
					<!-- 富文本内容 -->
					<rich-text :nodes="vehicle.detailHtml"></rich-text>
				</view>
			</view>

			<!-- 评价 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">用户评价</text>
					<text class="rating-score">{{ vehicle.rating }} 分</text>
				</view>
				<view v-if="vehicle.reviews && vehicle.reviews.length > 0" class="reviews-list">
					<view v-for="(review, index) in vehicle.reviews" :key="index" class="review-item">
						<view class="review-header">
							<text class="reviewer-name">{{ review.userName }}</text>
							<text class="review-date">{{ review.date }}</text>
						</view>
						<view class="review-rating">
							<uni-icons v-for="star in 5" :key="star" 
								:type="star <= review.rating ? 'star-filled' : 'star'" 
								size="14" 
								:color="star <= review.rating ? '#FFB400' : '#DDD'">
							</uni-icons>
						</view>
						<text class="review-content">{{ review.content }}</text>
					</view>
				</view>
				<view v-else class="empty-reviews">
					<text class="empty-text">暂无评价</text>
				</view>
			</view>



			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="price-info">
				<text class="price-label">租金</text>
				<view class="price-value">
					<text class="currency">¥</text>
					<text class="price">{{ vehicle.price }}</text>
					<text class="unit">/日</text>
				</view>
			</view>
			<button class="book-btn" @tap="handleBook">立即预订</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 车辆数据
const vehicle = ref({
	id: '',
	name: '上汽大通RG10',
	type: 'C型房车',
	seats: 6,
	beds: 4,
	transmission: '自动挡',
	price: 680,
	tags: ['热门', '新车'],
	rating: 4.8,
	storeName: '深圳宝安店',
	storeAddress: '深圳市宝安区XX路XX号',
	features: [
		'独立卫浴',
		'冷暖空调',
		'车载冰箱',
		'微波炉',
		'燃气灶',
		'太阳能板',
		'倒车影像',
		'定速巡航'
	],
	detailHtml: `
		<div style="line-height: 1.8; color: #333;">
			<p style="margin-bottom: 16px;"><strong>车辆介绍</strong></p>
			<p style="margin-bottom: 12px;">上汽大通RG10是一款专为家庭出游设计的C型房车，采用经典的额头床设计，空间利用率极高。车身长度5.99米，宽度2.5米，高度3.2米，整备质量3.5吨。</p>
			<p style="margin-bottom: 16px;"><img src="/static/场景推荐2.jpg" style="width: 100%; border-radius: 8px; margin: 12px 0;" /></p>
			<p style="margin-bottom: 16px;"><strong>内部空间</strong></p>
			<p style="margin-bottom: 12px;">车内采用温馨的木纹装饰，配备独立卫浴间、厨房区域和会客区。额头床尺寸为1.9m×1.4m，后部双人床尺寸为1.8m×1.5m，可舒适容纳4-6人休息。</p>
			<p style="margin-bottom: 16px;"><img src="/static/优惠政策.jpg" style="width: 100%; border-radius: 8px; margin: 12px 0;" /></p>
			<p style="margin-bottom: 16px;"><strong>动力系统</strong></p>
			<p style="margin-bottom: 12px;">搭载2.0T涡轮增压发动机，最大功率165kW，峰值扭矩350N·m，匹配6速自动变速箱，百公里油耗约12L。</p>
			<p style="margin-bottom: 16px;"><strong>适用场景</strong></p>
			<p style="margin-bottom: 12px;">适合家庭长途旅行、自驾游、露营等场景，特别适合带老人和孩子的家庭出游。</p>
		</div>
	`,
	reviews: [
		{
			userName: '张先生',
			date: '2024-11-20',
			rating: 5,
			content: '车况很好，配置齐全，客服态度也很好，下次还会选择这家！'
		},
		{
			userName: '李女士',
			date: '2024-11-15',
			rating: 4,
			content: '整体不错，就是取车时等了一会儿，其他都挺满意的。'
		}
	]
});

const vehicleImages = ref([
	'/static/场景推荐2.jpg',
	'/static/优惠政策.jpg',
	'/static/场景推荐2.jpg'
]);

onLoad((options: any) => {
	if (options.id) {
		vehicle.value.id = options.id;
		// TODO: 根据ID从后台加载车辆详情(包括detailHtml富文本)
		console.log('加载车辆详情:', options.id);
	}
});

const handleBook = () => {
	// 跳转到订单确认页
	uni.navigateTo({
		url: `/pages/order/confirm?vehicleId=${vehicle.value.id}`
	});
};
</script>

<style scoped lang="scss">
.vehicle-detail-page {
	min-height: 100vh;
	background-color: #F8F8F8;
	display: flex;
	flex-direction: column;
}

.image-swiper {
	width: 100%;
	height: 500rpx;
	background-color: #F5F5F5;
}

.swiper-image {
	width: 100%;
	height: 100%;
}

.detail-scroll {
	flex: 1;
	height: 0;
}

.info-section {
	background-color: #FFFFFF;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.vehicle-header {
	margin-bottom: 16rpx;
}

.vehicle-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.tag {
	font-size: 20rpx;
	color: #666;
	background-color: #F5F5F5;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
}

.price-box {
	display: flex;
	align-items: baseline;
	color: $uni-color-primary;
}

.currency {
	font-size: 24rpx;
	font-weight: bold;
}

.price {
	font-size: 48rpx;
	font-weight: bold;
	margin: 0 4rpx;
}

.unit {
	font-size: 24rpx;
	color: #999;
}

.section {
	background-color: #FFFFFF;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 24rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.rating-score {
	font-size: 28rpx;
	color: #FFB400;
	font-weight: bold;
}

// 规格行布局
.specs-row {
	display: flex;
	align-items: center;
	gap: 32rpx;
	flex-wrap: wrap;
}

.spec-item-inline {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.spec-text {
	font-size: 26rpx;
	color: #333;
}

.features-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.feature-text {
	font-size: 28rpx;
	color: #333;
}

// 车辆详情
.detail-content {
	line-height: 1.8;
	color: #333;
}

.reviews-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.review-item {
	padding: 24rpx;
	background-color: #F8F8F8;
	border-radius: 12rpx;
}

.review-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.reviewer-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.review-date {
	font-size: 24rpx;
	color: #999;
}

.review-rating {
	display: flex;
	gap: 4rpx;
	margin-bottom: 12rpx;
}

.review-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

.empty-reviews {
	text-align: center;
	padding: 60rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.store-info {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.store-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.store-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.store-address {
	font-size: 26rpx;
	color: #666;
	flex: 1;
}

.nav-btn {
	margin: 0;
	padding: 0 24rpx;
	height: 56rpx;
	line-height: 56rpx;
	font-size: 24rpx;
	background-color: #FFF5E9;
	color: $uni-color-primary;
	border: 1rpx solid $uni-color-primary;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	
	&::after {
		border: none;
	}
}

.bottom-placeholder {
	height: 120rpx;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 32rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background-color: #FFFFFF;
	border-top: 1rpx solid #F5F5F5;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.price-info {
	display: flex;
	flex-direction: column;
}

.price-label {
	font-size: 22rpx;
	color: #999;
}

.price-value {
	display: flex;
	align-items: baseline;
	color: $uni-color-primary;
	
	.currency {
		font-size: 20rpx;
		font-weight: bold;
	}
	
	.price {
		font-size: 36rpx;
		font-weight: bold;
		margin: 0 4rpx;
	}
	
	.unit {
		font-size: 20rpx;
	}
}

.book-btn {
	margin: 0;
	padding: 0 48rpx;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 30rpx;
	background-color: $uni-color-primary;
	color: #FFFFFF;
	border-radius: 40rpx;
	font-weight: bold;
	
	&::after {
		border: none;
	}
}
</style>
