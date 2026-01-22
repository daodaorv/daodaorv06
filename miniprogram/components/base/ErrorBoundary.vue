<template>
	<view class="error-boundary">
		<slot v-if="!hasError"></slot>
		<view v-else class="error-container">
			<view class="error-icon">
				<u-icon name="close" size="80" color="#F44336"></u-icon>
			</view>
			<text class="error-title">{{ title }}</text>
			<text class="error-message">{{ errorMessage || defaultMessage }}</text>
			<button class="retry-button" @tap="handleRetry">
				{{ retryText }}
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { logger } from '@/utils/logger';

interface Props {
	/** 错误标题 */
	title?: string;
	/** 默认错误消息 */
	defaultMessage?: string;
	/** 重试按钮文字 */
	retryText?: string;
	/** 是否捕获错误（设为 false 则继续向上传播） */
	stopPropagation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	title: '页面加载失败',
	defaultMessage: '请稍后重试',
	retryText: '重新加载',
	stopPropagation: true
});

const hasError = ref(false);
const errorMessage = ref('');

const emit = defineEmits<{
	(e: 'error', error: Error): void
	(e: 'retry'): void
}>();

/**
 * 捕获子组件错误
 * Vue 3 的 onErrorCaptured 钩子
 */
onErrorCaptured((error: Error, instance, info: string) => {
	hasError.value = true;
	errorMessage.value = error.message || props.defaultMessage;

	// 记录错误日志
	logger.error('ErrorBoundary 捕获错误:', {
		message: error.message,
		stack: error.stack,
		info,
		component: instance?.$options?.name || 'Unknown'
	});

	// 触发错误事件
	emit('error', error);

	// 返回 false 继续向上传播，返回 true 阻止传播
	return props.stopPropagation;
});

/**
 * 手动设置错误状态（供外部调用）
 */
const setError = (error: Error | string) => {
	hasError.value = true;
	errorMessage.value = typeof error === 'string' ? error : error.message;
};

const handleRetry = () => {
	hasError.value = false;
	errorMessage.value = '';
	emit('retry');
};

const reset = () => {
	hasError.value = false;
	errorMessage.value = '';
};

defineExpose({
	reset,
	setError,
	hasError
});
</script>

<style scoped lang="scss">
.error-boundary {
	width: 100%;
	min-height: 400rpx;
}

.error-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 32rpx;
	min-height: 400rpx;
}

.error-icon {
	margin-bottom: 24rpx;
}

.error-title {
	font-size: 32rpx;
	color: $uni-text-color;
	font-weight: bold;
	margin-bottom: 16rpx;
}

.error-message {
	font-size: 24rpx;
	color: $uni-text-color-secondary;
	text-align: center;
	line-height: 1.5;
	margin-bottom: 32rpx;
}

.retry-button {
	padding: 16rpx 48rpx;
	background-color: $uni-color-primary;
	color: #FFFFFF;
	border-radius: $uni-radius-md;
	font-size: 28rpx;
	border: none;
}
</style>
