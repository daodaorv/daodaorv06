<!-- 房车卡片骨架屏组件 -->
<template>
  <view class="vehicle-skeleton">
    <view class="skeleton-image">
      <view class="skeleton-shimmer"></view>
    </view>
    <view class="skeleton-content">
      <view class="skeleton-header">
        <view class="skeleton-title">
          <view class="skeleton-shimmer"></view>
        </view>
        <view class="skeleton-rating">
          <view class="skeleton-shimmer"></view>
        </view>
      </view>
      <view class="skeleton-specs">
        <view class="skeleton-spec">
          <view class="skeleton-shimmer"></view>
        </view>
        <view class="skeleton-spec">
          <view class="skeleton-shimmer"></view>
        </view>
        <view class="skeleton-spec">
          <view class="skeleton-shimmer"></view>
        </view>
      </view>
      <view class="skeleton-features">
        <view class="skeleton-feature">
          <view class="skeleton-shimmer"></view>
        </view>
        <view class="skeleton-feature">
          <view class="skeleton-shimmer"></view>
        </view>
      </view>
      <view class="skeleton-store">
        <view class="skeleton-shimmer"></view>
      </view>
      <view class="skeleton-footer">
        <view class="skeleton-price">
          <view class="skeleton-shimmer"></view>
        </view>
        <view class="skeleton-button">
          <view class="skeleton-shimmer"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface VehicleSkeletonProps {
  /** 是否显示动画 */
  animated?: boolean;
}

const props = withDefaults(defineProps<VehicleSkeletonProps>(), {
  animated: true
});
</script>

<style>
// 色彩系统
#F2F3F5: #F2F3F5;
rgba(255, 255, 255, 0.4): rgba(255, 255, 255, 0.4);

.vehicle-skeleton {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;

  .skeleton-image {
    width: 280rpx;
    height: 200rpx;
    flex-shrink: 0;
    background: #F2F3F5;
    position: relative;
    overflow: hidden;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24rpx;
    justify-content: space-between;
    gap: 16rpx;
  }

  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16rpx;

    .skeleton-title {
      width: 120rpx;
      height: 32rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }

    .skeleton-rating {
      width: 80rpx;
      height: 24rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }
  }

  .skeleton-specs {
    display: flex;
    gap: 16rpx;

    .skeleton-spec {
      width: 60rpx;
      height: 24rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }
  }

  .skeleton-features {
    display: flex;
    gap: 12rpx;

    .skeleton-feature {
      width: 80rpx;
      height: 28rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }
  }

  .skeleton-store {
    width: 200rpx;
    height: 24rpx;
    background: #F2F3F5;
    border-radius: 8rpx;
    position: relative;
    overflow: hidden;
  }

  .skeleton-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .skeleton-price {
      width: 100rpx;
      height: 36rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }

    .skeleton-button {
      width: 120rpx;
      height: 48rpx;
      background: #F2F3F5;
      border-radius: 8rpx;
      position: relative;
      overflow: hidden;
    }
  }

  // 骨架屏闪烁动画
  .skeleton-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .vehicle-skeleton  { .skeleton-image { width: 240rpx;
      height: 160rpx; }.skeleton-content { padding: 20rpx;
      gap: 12rpx; }.skeleton-header { .skeleton-title { width: 100rpx;
        height: 28rpx; }.skeleton-rating { width: 70rpx;
        height: 22rpx; } }

    .skeleton-specs   .skeleton-spec { width: 50rpx;
        height: 22rpx; }

    .skeleton-features   .skeleton-feature { width: 70rpx;
        height: 24rpx; }

    .skeleton-footer  { .skeleton-price { width: 90rpx;
        height: 32rpx; }.skeleton-button { width: 100rpx;
        height: 40rpx; } }
  }
}
</style>