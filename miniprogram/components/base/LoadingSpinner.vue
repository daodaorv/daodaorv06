<template>
	<view v-if="loading" class="loading-spinner">
		<view class="spinner-container">
			<view class="spinner" :class="{ 'spinner-small': size === 'small', 'spinner-large': size === 'large' }">
				<view class="spinner-circle"></view>
			</view>
			<text v-if="text" class="loading-text">{{ text }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
interface Props {
	loading: boolean;
	text?: string;
	size?: 'small' | 'medium' | 'large';
	fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
	loading: false,
	text: '',
	size: 'medium',
	fullscreen: false
});
</script>

<style scoped lang="scss">
.loading-spinner {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx;
}

.spinner-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.spinner {
	width: 40rpx;
	height: 40rpx;
	position: relative;
	
	&.spinner-small {
		width: 32rpx;
		height: 32rpx;
	}
	
	&.spinner-large {
		width: 56rpx;
		height: 56rpx;
	}
}

.spinner-circle {
	width: 100%;
	height: 100%;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid $uni-color-primary;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 24rpx;
	color: $uni-text-color-secondary;
}
</style>
