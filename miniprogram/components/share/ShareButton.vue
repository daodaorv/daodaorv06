<template>
  <view class="share-button-wrapper">
    <!-- 分享按钮 -->
    <view class="share-button" @click="handleShare">
      <view class="button-content">
        <u-icon name="share-fill" size="20" color="#FFFFFF" />
        <text class="button-text">分享赚佣金</text>
      </view>

      <!-- 佣金预览标签 -->
      <view v-if="commissionPreview && commissionPreview.totalEstimate > 0" class="commission-badge">
        <text class="commission-text">预计赚¥{{ commissionPreview.totalEstimate }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" size="20" />

    <!-- 分享面板 -->
    <ShareSheet
      v-model:show="showShareSheet"
      :description="shareDescription"
      @select="handleShareSelect"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ShareSheet from './ShareSheet.vue'
import { shareApi } from '@/api/share'

/**
 * 一键分享按钮组件
 * @description 带佣金预览的分享按钮，支持生成海报和复制链接
 */

interface Props {
  /** 产品类型 */
  productType: 'vehicle' | 'tour' | 'campsite' | 'plus_member'
  /** 产品ID */
  productId: number
  /** 预估价格 */
  estimatedPrice: number
  /** 按钮样式类型 */
  buttonType?: 'primary' | 'success' | 'warning'
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  buttonType: 'warning',
  size: 'medium'
})

// 状态
const loading = ref(false)
const showShareSheet = ref(false)
const commissionPreview = ref<any>(null)

// 计算属性
const shareDescription = computed(() => {
  if (!commissionPreview.value) return '选择分享方式'

  const { isPlusReward, plusRewardAmount, totalEstimate } = commissionPreview.value

  if (isPlusReward && plusRewardAmount) {
    return `PLUS会员固定奖励 ¥${plusRewardAmount}`
  }

  return `预计佣金 ¥${totalEstimate}`
})

/**
 * 加载佣金预览
 */
const loadCommissionPreview = async () => {
  try {
    loading.value = true

    // 调用佣金预览API
    const response = await shareApi.previewCommission({
      productType: props.productType,
      productId: props.productId,
      estimatedPrice: props.estimatedPrice
    })

    commissionPreview.value = response
  } catch (error) {
    console.error('加载佣金预览失败:', error)
    uni.showToast({
      title: '加载佣金信息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 处理分享按钮点击
 */
const handleShare = () => {
  showShareSheet.value = true
}

/**
 * 处理分享选项选择
 */
const handleShareSelect = (index: number) => {
  if (index === 0) {
    // 生成海报
    handleGeneratePoster()
  } else if (index === 1) {
    // 复制链接
    handleCopyLink()
  }
}

/**
 * 生成海报
 */
const handleGeneratePoster = () => {
  uni.showToast({
    title: '正在生成海报...',
    icon: 'loading',
    duration: 2000
  })

  // TODO: 实现海报生成逻辑
  // 需要调用海报生成API，传入产品信息和用户ID
}

/**
 * 复制链接
 */
const handleCopyLink = () => {
  // 构建分享链接（包含用户ID用于追踪）
  const shareUrl = `/pages/${props.productType}/detail?id=${props.productId}&inviter=${uni.getStorageSync('userId')}`

  uni.setClipboardData({
    data: shareUrl,
    success: () => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }
  })
}

// 组件挂载时加载佣金预览
onMounted(() => {
  loadCommissionPreview()
})
</script>

<style lang="scss" scoped>
.share-button-wrapper {
  position: relative;
  display: inline-block;
}

.share-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 32rpx;
  background: linear-gradient(135deg, #FFB84D 0%, #FF9F29 100%);
  border-radius: 48rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 159, 41, 0.3);

  .button-content {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .button-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #FFFFFF;
  }

  .commission-badge {
    position: absolute;
    top: -12rpx;
    right: -12rpx;
    padding: 4rpx 12rpx;
    background: #FF4D4F;
    border-radius: 24rpx;
    border: 2rpx solid #FFFFFF;

    .commission-text {
      font-size: 20rpx;
      font-weight: 600;
      color: #FFFFFF;
      white-space: nowrap;
    }
  }
}

// 尺寸变体
.share-button.small {
  padding: 12rpx 24rpx;

  .button-text {
    font-size: 24rpx;
  }
}

.share-button.large {
  padding: 28rpx 48rpx;

  .button-text {
    font-size: 32rpx;
  }
}
</style>
