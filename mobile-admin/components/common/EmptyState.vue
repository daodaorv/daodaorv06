<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-description">{{ description }}</text>
    <button
      v-if="buttonText"
      class="empty-button"
      :type="buttonType"
      @click="handleClick"
    >
      {{ buttonText }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    // 图标（emoji）
    icon: {
      type: String,
      default: '📭'
    },
    // 标题
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述文字
    description: {
      type: String,
      default: ''
    },
    // 按钮文字
    buttonText: {
      type: String,
      default: ''
    },
    // 按钮类型
    buttonType: {
      type: String,
      default: 'default'
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.empty-description {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
  margin-bottom: 40rpx;
  max-width: 500rpx;
}

.empty-button {
  min-width: 200rpx;
}
</style>
