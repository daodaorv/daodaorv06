<template>
	<view class="rating-create-page">
		<!-- 订单信息 -->
		<view class="order-info">
			<view class="info-row">
				<text class="label">订单类型</text>
				<text class="value">{{ getTypeName(ratingType) }}</text>
			</view>
			<view class="info-row">
				<text class="label">服务名称</text>
				<text class="value">{{ targetName }}</text>
			</view>
		</view>

		<!-- 评分区域 -->
		<view class="rating-section">
			<view class="section-title">
				<text>服务评分</text>
				<text class="required">*</text>
			</view>
			<view class="star-rating">
				<view
					v-for="star in 5"
					:key="star"
					class="star-item"
					@click="handleStarClick(star)"
				>
					<u-icon
						:name="star <= rating ? 'star-filled' : 'star'"
						:color="star <= rating ? '#FF9F29' : '#E0E0E0'"
						size="40"
					/>
				</view>
			</view>
			<view class="rating-desc">
				<text>{{ getRatingDesc(rating) }}</text>
			</view>
		</view>

		<!-- 评价标签 -->
		<view class="tags-section">
			<view class="section-title">
				<text>选择标签</text>
			</view>
			<view class="tags-list">
				<view
					v-for="tag in availableTags"
					:key="tag"
					class="tag-item"
					:class="selectedTags.includes(tag) ? 'selected' : ''"
					@click="toggleTag(tag)"
				>
					<text>{{ tag }}</text>
				</view>
			</view>
		</view>

		<!-- 评价内容 -->
		<view class="content-section">
			<view class="section-title">
				<text>评价内容</text>
				<text class="required">*</text>
			</view>
			<textarea
				v-model="content"
				class="content-textarea"
				placeholder="分享您的使用体验，帮助其他用户做出选择（10-500字）"
				:maxlength="500"
				:show-confirm-bar="false"
			/>
			<view class="char-count">
				<text>{{ content.length }}/500</text>
			</view>
		</view>

		<!-- 图片上传 -->
		<view class="images-section">
			<view class="section-title">
				<text>上传图片</text>
				<text class="tip">（最多9张，晒图额外奖励20积分）</text>
			</view>
			<view class="images-grid">
				<view
					v-for="(image, index) in images"
					:key="index"
					class="image-item"
				>
					<image :src="photo" mode="aspectFill" class="photo"></image>
					<view class="image-delete" @click="deleteImage(index)">
						<u-icon name="close" color="#FFFFFF" size="16" />
					</view>
				</view>
				<view
					v-if="images.length < 9"
					class="image-upload"
					@click="chooseImage"
				>
					<u-icon name="camera" color="#999999" size="40" />
					<text class="upload-text">上传图片</text>
				</view>
			</view>
		</view>

		<!-- 评价激励 -->
		<view class="reward-section">
			<view class="reward-card">
				<view class="reward-icon">
					<u-icon name="gift-fill" color="#FF9F29" size="32" />
				</view>
				<view class="reward-content">
					<text class="reward-title">评价奖励</text>
					<text class="reward-desc">优质评价可获得{{ calculateReward() }}积分奖励</text>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<button class="submit-btn" @click="handleSubmit" :disabled="!canSubmit">
				提交评价
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed, onMounted } from 'vue'
import { mockCreateRating, type RatingType } from '@/api/rating'

// 页面参数
const orderId = ref('')
const ratingType = ref<RatingType>('VEHICLE')
const targetId = ref('')
const targetName = ref('')

// 评分
const rating = ref(5)

// 选中的标签
const selectedTags = ref<string[]>([])

// 评价内容
const content = ref('')

// 上传的图片
const images = ref<string[]>([])

// 可用标签（根据类型动态变化）
const availableTags = computed(() => {
	const tagMap: Record<RatingType, string[]> = {
		VEHICLE: ['车况好', '服务好', '性价比高', '驾驶舒适', '设施齐全', '清洁卫生'],
		CAMPSITE: ['环境好', '设施完善', '服务周到', '位置便利', '安静舒适', '性价比高'],
		TOUR: ['行程好', '领队专业', '风景美', '体验棒', '安排合理', '值得推荐']
	}
	return tagMap[ratingType.value] || []
})

// 是否可以提交
const canSubmit = computed(() => {
	return rating.value > 0 && content.value.length >= 10 && content.value.length <= 500
})

// 获取类型名称
const getTypeName = (type: RatingType) => {
	const names: Record<RatingType, string> = {
		VEHICLE: '房车租赁',
		CAMPSITE: '营地预订',
		TOUR: '房车旅游'
	}
	return names[type]
}

// 获取评分描述
const getRatingDesc = (score: number) => {
	const descs = ['', '非常不满意', '不满意', '一般', '满意', '非常满意']
	return descs[score] || ''
}

// 处理星星点击
const handleStarClick = (star: number) => {
	rating.value = star
}

// 切换标签
const toggleTag = (tag: string) => {
	const index = selectedTags.value.indexOf(tag)
	if (index > -1) {
		selectedTags.value.splice(index, 1)
	} else {
		selectedTags.value.push(tag)
	}
}

// 选择图片
const chooseImage = () => {
	const remainCount = 9 - images.value.length
	uni.chooseImage({
		count: remainCount,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			// 模拟上传，实际应该调用上传接口
			images.value.push(...res.tempFilePaths)
		}
	})
}

// 删除图片
const deleteImage = (index: number) => {
	uni.showModal({
		title: '提示',
		content: '确定删除这张图片吗？',
		success: (res) => {
			if (res.confirm) {
				images.value.splice(index, 1)
			}
		}
	})
}

// 计算奖励积分
const calculateReward = () => {
	let reward = 10
	if (rating.value >= 4) reward = 30
	if (images.value.length > 0) reward += 20
	return reward
}

// 提交评价
const handleSubmit = async () => {
	if (!canSubmit.value) {
		uni.showToast({
			title: '请完善评价内容',
			icon: 'none'
		})
		return
	}

	try {
		uni.showLoading({ title: '提交中...' })

		// 使用Mock数据
		const result = await mockCreateRating({
			orderId: orderId.value,
			type: ratingType.value,
			targetId: targetId.value,
			rating: rating.value,
			content: content.value,
			images: images.value,
			tags: selectedTags.value
		})

		uni.hideLoading()

		// 显示成功提示
		uni.showModal({
			title: '评价成功',
			content: `感谢您的评价！已获得${result.rewardPoints}积分奖励`,
			showCancel: false,
			success: () => {
				// 返回上一页
				uni.navigateBack()
			}
		})
	} catch (error) {
		logger.error('提交评价失败:', error)
		uni.hideLoading()
		uni.showToast({
			title: '提交失败',
			icon: 'none'
		})
	}
}

onMounted(() => {
	// 获取页面参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1] as any
	const options = currentPage.options || {}

	orderId.value = options.orderId || 'order_001'
	ratingType.value = (options.type as RatingType) || 'VEHICLE'
	targetId.value = options.targetId || 'target_001'
	targetName.value = options.targetName || '依维柯欧胜C型房车'
})
</script>

<style lang="scss" scoped>
.rating-create-page {
	min-height: 100vh;
	background: $uni-bg-color;
	padding-bottom: 120rpx;
}

// 订单信息
.order-info {
	margin: $uni-spacing-xl;
	background: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	padding: $uni-spacing-xl;
	box-shadow: $uni-shadow-card;

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: $uni-spacing-lg 0;

		&:not(:last-child) {
			border-bottom: 1rpx solid $uni-border-color-light;
		}

		.label {
			font-size: $uni-font-size-base;
			color: $uni-text-color-placeholder;
		}

		.value {
			font-size: $uni-font-size-base;
			color: $uni-text-color;
			font-weight: 500;
		}
	}
}

// 通用区块样式
.rating-section,
.tags-section,
.content-section,
.images-section,
.reward-section {
	margin: $uni-spacing-xl;
	background: $uni-bg-color-card;
	border-radius: $uni-radius-lg;
	padding: $uni-spacing-xl;
	box-shadow: $uni-shadow-card;
}

.section-title {
	font-size: $uni-font-size-lg;
	font-weight: bold;
	color: $uni-text-color;
	margin-bottom: $uni-spacing-xl;

	.required {
		color: $uni-color-error;
		margin-left: $uni-spacing-sm;
	}

	.tip {
		font-size: $uni-font-size-xs;
		color: $uni-text-color-placeholder;
		font-weight: normal;
		margin-left: $uni-spacing-lg;
	}
}

// 评分区域
.star-rating {
	display: flex;
	justify-content: center;
	gap: $uni-spacing-xl;
	padding: $uni-spacing-xl 0;

	.star-item {
		cursor: pointer;
		transition: all 0.2s ease;

		&:active {
			transform: scale(1.1);
		}
	}
}

.rating-desc {
	text-align: center;

	text {
		font-size: $uni-font-size-base;
		color: $uni-color-primary;
		font-weight: 500;
	}
}

// 标签区域
.tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: $uni-spacing-lg;

	.tag-item {
		padding: $uni-spacing-lg $uni-spacing-xl;
		background: $uni-bg-color-grey;
		border-radius: $uni-radius-btn;
		border: 2rpx solid transparent;
		transition: all 0.3s;

		text {
			font-size: $uni-font-size-sm;
			color: $uni-text-color-secondary;
		}

		&.selected {
			background: rgba($uni-color-primary, 0.08);
			border-color: $uni-color-primary;

			text {
				color: $uni-color-primary;
			}
		}
	}
}

// 评价内容
.content-textarea {
	width: 100%;
	min-height: 300rpx;
	padding: $uni-spacing-xl;
	background: $uni-bg-color-grey;
	border-radius: $uni-radius-lg;
	font-size: $uni-font-size-base;
	color: $uni-text-color;
	line-height: 1.6;
}

.char-count {
	text-align: right;
	margin-top: $uni-spacing-lg;

	text {
		font-size: $uni-font-size-xs;
		color: $uni-text-color-placeholder;
	}
}

// 图片上传
.images-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: $uni-spacing-lg;

	.image-item {
		position: relative;
		width: 100%;
		padding-bottom: 100%;
		border-radius: $uni-radius-lg;
		overflow: hidden;

		.image {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.image-delete {
			position: absolute;
			top: $uni-spacing-sm;
			right: $uni-spacing-sm;
			width: 48rpx;
			height: 48rpx;
			background: rgba(0, 0, 0, 0.5);
			border-radius: $uni-radius-circle;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.9);
			}
		}
	}

	.image-upload {
		width: 100%;
		padding-bottom: 100%;
		position: relative;
		background: $uni-bg-color-grey;
		border: 2rpx dashed $uni-border-color;
		border-radius: $uni-radius-lg;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;

		&:active {
			border-color: $uni-color-primary;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.upload-text {
			position: absolute;
			bottom: 30%;
			font-size: $uni-font-size-xs;
			color: $uni-text-color-placeholder;
		}
	}
}

// 评价激励
.reward-card {
	display: flex;
	align-items: center;
	padding: $uni-spacing-xl;
	background: linear-gradient(135deg, rgba($uni-color-primary, 0.08) 0%, rgba($uni-color-primary, 0.15) 100%);
	border-radius: $uni-radius-lg;

	.reward-icon {
		width: 64rpx;
		height: 64rpx;
		background: $uni-bg-color-card;
		border-radius: $uni-radius-circle;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: $uni-spacing-xl;
	}

	.reward-content {
		flex: 1;

		.reward-title {
			display: block;
			font-size: $uni-font-size-base;
			font-weight: 500;
			color: $uni-text-color;
			margin-bottom: $uni-spacing-sm;
		}

		.reward-desc {
			display: block;
			font-size: $uni-font-size-xs;
			color: $uni-color-primary;
		}
	}
}

// 底部操作栏
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: $uni-bg-color-card;
	padding: $uni-spacing-xl $uni-spacing-xl;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
	z-index: 100;

	.submit-btn {
		width: 100%;
		padding: 28rpx;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		border-radius: $uni-radius-btn;
		font-size: $uni-font-size-lg;
		font-weight: bold;
		border: none;
		box-shadow: $uni-shadow-glow;
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&[disabled] {
			opacity: 0.5;
			box-shadow: none;
		}
	}
}
</style>
