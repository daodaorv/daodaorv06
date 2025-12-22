<template>
	<view v-if="content" class="announcement-bar">
		<view class="announcement-icon">
			<u-icon name="volume-fill" size="16" color="#FF9F29"></u-icon>
		</view>
		<scroll-view
			class="announcement-content"
			:scroll-y="isOverflow"
			:show-scrollbar="false"
		>
			<text class="announcement-text">{{ content }}</text>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface Props {
	content?: string;
}

const props = withDefaults(defineProps<Props>(), {
	content: ''
});

const isOverflow = ref(false);

// 检查内容是否超出3行
onMounted(() => {
	nextTick(() => {
		// 使用 uni.createSelectorQuery 检查内容高度
		const query = uni.createSelectorQuery();
		query.select('.announcement-text').boundingClientRect((data: any) => {
			if (data) {
				// 单行高度约为 44rpx (line-height 1.6 * font-size 28rpx)
				// 3行高度约为 132rpx
				const maxHeight = 132;
				isOverflow.value = data.height > maxHeight;
			}
		}).exec();
	});
});
</script>

<style scoped lang="scss">
.announcement-bar {
	display: flex;
	align-items: flex-start;
	gap: $uni-spacing-md;
	background: linear-gradient(90deg, rgba(255, 159, 41, 0.08) 0%, rgba(255, 159, 41, 0.02) 100%);
	padding: $uni-spacing-lg;
	border-radius: $uni-radius-lg;
	margin: $uni-spacing-md 0;
	border-left: 6rpx solid $uni-color-primary;
	width: 100%;
	box-sizing: border-box;
}

.announcement-icon {
	flex-shrink: 0;
	margin-top: 4rpx;
}

.announcement-content {
	flex: 1;
	max-height: 132rpx; // 3行的最大高度
	overflow: hidden;
	min-width: 0; // 确保flex子元素可以正确收缩
}

.announcement-text {
	font-size: 28rpx;
	color: $uni-text-color-secondary;
	line-height: 1.6;
	word-break: break-all;
	display: block;
}
</style>
