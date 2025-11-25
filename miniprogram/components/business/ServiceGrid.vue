<!-- 功能网格组件 - ServiceGrid -->
<template>
  <view class="service-grid" :class="[`service-grid--${columns}`, { 'service-grid--compact': compact }]">
    <view
      v-for="(service, index) in services"
      :key="service.id || index"
      class="service-grid__item"
      @click="handleServiceClick(service, index)"
    >
      <view class="service-grid__icon-wrapper">
        <image
          v-if="service.iconType === 'image' && service.icon"
          :src="service.icon"
          class="service-grid__icon-image"
          mode="aspectFill"
        />
        <uni-icons
          v-else
          :type="service.icon || 'grid'"
          :size="iconSize"
          :color="service.iconColor || #FF9F29"
          class="service-grid__icon"
        />
      </view>

      <text class="service-grid__title">{{ service.title }}</text>
      <text v-if="service.subtitle" class="service-grid__subtitle">{{ service.subtitle }}</text>

      <!-- 徽章标记 -->
      <view v-if="service.badge" class="service-grid__badge" :class="`service-grid__badge--${service.badgeType || 'primary'}`">
        <text class="service-grid__badge-text">{{ service.badge }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ServiceItem {
  id?: string | number;
  title: string;
  subtitle?: string;
  icon?: string;
  iconType?: 'icon' | 'image';
  iconColor?: string;
  link?: string;
  badge?: string;
  badgeType?: 'primary' | 'danger' | 'warning' | 'success';
}

interface ServiceGridProps {
  /** 服务列表 */
  services?: ServiceItem[];
  /** 每行显示数量 */
  columns?: 3 | 4;
  /** 是否紧凑模式 */
  compact?: boolean;
}

interface ServiceGridEmits {
  (e: 'service-click', service: ServiceItem, index: number): void;
}

const props = withDefaults(defineProps<ServiceGridProps>(), {
  services: () => [],
  columns: 4,
  compact: false
});

const emit = defineEmits<ServiceGridEmits>();

// 计算图标大小
const iconSize = computed(() => {
  return props.compact ? 20 : 24;
});

// 处理服务点击
const handleServiceClick = (service: ServiceItem, index: number) => {
  emit('service-click', service, index);

  if (service.link) {
    uni.navigateTo({
      url: service.link,
      fail: () => {
        // 如果页面跳转失败，尝试switchTab
        uni.switchTab({
          url: service.link,
          fail: () => {
            uni.showToast({
              title: '页面不存在',
              icon: 'none'
            });
          }
        });
      }
    });
  }
};
</script>

<style>
.service-grid {
  display: grid;
  gap: 24rpx;
  padding: 0 30rpx;

  &--3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &--4 {
    grid-template-columns: repeat(4, 1fr);
  }

  &--compact {
    gap: 16rpx;
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 16rpx;
    background-color: #FFFFFF;
    border-radius: 20rpx;
    transition: all 0.2s ease-out;
    overflow: hidden;

    .active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    }
  }

  &__icon-wrapper {
    position: relative;
    margin-bottom: 16rpx;
  }

  &__icon-image {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
  }

  &__title {
    font-size: 24rpx;
    font-weight: 500;
    color: #333333;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 4rpx;
    display: block;
  }

  &__subtitle {
    font-size: 20rpx;
    color: #999999;
    text-align: center;
    line-height: 1.2;
    display: block;
  }

  &__badge {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    padding: 2rpx 8rpx;
    border-radius: 50rpx;
    min-width: 24rpx;
    height: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &--primary {
      background-color: #FF9F29;
      color: #FFFFFF;
    }

    &--danger {
      background-color: #FF4D4F;
      color: #FFFFFF;
    }

    &--warning {
      background-color: #E6A23C;
      color: #FFFFFF;
    }

    &--success {
      background-color: #67C23A;
      color: #FFFFFF;
    }
  }

  &__badge-text {
    font-size: 20rpx;
    font-weight: 500;
  }
}

/* 紧凑模式下的调整 */
.service-grid--compact  { .service-grid__item { padding: 16rpx; }.service-grid__icon-image { width: 40rpx;
    height: 40rpx; }.service-grid__title { font-size: 20rpx; } }

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .service-grid {
    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &--4 {
      grid-template-columns: repeat(3, 1fr);
    }

    &__item {
      padding: 16rpx;
    }

    &__title {
      font-size: 20rpx;
    }
  }
}
</style>