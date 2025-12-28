<template>
	<view class="hosting-page">
		<!-- 顶部Tab切换 -->
		<view class="tabs-container">
			<view
				v-for="(tab, index) in tabs"
				:key="index"
				class="tab-item"
				:class="{ active: currentTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text class="tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-container">
			<!-- 自有车托管 -->
			<view v-if="currentTab === 'own-car'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">自有车托管</text>
					<text class="placeholder-desc">现场核验、托管审核</text>
				</view>
			</view>

			<!-- 购车托管 -->
			<view v-if="currentTab === 'buy-car'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">购车托管</text>
					<text class="placeholder-desc">车辆验收、托管审核</text>
				</view>
			</view>

			<!-- 众筹托管 -->
			<view v-if="currentTab === 'crowdfunding'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">众筹托管</text>
					<text class="placeholder-desc">众筹车辆管理、运营监控</text>
				</view>
			</view>

			<!-- 车主自用 -->
			<view v-if="currentTab === 'self-use'" class="tab-content">
				<view class="placeholder">
					<text class="placeholder-text">车主自用</text>
					<text class="placeholder-desc">自用申请审核</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'own-car',
			tabs: [
				{ label: '自有车', value: 'own-car' },
				{ label: '购车', value: 'buy-car' },
				{ label: '众筹', value: 'crowdfunding' },
				{ label: '自用', value: 'self-use' }
			]
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
.hosting-page {
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
	font-size: 28rpx;
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
