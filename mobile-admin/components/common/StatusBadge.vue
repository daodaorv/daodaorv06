<template>
  <view class="status-badge" :class="['status-' + type, sizeClass]">
    <text class="badge-text">{{ text }}</text>
  </view>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    // 状态文字
    text: {
      type: String,
      required: true
    },
    // 状态类型
    type: {
      type: String,
      default: 'default',
      validator: (value) => {
        return ['default', 'primary', 'success', 'warning', 'error', 'info'].includes(value)
      }
    },
    // 尺寸
    size: {
      type: String,
      default: 'normal',
      validator: (value) => {
        return ['small', 'normal', 'large'].includes(value)
      }
    }
  },
  computed: {
    sizeClass() {
      return `size-${this.size}`
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

/* 尺寸 */
.size-small {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
}

.size-normal {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
}

.size-large {
  padding: 12rpx 28rpx;
  font-size: 28rpx;
}

/* 状态类型 */
.status-default {
  background: #f5f5f5;
  color: #666;
}

.status-primary {
  background: #e6f7ff;
  color: #1890ff;
}

.status-success {
  background: #f0f9ff;
  color: #52c41a;
}

.status-warning {
  background: #fff7e6;
  color: #faad14;
}

.status-error {
  background: #fff1f0;
  color: #f5222d;
}

.status-info {
  background: #f0f5ff;
  color: #722ed1;
}

.badge-text {
  line-height: 1;
}
</style>
