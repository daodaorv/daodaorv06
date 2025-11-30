<template>
  <view v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
    <view class="confirm-dialog" @click.stop>
      <view class="dialog-header">
        <text class="dialog-title">{{ title }}</text>
      </view>

      <view class="dialog-content">
        <text class="dialog-message">{{ message }}</text>
      </view>

      <view class="dialog-footer">
        <button
          v-if="showCancel"
          class="dialog-button cancel-button"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="dialog-button confirm-button"
          :class="{ danger: type === 'danger' }"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    // 是否显示
    visible: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: '提示'
    },
    // 消息内容
    message: {
      type: String,
      required: true
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      default: true
    },
    // 类型（danger 会显示红色确认按钮）
    type: {
      type: String,
      default: 'default'
    },
    // 点击遮罩是否关闭
    closeOnClickOverlay: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    handleOverlayClick() {
      if (this.closeOnClickOverlay) {
        this.handleCancel()
      }
    }
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.confirm-dialog {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.dialog-header {
  padding: 40rpx 40rpx 20rpx;
  text-align: center;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dialog-content {
  padding: 20rpx 40rpx 40rpx;
  text-align: center;
}

.dialog-message {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  border-top: 1px solid #eee;
}

.dialog-button {
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  font-size: 30rpx;
  border: none;
  border-radius: 0;
  background: #fff;
  color: #333;
}

.dialog-button::after {
  border: none;
}

.cancel-button {
  color: #666;
  border-right: 1px solid #eee;
}

.confirm-button {
  color: #3cc51f;
  font-weight: 500;
}

.confirm-button.danger {
  color: #f56c6c;
}
</style>
