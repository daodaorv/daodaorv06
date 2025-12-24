<template>
	<view class="lazy-image-wrapper" :style="wrapperStyle">
		<!-- 加载中占位 -->
		<view v-if="loading" class="placeholder">
			<view class="loading-skeleton" :class="{ animate: showSkeleton }"></view>
		</view>

		<!-- 加载失败占位 -->
		<view v-else-if="error" class="error-placeholder" @click="retry">
			<u-icon name="photo" size="40" color="#CCCCCC" />
			<text class="error-text">加载失败</text>
			<text v-if="showRetry" class="retry-text">点击重试</text>
		</view>

		<!-- 实际图片 -->
		<image
			v-show="!loading && !error"
			class="lazy-image"
			:src="currentSrc"
			:mode="mode"
			:lazy-load="true"
			:fade-show="fadeShow"
			@load="handleLoad"
			@error="handleError"
		/>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
	/** 图片地址 */
	src: string
	/** 图片裁剪模式 */
	mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right'
	/** 容器宽度 */
	width?: string | number
	/** 容器高度 */
	height?: string | number
	/** 圆角 */
	radius?: string | number
	/** 是否显示加载骨架动画 */
	showSkeleton?: boolean
	/** 是否显示淡入效果 */
	fadeShow?: boolean
	/** 是否显示重试按钮 */
	showRetry?: boolean
	/** 默认占位图 */
	placeholder?: string
	/** 错误占位图 */
	errorImage?: string
	/** 重试次数限制 */
	maxRetry?: number
}

const props = withDefaults(defineProps<Props>(), {
	mode: 'aspectFill',
	width: '100%',
	height: '100%',
	radius: 0,
	showSkeleton: true,
	fadeShow: true,
	showRetry: true,
	placeholder: '',
	errorImage: '',
	maxRetry: 3
})

const emit = defineEmits<{
	(e: 'load', event: Event): void
	(e: 'error', event: Event): void
}>()

const loading = ref(true)
const error = ref(false)
const retryCount = ref(0)
const currentSrc = ref('')

// 容器样式
const wrapperStyle = computed(() => {
	const width = typeof props.width === 'number' ? `${props.width}rpx` : props.width
	const height = typeof props.height === 'number' ? `${props.height}rpx` : props.height
	const radius = typeof props.radius === 'number' ? `${props.radius}rpx` : props.radius

	return {
		width,
		height,
		borderRadius: radius,
		overflow: 'hidden'
	}
})

// 加载成功
const handleLoad = (event: Event) => {
	loading.value = false
	error.value = false
	emit('load', event)
}

// 加载失败
const handleError = (event: Event) => {
	loading.value = false
	error.value = true
	emit('error', event)

	// 如果有错误占位图，显示错误占位图
	if (props.errorImage) {
		currentSrc.value = props.errorImage
		error.value = false
	}
}

// 重试加载
const retry = () => {
	if (retryCount.value >= props.maxRetry) {
		uni.showToast({
			title: '重试次数已达上限',
			icon: 'none'
		})
		return
	}

	retryCount.value++
	loading.value = true
	error.value = false

	// 添加时间戳强制重新加载
	const timestamp = Date.now()
	const separator = props.src.includes('?') ? '&' : '?'
	currentSrc.value = `${props.src}${separator}_t=${timestamp}`
}

// 初始化
const initImage = () => {
	if (props.src) {
		currentSrc.value = props.src
		loading.value = true
		error.value = false
		retryCount.value = 0
	} else if (props.placeholder) {
		currentSrc.value = props.placeholder
		loading.value = false
	}
}

// 监听 src 变化
watch(() => props.src, () => {
	initImage()
})

onMounted(() => {
	initImage()
})
</script>

<style scoped lang="scss">
.lazy-image-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F5F5F5;
}

.lazy-image {
	width: 100%;
	height: 100%;
}

.placeholder {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-skeleton {
	width: 100%;
	height: 100%;
	background: linear-gradient(
		90deg,
		#F0F0F0 25%,
		#E0E0E0 50%,
		#F0F0F0 75%
	);
	background-size: 200% 100%;

	&.animate {
		animation: skeleton-loading 1.5s infinite;
	}
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.error-placeholder {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #F5F5F5;

	.error-text {
		font-size: 24rpx;
		color: #999999;
		margin-top: 16rpx;
	}

	.retry-text {
		font-size: 22rpx;
		color: #FF9F29;
		margin-top: 8rpx;
	}
}
</style>
