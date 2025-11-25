<!-- 服务列表组件 -->
<template>
  <view class="service-list">
    <view
      v-for="(service, index) in services"
      :key="service.id || index"
      class="service-item"
      @tap="handleServiceClick(service)"
    >
      <view class="service-icon" :style="iconStyle(service)">
        <uni-icons
          :type="service.icon"
          :size="iconSize(service.iconSize)"
          :color="service.iconColor || '#FFFFFF'"
        ></uni-icons>
      </view>

      <view class="service-content">
        <text class="service-name">{{ service.name }}</text>
        <view class="service-description-row">
          <text class="service-description">{{ service.description }}</text>
          <text v-if="service.action" class="service-action">{{ service.action }}</text>
        </view>
      </view>

      <view v-if="service.arrow !== false" class="service-arrow">
        <uni-icons type="right" size="16" color="#999999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  iconSize?: number;
  action?: string;
  arrow?: boolean;
  [key: string]: any;
}

interface ServiceListProps {
  /** 服务列表数据 */
  services: ServiceItem[];
  /** 图标大小 */
  iconSize?: number;
  /** 是否显示分割线 */
  showDivider?: boolean;
  /** 自定义样式类名 */
  customClass?: string;
}

interface ServiceListEmits {
  (e: 'service-click', service: ServiceItem): void;
}

const props = withDefaults(defineProps<ServiceListProps>(), {
  services: () => [],
  iconSize: 24,
  showDivider: true,
  customClass: ''
});

const emit = defineEmits<ServiceListEmits>();

// 计算图标样式
const iconStyle = (service: ServiceItem) => {
  return {
    background: service.iconBg || 'linear-gradient(135deg, #FF9F29, #F6AD55)'
  };
};

// 图标尺寸
const iconSize = (customSize?: number) => {
  return customSize || props.iconSize;
};

// 处理服务点击
const handleServiceClick = (service: ServiceItem) => {
  emit('service-click', service);
};
</script>

<style>
// 导入统一变量文件
.service-list {
  // 服务项
  .service-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    transition: background-color 0.2s ease;
    cursor: pointer;
    position: relative;

    .active {
      background: rgba(0, 0, 0, 0.02);
    }

    // 分割线
    .not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 88rpx;
      right: 0;
      height: 1rpx;
      background: rgba(0, 0, 0, 0.05);
    }

    // 服务图标
    .service-icon {
      width: 56rpx;
      height: 56rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;
      flex-shrink: 0;
    }

    // 服务内容
    .service-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .service-name {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        line-height: 1.2;
      }

      .service-description-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16rpx;

        .service-description {
          font-size: 24rpx;
          color: #666666;
          line-height: 1.2;
          flex: 1;
        }

        .service-action {
          font-size: 24rpx;
          color: #FF6B35;
          line-height: 1.2;
          flex-shrink: 0;
        }
      }
    }

    // 箭头
    .service-arrow {
      flex-shrink: 0;
      margin-left: 16rpx;
    }
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .service-list  { .service-item { .service-icon { width: 48rpx;
        height: 48rpx;
        margin-right: 20rpx; }.service-content { .service-name { font-size: 28rpx; }.service-description-row  .service-description,
          .service-action { font-size: 22rpx; }
      }
    }
  }
}
</style>