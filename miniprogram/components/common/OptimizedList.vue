<template>
	<scroll-view
		class="optimized-list"
		scroll-y
		:scroll-top="scrollTop"
		:refresher-enabled="refresherEnabled"
		:refresher-triggered="refreshing"
		:lower-threshold="lowerThreshold"
		@scrolltolower="handleScrollToLower"
		@refresherrefresh="handleRefresh"
		@scroll="handleScroll"
	>
		<!-- 下拉刷新提示 -->
		<view v-if="refresherEnabled" class="refresh-tip">
			<text v-if="refreshing">正在刷新...</text>
			<text v-else>下拉刷新</text>
		</view>

		<!-- 列表内容 -->
		<view class="list-content">
			<slot></slot>
		</view>

		<!-- 底部加载状态 -->
		<view class="load-more" v-if="showLoadMore">
			<view v-if="loading" class="loading-state">
				<u-loading-icon size="24" color="#999999"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="noMore" class="no-more-state">
				<text class="no-more-text">{{ noMoreText }}</text>
			</view>
			<view v-else class="load-more-state" @click="handleLoadMore">
				<text class="load-more-text">点击加载更多</text>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="isEmpty && !loading" class="empty-wrapper">
			<slot name="empty">
				<view class="default-empty">
					<u-icon name="inbox" size="80" color="#CCCCCC"></u-icon>
					<text class="empty-text">{{ emptyText }}</text>
				</view>
			</slot>
		</view>

		<!-- 回到顶部按钮 -->
		<view
			v-if="showBackTop && showBackTopButton"
			class="back-top-btn"
			@click="scrollToTop"
		>
			<u-icon name="arrow-up" size="24" color="#666666"></u-icon>
		</view>
	</scroll-view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
	/** 是否正在加载 */
	loading?: boolean
	/** 是否正在刷新 */
	refreshing?: boolean
	/** 是否没有更多数据 */
	noMore?: boolean
	/** 列表是否为空 */
	isEmpty?: boolean
	/** 是否启用下拉刷新 */
	refresherEnabled?: boolean
	/** 是否显示加载更多区域 */
	showLoadMore?: boolean
	/** 是否显示回到顶部按钮 */
	showBackTop?: boolean
	/** 触发加载更多的阈值 */
	lowerThreshold?: number
	/** 显示回到顶部按钮的滚动阈值 */
	backTopThreshold?: number
	/** 没有更多数据的提示文本 */
	noMoreText?: string
	/** 空状态提示文本 */
	emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	refreshing: false,
	noMore: false,
	isEmpty: false,
	refresherEnabled: true,
	showLoadMore: true,
	showBackTop: true,
	lowerThreshold: 100,
	backTopThreshold: 400,
	noMoreText: '没有更多了',
	emptyText: '暂无数据'
})

const emit = defineEmits<{
	(e: 'load-more'): void
	(e: 'refresh'): void
	(e: 'scroll', event: { scrollTop: number }): void
}>()

const scrollTop = ref(0)
const showBackTopButton = ref(false)
const currentScrollTop = ref(0)

// 滚动到底部
const handleScrollToLower = () => {
	if (!props.loading && !props.noMore) {
		emit('load-more')
	}
}

// 下拉刷新
const handleRefresh = () => {
	emit('refresh')
}

// 手动触发加载更多
const handleLoadMore = () => {
	if (!props.loading && !props.noMore) {
		emit('load-more')
	}
}

// 滚动事件
const handleScroll = (e: { detail: { scrollTop: number } }) => {
	currentScrollTop.value = e.detail.scrollTop
	showBackTopButton.value = e.detail.scrollTop > props.backTopThreshold
	emit('scroll', { scrollTop: e.detail.scrollTop })
}

// 回到顶部
const scrollToTop = () => {
	scrollTop.value = currentScrollTop.value
	// 使用 nextTick 确保 scrollTop 变化被检测到
	setTimeout(() => {
		scrollTop.value = 0
	}, 10)
}

// 暴露方法给父组件
defineExpose({
	scrollToTop
})
</script>

<style scoped lang="scss">
.optimized-list {
	height: 100%;
	position: relative;
}

.refresh-tip {
	text-align: center;
	padding: 20rpx;
	font-size: 24rpx;
	color: #999999;
}

.list-content {
	min-height: 100%;
}

.load-more {
	padding: 32rpx 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

.loading-state {
	display: flex;
	align-items: center;
	gap: 16rpx;

	.loading-text {
		font-size: 26rpx;
		color: #999999;
	}
}

.no-more-state {
	.no-more-text {
		font-size: 26rpx;
		color: #CCCCCC;
	}
}

.load-more-state {
	.load-more-text {
		font-size: 26rpx;
		color: #FF9F29;
	}
}

.empty-wrapper {
	padding: 120rpx 64rpx;
}

.default-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.empty-text {
		font-size: 28rpx;
		color: #999999;
		margin-top: 24rpx;
	}
}

.back-top-btn {
	position: fixed;
	right: 32rpx;
	bottom: 200rpx;
	width: 88rpx;
	height: 88rpx;
	background-color: #FFFFFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
		background-color: #F5F5F5;
	}
}
</style>
