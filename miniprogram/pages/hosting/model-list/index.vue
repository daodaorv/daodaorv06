<template>
	<view class="model-list-page">
		<!-- 列表内容 -->
		<scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
			<view class="list-container">
				<!-- 骨架屏加载 -->
				<view v-if="loading" class="skeleton-list">
					<view v-for="i in 3" :key="i" class="skeleton-card">
						<view class="skeleton-image"></view>
						<view class="skeleton-content">
							<view class="skeleton-line"></view>
							<view class="skeleton-line short"></view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-else-if="!loading && models.length === 0" class="empty-state">
					<u-icon name="car" size="80" color="#CCC"></u-icon>
					<text class="empty-text">暂无车型</text>
				</view>

				<!-- 车型列表 -->
				<template v-else>
					<view v-for="model in models" :key="model.id" class="model-card" @click="goToDetail(model)">
						<image :src="model.image" class="model-image" mode="aspectFill"></image>
						<view class="model-content">
							<view class="model-header">
								<text class="model-name">{{ model.name }}</text>
								<view class="brand-tag">{{ model.brand }}</view>
							</view>
							<view class="model-price">
								<view class="price-item">
									<text class="price-label">购车价格</text>
									<text class="price-value">¥{{ formatPrice(model.price) }}</text>
								</view>
								<view class="price-divider"></view>
								<view class="price-item">
									<text class="price-label">月供参考</text>
									<text class="price-value">¥{{ model.monthlyPayment }}/月</text>
								</view>
							</view>
							<view class="model-specs">
								<text class="spec-item">{{ model.seats }}座{{ model.beds }}卧</text>
								<text class="spec-divider">|</text>
								<text class="spec-item">{{ model.transmission }}</text>
								<text class="spec-divider">|</text>
								<text class="spec-item">{{ model.length }}mm</text>
							</view>
							<view class="model-features">
								<text v-for="(feature, index) in model.features.slice(0, 3)" :key="index" class="feature-tag">
									{{ feature }}
								</text>
							</view>
						</view>
					</view>

					<!-- 底部安全区 -->
					<view class="safe-area-bottom"></view>
				</template>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { logger } from '@/utils/logger';
import { getPopularModels } from '@/api/hosting'

export default {
	data() {
		return {
			loading: false,
			models: []
		}
	},
	onLoad() {
		this.loadModels()
	},
	onPullDownRefresh() {
		this.loadModels()
	},
	methods: {
		async loadModels() {
			try {
				this.loading = true
				const data = await getPopularModels()
				this.models = data
				this.loading = false
				uni.stopPullDownRefresh()
			} catch (error) {
				logger.error('加载车型列表失败:', error)
				this.loading = false
				uni.stopPullDownRefresh()
				uni.showToast({ title: '加载失败', icon: 'none' })
			}
		},
		loadMore() {
			// 预留分页加载功能
			logger.debug('加载更多')
		},
		goToDetail(model) {
			uni.navigateTo({
				url: `/pages/hosting/model-detail/index?id=${model.id}`
			})
		},
		formatPrice(price) {
			return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		}
	}
}
</script>

<style scoped lang="scss">
.model-list-page {
  min-height: 100vh;
  background: $uni-bg-color;
}

// 列表滚动容器
.list-scroll {
  height: 100vh;
}

.list-container {
  padding: $uni-spacing-xl $uni-spacing-xl;
}

// 骨架屏
.skeleton-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  margin-bottom: $uni-spacing-xl;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 360rpx;
  background: linear-gradient(90deg, $uni-border-color-light 25%, $uni-border-color 50%, $uni-border-color-light 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-content {
  padding: $uni-spacing-xl;
}

.skeleton-line {
  height: 32rpx;
  background: linear-gradient(90deg, $uni-border-color-light 25%, $uni-border-color 50%, $uni-border-color-light 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: $uni-radius-sm;
  margin-bottom: $uni-spacing-lg;

  &.short {
    width: 60%;
  }
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  margin-top: $uni-spacing-xl;
}

// 车型卡片
.model-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  margin-bottom: $uni-spacing-xl;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.model-image {
  width: 100%;
  height: 360rpx;
}

.model-content {
  padding: $uni-spacing-xl;
}

// 车型头部
.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
}

.model-name {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.brand-tag {
  padding: $uni-spacing-xs $uni-spacing-lg;
  background: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: $uni-font-size-xs;
  border-radius: $uni-radius-sm;
}

// 价格信息
.model-price {
  display: flex;
  align-items: center;
  padding: $uni-spacing-lg 0;
  margin-bottom: $uni-spacing-lg;
  border-top: 1rpx solid $uni-border-color-light;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.price-item {
  flex: 1;
}

.price-label {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-sm;
}

.price-value {
  display: block;
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-color-primary;
}

.price-divider {
  width: 1rpx;
  height: 60rpx;
  background: $uni-border-color-light;
}

// 规格信息
.model-specs {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
}

.spec-item {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

.spec-divider {
  margin: 0 $uni-spacing-lg;
  color: $uni-border-color;
}

// 特色标签
.model-features {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-md;
}

.feature-tag {
  padding: $uni-spacing-sm $uni-spacing-lg;
  background: $uni-bg-color-grey;
  color: $uni-text-color-secondary;
  font-size: $uni-font-size-xs;
  border-radius: $uni-radius-sm;
}

// 底部安全区
.safe-area-bottom {
  height: 40rpx;
}
</style>
