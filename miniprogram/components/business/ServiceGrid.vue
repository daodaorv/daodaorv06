<template>
	<view class="service-grid">
		<view 
			v-for="(service, index) in services" 
			:key="index"
			class="service-item"
			@tap="handleServiceClick(service)"
		>
			<view class="service-icon">
				<uni-icons :type="service.icon" size="28" color="#FF9F29"></uni-icons>
			</view>
			<text class="service-name">{{ service.name }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Service {
	id: string;
	name: string;
	icon: string;
	path: string;
}

const services = ref<Service[]>([
	{ id: '1', name: '特惠租车', icon: 'gift', path: '/pages/special-offer/list' },
	{ id: '2', name: '营地预定', icon: 'location', path: '/pages/campsite/list' },
	{ id: '3', name: '房车旅游', icon: 'map', path: '/pages/tour/list' },
	{ id: '4', name: '房车众筹', icon: 'wallet', path: '/pages/crowdfunding/index' },
	{ id: '5', name: '优惠券', icon: 'gift-filled', path: '/pages/profile/coupons' },
	{ id: '6', name: 'PLUS会员', icon: 'vip-filled', path: '/pages/membership/index' }
]);

const handleServiceClick = (service: Service) => {
	uni.navigateTo({
		url: service.path
	});
};
</script>

<style scoped lang="scss">
.service-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 32rpx 16rpx;
	padding: 32rpx;
}

.service-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.service-icon {
	width: 112rpx;
	height: 112rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #FFF5E9;
	border-radius: 50%;
}

.service-name {
	font-size: 24rpx;
	color: $uni-text-color;
	text-align: center;
}
</style>
