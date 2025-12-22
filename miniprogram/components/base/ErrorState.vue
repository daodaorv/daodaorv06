<template>
	<view class="error-state">
		<u-empty
			mode="data"
			:icon="customIcon || 'error-circle'"
			:text="message || '加载失败'"
			:textColor="errorColor"
			:textSize="textSize"
			:iconSize="iconSize"
			:iconColor="errorColor"
		>
			<!-- 重试按钮 -->
			<template #bottom>
				<u-button
					:text="retryText"
					type="error"
					:custom-style="{
						width: '320rpx',
						height: '80rpx',
						borderRadius: '50rpx',
						fontSize: '28rpx',
						marginTop: '32rpx',
						background: errorColor
					}"
					@click="handleRetry"
				></u-button>
			</template>
		</u-empty>
	</view>
</template>

<script setup lang="ts">
// 错误颜色常量（与 uni.scss 中 $uni-color-error 保持一致）
const errorColor = '#FF4D4F';

interface Props {
	customIcon?: string;
	message?: string;
	retryText?: string;
	textSize?: string | number;
	iconSize?: string | number;
}

withDefaults(defineProps<Props>(), {
	message: '加载失败，请重试',
	retryText: '重新加载',
	textSize: 28,
	iconSize: 200
});

const emit = defineEmits<{
	(e: 'retry'): void;
}>();

const handleRetry = () => {
	emit('retry');
};
</script>

<style scoped lang="scss">
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 64rpx;
	min-height: 400rpx;
}
</style>
