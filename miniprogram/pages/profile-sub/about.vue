<template>
  <view class="about-page">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">叨叨房车</text>
      <text class="version">Version 1.0.0</text>
    </view>
    
    <view class="info-section">
      <view class="info-item">
        <text class="label">官方网站</text>
        <text class="value">www.daodao.com</text>
      </view>
      <view class="info-item">
        <text class="label">客服电话</text>
        <text class="value">400-123-4567</text>
      </view>
      <view class="info-item">
        <text class="label">微信公众号</text>
        <text class="value">叨叨房车</text>
      </view>
    </view>
    
    <view class="copyright">
      <text>Copyright © 2025 叨叨房车 All Rights Reserved</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// 无需特殊逻辑
</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background-color: $uni-bg-color-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx $uni-spacing-xl;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: $uni-spacing-xl;
    border-radius: $uni-radius-lg;
    box-shadow: $uni-shadow-card;
  }

  .app-name {
    font-size: 40rpx;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-md;
  }

  .version {
    font-size: $uni-font-size-xs;
    color: $uni-text-color-placeholder;
  }
}

.info-section {
  width: 100%;
  padding: 0 $uni-spacing-xl;

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: $uni-spacing-xl 0;
    border-bottom: 1rpx solid $uni-border-color-light;
    transition: all 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .value {
      font-size: $uni-font-size-base;
      color: $uni-text-color-secondary;
    }
  }
}

.copyright {
  margin-top: auto;
  font-size: 20rpx;
  color: $uni-border-color;
  padding-bottom: 40rpx;
}
</style>
