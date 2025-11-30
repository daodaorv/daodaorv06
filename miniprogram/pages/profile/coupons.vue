<template>
	<view class="coupons-page">
		<!-- 顶部Tab切换 -->
		<view class="tabs-header">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				class="tab-item"
				:class="{ 'active': currentTab === index }"
				@tap="switchTab(index)"
			>
				<text class="tab-text">{{ tab.name }}</text>
				<text v-if="tab.count > 0" class="tab-count">({{ tab.count }})</text>
			</view>
		</view>

		<!-- 优惠券列表 -->
		<scroll-view class="coupons-list" scroll-y="true">
			<!-- 空状态 -->
			<view v-if="filteredCoupons.length === 0" class="empty-state">
				<uni-icons type="gift" size="80" color="#DDD"></uni-icons>
				<text class="empty-text">暂无{{ tabs[currentTab].name }}优惠券</text>
			</view>

			<!-- 优惠券卡片 -->
			<view v-else class="coupon-cards">
				<view 
					v-for="coupon in filteredCoupons" 
					:key="coupon.id"
					class="coupon-card"
					:class="{ 'disabled': coupon.status !== 'available' }"
				>
					<view class="coupon-left">
						<view class="coupon-amount">
							<text class="amount-symbol">¥</text>
							<text class="amount-value">{{ coupon.amount }}</text>
						</view>
						<text class="coupon-condition">满{{ coupon.minAmount }}元可用</text>
					</view>
					<view class="coupon-right">
						<text class="coupon-name">{{ coupon.name }}</text>
						<text class="coupon-desc">{{ coupon.description }}</text>
						<text class="coupon-time">有效期:{{ formatDate(coupon.validFrom) }} - {{ formatDate(coupon.validTo) }}</text>
						<view class="coupon-actions">
							<button 
								v-if="coupon.status === 'available'" 
								class="use-btn"
								@tap="useCoupon(coupon)"
							>
								立即使用
							</button>
							<text v-else-if="coupon.status === 'used'" class="status-tag used">已使用</text>
							<text v-else class="status-tag expired">已过期</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部兑换入口 -->
		<view class="exchange-footer">
			<button class="exchange-btn" @tap="showExchangeDialog">兑换优惠券</button>
		</view>

		<!-- 兑换弹窗 -->
		<uni-popup ref="exchangePopup" type="center">
			<view class="exchange-dialog">
				<text class="dialog-title">兑换优惠券</text>
				<input 
					class="exchange-input" 
					v-model="exchangeCode"
					placeholder="请输入兑换码"
					maxlength="20"
				/>
				<view class="dialog-actions">
					<button class="cancel-btn" @tap="closeExchangeDialog">取消</button>
					<button class="confirm-btn" @tap="confirmExchange">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Tab选项
const tabs = ref([
	{ name: '可用', status: 'available', count: 3 },
	{ name: '已使用', status: 'used', count: 5 },
	{ name: '已过期', status: 'expired', count: 2 }
]);

const currentTab = ref(0);

// 兑换码
const exchangeCode = ref('');
const exchangePopup = ref(null);

// Mock优惠券数据
const coupons = ref([
	{
		id: 'CP001',
		name: '租车满减券',
		description: '适用于所有房车租赁订单',
		type: 'discount',
		amount: 100,
		minAmount: 500,
		validFrom: '2025-11-01',
		validTo: '2025-12-31',
		status: 'available'
	},
	{
		id: 'CP002',
		name: '新用户专享券',
		description: '首次下单专享优惠',
		type: 'discount',
		amount: 200,
		minAmount: 1000,
		validFrom: '2025-11-01',
		validTo: '2025-12-31',
		status: 'available'
	},
	{
		id: 'CP003',
		name: '周末特惠券',
		description: '周末租车享优惠',
		type: 'discount',
		amount: 50,
		minAmount: 300,
		validFrom: '2025-11-01',
		validTo: '2025-12-31',
		status: 'available'
	},
	{
		id: 'CP004',
		name: '已使用券',
		description: '已使用的优惠券示例',
		type: 'discount',
		amount: 100,
		minAmount: 500,
		validFrom: '2025-10-01',
		validTo: '2025-11-30',
		status: 'used'
	},
	{
		id: 'CP005',
		name: '已过期券',
		description: '已过期的优惠券示例',
		type: 'discount',
		amount: 150,
		minAmount: 800,
		validFrom: '2025-09-01',
		validTo: '2025-10-31',
		status: 'expired'
	}
]);

// 过滤优惠券
const filteredCoupons = computed(() => {
	const status = tabs.value[currentTab.value].status;
	return coupons.value.filter(c => c.status === status);
});

// 切换Tab
const switchTab = (index: number) => {
	currentTab.value = index;
};

// 格式化日期
const formatDate = (dateStr: string) => {
	const date = new Date(dateStr);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month}.${day}`;
};

// 使用优惠券
const useCoupon = (coupon: any) => {
	uni.showModal({
		title: '使用优惠券',
		content: '是否前往选择房车使用此优惠券?',
		success: (res) => {
			if (res.confirm) {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	});
};

// 显示兑换弹窗
const showExchangeDialog = () => {
	exchangePopup.value?.open();
};

// 关闭兑换弹窗
const closeExchangeDialog = () => {
	exchangePopup.value?.close();
	exchangeCode.value = '';
};

// 确认兑换
const confirmExchange = () => {
	if (!exchangeCode.value) {
		uni.showToast({
			title: '请输入兑换码',
			icon: 'none'
		});
		return;
	}
	
	// Mock兑换成功
	uni.showToast({
		title: '兑换成功!',
		icon: 'success'
	});
	
	closeExchangeDialog();
	
	// 刷新数据
	tabs.value[0].count++;
};
</script>

<style lang="scss" scoped>
.coupons-page {
	min-height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
}

// Tab头部
.tabs-header {
	background-color: #FFFFFF;
	display: flex;
	padding: 0 32rpx;
	border-bottom: 2rpx solid #F0F0F0;

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 32rpx 0;
		position: relative;

		.tab-text {
			font-size: 30rpx;
			color: rgba(0, 0, 0, 0.6);
		}

		.tab-count {
			font-size: 24rpx;
			color: rgba(0, 0, 0, 0.4);
			margin-left: 8rpx;
		}

		&.active {
			.tab-text {
				color: #FF9F29;
				font-weight: 600;
			}

			.tab-count {
				color: #FF9F29;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 4rpx;
				background-color: #FF9F29;
				border-radius: 2rpx;
			}
		}
	}
}

// 优惠券列表
.coupons-list {
	flex: 1;
	padding: 24rpx;
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;

	.empty-text {
		font-size: 28rpx;
		color: rgba(0, 0, 0, 0.4);
		margin-top: 24rpx;
	}
}

// 优惠券卡片
.coupon-cards {
	.coupon-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		display: flex;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

		&.disabled {
			opacity: 0.6;
		}

		.coupon-left {
			width: 220rpx;
			background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 32rpx 24rpx;
			position: relative;

			&::after {
				content: '';
				position: absolute;
				right: -12rpx;
				top: 50%;
				transform: translateY(-50%);
				width: 24rpx;
				height: 24rpx;
				background-color: #F5F5F5;
				border-radius: 50%;
			}

			.coupon-amount {
				color: #FFFFFF;
				display: flex;
				align-items: baseline;
				margin-bottom: 8rpx;

				.amount-symbol {
					font-size: 32rpx;
					font-weight: 600;
				}

				.amount-value {
					font-size: 56rpx;
					font-weight: bold;
				}
			}

			.coupon-condition {
				color: rgba(255, 255, 255, 0.9);
				font-size: 22rpx;
			}
		}

		.coupon-right {
			flex: 1;
			padding: 24rpx;
			display: flex;
			flex-direction: column;

			.coupon-name {
				font-size: 32rpx;
				font-weight: 600;
				color: rgba(0, 0, 0, 0.9);
				margin-bottom: 8rpx;
			}

			.coupon-desc {
				font-size: 24rpx;
				color: rgba(0, 0, 0, 0.6);
				margin-bottom: 16rpx;
			}

			.coupon-time {
				font-size: 22rpx;
				color: rgba(0, 0, 0, 0.4);
				margin-bottom: 16rpx;
			}

			.coupon-actions {
				margin-top: auto;

				.use-btn {
					padding: 12rpx 32rpx;
					background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
					color: #FFFFFF;
					border-radius: 24rpx;
					font-size: 26rpx;
					border: none;
				}

				.status-tag {
					display: inline-block;
					padding: 8rpx 20rpx;
					border-radius: 20rpx;
					font-size: 24rpx;

					&.used {
						background-color: rgba(0, 0, 0, 0.05);
						color: rgba(0, 0, 0, 0.4);
					}

					&.expired {
						background-color: rgba(255, 77, 79, 0.1);
						color: #FF4D4F;
					}
				}
			}
		}
	}
}

// 底部兑换入口
.exchange-footer {
	background-color: #FFFFFF;
	padding: 24rpx 32rpx;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

	.exchange-btn {
		width: 100%;
		padding: 24rpx;
		background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
		color: #FFFFFF;
		border-radius: 48rpx;
		font-size: 32rpx;
		font-weight: 600;
		border: none;
	}
}

// 兑换弹窗
.exchange-dialog {
	width: 560rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	padding: 48rpx 32rpx 32rpx;

	.dialog-title {
		display: block;
		text-align: center;
		font-size: 36rpx;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.9);
		margin-bottom: 40rpx;
	}

	.exchange-input {
		width: 100%;
		padding: 24rpx;
		border: 2rpx solid #E0E0E0;
		border-radius: 12rpx;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.dialog-actions {
		display: flex;
		gap: 24rpx;

		button {
			flex: 1;
			padding: 20rpx;
			border-radius: 48rpx;
			font-size: 30rpx;
			border: none;
		}

		.cancel-btn {
			background-color: #F5F5F5;
			color: rgba(0, 0, 0, 0.6);
		}

		.confirm-btn {
			background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
			color: #FFFFFF;
		}
	}
}
</style>
