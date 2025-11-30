<template>
	<view class="crowdfunding-assets-page">
		<!-- 资产概览卡片 -->
		<view class="summary-card">
			<view class="summary-item">
				<text class="summary-label">持有项目</text>
				<text class="summary-value">{{ assetsSummary.totalProjects }}个</text>
			</view>
			<view class="summary-item">
				<text class="summary-label">持有份额</text>
				<text class="summary-value">{{ assetsSummary.totalShares }}份</text>
			</view>
			<view class="summary-item">
				<text class="summary-label">投资成本</text>
				<text class="summary-value">¥{{ assetsSummary.totalCost.toLocaleString() }}</text>
			</view>
			<view class="summary-item">
				<text class="summary-label">累计收益</text>
				<text class="summary-value highlight">¥{{ assetsSummary.totalRevenue.toLocaleString() }}</text>
			</view>
		</view>

		<!-- 持有项目列表 -->
		<view class="projects-section">
			<view class="section-header">
				<text class="title">持有项目</text>
			</view>

			<!-- 空状态 -->
			<view v-if="projects.length === 0" class="empty-state">
				<uni-icons type="compose" size="80" color="#DDD"></uni-icons>
				<text class="empty-text">暂无持有项目</text>
				<button class="browse-btn" @tap="goToCrowdfunding">去看看众筹项目</button>
			</view>

			<!-- 项目卡片 -->
			<view v-else class="project-cards">
				<view 
					v-for="project in projects" 
					:key="project.id"
					class="project-card"
					@tap="goToProjectDetail(project.id)"
				>
					<view class="card-header">
						<view class="project-info">
							<text class="project-name">{{ project.name }}</text>
							<view class="project-status" :class="project.status">
								<text>{{ getStatusText(project.status) }}</text>
							</view>
						</view>
					</view>

					<view class="card-body">
						<view class="data-row">
							<view class="data-item">
								<text class="data-label">持有份额</text>
								<text class="data-value">{{ project.shares }}份</text>
							</view>
							<view class="data-item">
								<text class="data-label">每份价格</text>
								<text class="data-value">¥{{ project.pricePerShare.toLocaleString() }}</text>
							</view>
						</view>

						<view class="data-row">
							<view class="data-item">
								<text class="data-label">投资成本</text>
								<text class="data-value">¥{{ project.totalCost.toLocaleString() }}</text>
							</view>
							<view class="data-item">
								<text class="data-label">累计收益</text>
								<text class="data-value highlight">¥{{ project.totalRevenue.toLocaleString() }}</text>
							</view>
						</view>

						<view class="yield-row">
							<text class="yield-label">年化收益率</text>
							<text class="yield-value">{{ project.yieldRate }}</text>
						</view>
					</view>

					<view class="card-footer">
						<button class="action-btn" @tap.stop="viewIncome(project)">收益记录</button>
						<button class="action-btn primary" @tap.stop="transferShares(project)">份额转让</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 资产概览
const assetsSummary = ref({
	totalProjects: 2,
	totalShares: 15,
	totalCost: 150000,
	totalRevenue: 8520
});

// Mock持有项目数据
const projects = ref([
	{
		id: 'CF001',
		name: '览众C7房车',
		shares: 10,
		pricePerShare: 10000,
		totalCost: 100000,
		totalRevenue: 5200,
		yieldRate: '8.5%',
		status: 'operating' // operating运营中, completed已完结
	},
	{
		id: 'CF002',
		name: '上汽大通RV80',
		shares: 5,
		pricePerShare: 10000,
		totalCost: 50000,
		totalRevenue: 3320,
		yieldRate: '9.2%',
		status: 'operating'
	}
]);

// 获取状态文本
const getStatusText = (status: string) => {
	const statusMap: Record<string, string> = {
		operating: '运营中',
		completed: '已完结'
	};
	return statusMap[status] || status;
};

// 查看收益记录
const viewIncome = (project: any) => {
	uni.showModal({
		title: '收益记录',
		content: `${project.name}的累计收益为¥${project.totalRevenue.toLocaleString()}`,
		showCancel: false
	});
};

// 份额转让
const transferShares = (project: any) => {
	uni.showModal({
		title: '份额转让',
		content: `是否要转让${project.name}的份额?`,
		success: (res) => {
			if (res.confirm) {
				uni.showToast({
					title: '转让功能即将上线',
					icon: 'none'
				});
			}
		}
	});
};

// 跳转项目详情
const goToProjectDetail = (projectId: string) => {
	uni.navigateTo({
		url: `/pages/crowdfunding/detail?id=${projectId}`
	});
};

// 跳转众筹页
const goToCrowdfunding = () => {
	uni.switchTab({
		url: '/pages/crowdfunding/index'
	});
};
</script>

<style lang="scss" scoped>
.crowdfunding-assets-page {
	min-height: 100vh;
	background-color: #F5F5F5;
}

// 资产概览卡片
.summary-card {
	background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
	margin: 24rpx;
	border-radius: 24rpx;
	padding: 40rpx 32rpx;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32rpx;
	box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.summary-label {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.9);
		}

		.summary-value {
			font-size: 36rpx;
			font-weight: bold;
			color: #FFFFFF;

			&.highlight {
				color: #FFD700;
			}
		}
	}
}

// 项目列表区
.projects-section {
	background-color: #FFFFFF;
	margin: 24rpx;
	border-radius: 16rpx;
	padding: 24rpx;

	.section-header {
		margin-bottom: 24rpx;

		.title {
			font-size: 32rpx;
			font-weight: 600;
			color: rgba(0, 0, 0, 0.9);
		}
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;

	.empty-text {
		font-size: 28rpx;
		color: rgba(0, 0, 0, 0.4);
		margin: 24rpx 0 40rpx;
	}

	.browse-btn {
		padding: 20rpx 48rpx;
		background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
		color: #FFFFFF;
		border-radius: 44rpx;
		font-size: 28rpx;
		border: none;
	}
}

// 项目卡片
.project-cards {
	.project-card {
		background-color: #F8F8F8;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.card-header {
			margin-bottom: 24rpx;

			.project-info {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.project-name {
					font-size: 32rpx;
					font-weight: 600;
					color: rgba(0, 0, 0, 0.9);
				}

				.project-status {
					padding: 6rpx 16rpx;
					border-radius: 20rpx;
					font-size: 22rpx;
					font-weight: 500;

					&.operating {
						background-color: rgba(76, 175, 80, 0.1);
						color: #4CAF50;
					}

					&.completed {
						background-color: rgba(0, 0, 0, 0.1);
						color: rgba(0, 0, 0, 0.5);
					}
				}
			}
		}

		.card-body {
			.data-row {
				display: flex;
				justify-content: space-between;
				margin-bottom: 20rpx;

				.data-item {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 8rpx;

					.data-label {
						font-size: 24rpx;
						color: rgba(0, 0, 0, 0.5);
					}

					.data-value {
						font-size: 28rpx;
						font-weight: 600;
						color: rgba(0, 0, 0, 0.9);

						&.highlight {
							color: #4CAF50;
						}
					}
				}
			}

			.yield-row {
				background-color: rgba(76, 175, 80, 0.1);
				padding: 16rpx 20rpx;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.yield-label {
					font-size: 26rpx;
					color: rgba(0, 0, 0, 0.6);
				}

				.yield-value {
					font-size: 32rpx;
					font-weight: bold;
					color: #4CAF50;
				}
			}
		}

		.card-footer {
			margin-top: 24rpx;
			display: flex;
			gap: 16rpx;

			.action-btn {
				flex: 1;
				padding: 16rpx;
				border-radius: 24rpx;
				font-size: 26rpx;
				border: 2rpx solid #E0E0E0;
				background-color: #FFFFFF;
				color: rgba(0, 0, 0, 0.6);

				&.primary {
					background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
					color: #FFFFFF;
					border-color: transparent;
				}
			}
		}
	}
}
</style>
