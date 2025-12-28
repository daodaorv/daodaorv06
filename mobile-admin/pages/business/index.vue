<template>
	<view class="business-page">
		<!-- 顶部Tab切换 -->
		<view class="tabs-container">
			<view
				class="tab-item"
				:class="{ active: currentTab === 'orders' }"
				@click="switchTab('orders')"
			>
				<text class="tab-text">订单管理</text>
			</view>
			<view
				class="tab-item"
				:class="{ active: currentTab === 'vehicles' }"
				@click="switchTab('vehicles')"
			>
				<text class="tab-text">车辆管理</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-container">
			<!-- 订单管理页面 -->
			<view v-if="currentTab === 'orders'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">订单管理内容</text>
					<text class="placeholder-desc">此处将显示订单列表</text>
				</view>
			</view>

			<!-- 车辆管理页面 -->
			<view v-if="currentTab === 'vehicles'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">车辆管理内容</text>
					<text class="placeholder-desc">此处将显示车辆列表</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'orders' // 默认显示订单管理
		}
	},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
		}
	}
}
</script>

<style lang="scss" scoped>
.business-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
}

.tabs-container {
	display: flex;
	background-color: #ffffff;
	border-bottom: 1px solid #e5e5e5;
}

.tab-item {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 88rpx;
	position: relative;

	&.active {
		.tab-text {
			color: #3cc51f;
			font-weight: 600;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 60rpx;
			height: 4rpx;
			background-color: #3cc51f;
			border-radius: 2rpx;
		}
	}
}

.tab-text {
	font-size: 32rpx;
	color: #333333;
	transition: all 0.3s;
}

.content-container {
	flex: 1;
	overflow-y: auto;
}

.tab-content {
	padding: 30rpx;
}

.placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
}

.placeholder-text {
	font-size: 32rpx;
	color: #333333;
	margin-bottom: 20rpx;
}

.placeholder-desc {
	font-size: 28rpx;
	color: #999999;
}
</style>
