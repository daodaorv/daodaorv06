<template>
  <view class="vehicle-detail">
    <image :src="vehicle.image" class="header-img" mode="aspectFill"></image>

    <view class="info-section">
      <text class="vehicle-name">{{ vehicle.name }}</text>
      <text class="plate">{{ vehicle.plate }}</text>
      <view class="status-badge" :class="vehicle.status">{{ vehicle.statusText }}</view>
    </view>

    <view class="data-section">
      <view class="data-item">
        <text class="data-label">今日收益</text>
        <text class="data-value">¥{{ vehicle.todayIncome }}</text>
      </view>
      <view class="data-item">
        <text class="data-label">本月收益</text>
        <text class="data-value">¥{{ vehicle.monthIncome }}</text>
      </view>
      <view class="data-item">
        <text class="data-label">累计收益</text>
        <text class="data-value">¥{{ vehicle.totalIncome }}</text>
      </view>
    </view>

    <view class="detail-section">
      <view class="detail-item">
        <text class="label">当前位置</text>
        <text class="value">{{ vehicle.location }}</text>
      </view>
      <view class="detail-item">
        <text class="label">保险状态</text>
        <text class="value">{{ vehicle.insurance }}</text>
      </view>
      <view class="detail-item">
        <text class="label">下次维保</text>
        <text class="value">{{ vehicle.nextMaintenance }}</text>
      </view>
    </view>

    <button class="action-btn" @click="applySelfUse">申请自用</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      vehicle: {
        name: '上汽大通V90',
        plate: '京A·12345',
        image: '/static/logo.png',
        status: 'renting',
        statusText: '出租中',
        todayIncome: 350,
        monthIncome: 5200,
        totalIncome: 28500,
        location: '北京市朝阳区叨叨房车朝阳门店',
        insurance: '已投保（太平洋保险）',
        nextMaintenance: '2025-12-15'
      }
    }
  },
  methods: {
    applySelfUse() {
      uni.navigateTo({
        url: '/pages/hosting/self-use/index?vehicleId=' + this.vehicle.id
      })
    }
  }
}
</script>

<style scoped lang="scss">
.vehicle-detail {
  min-height: 100vh;
  background: $uni-bg-color;
  padding-bottom: 120rpx;
}

.header-img {
  width: 100%;
  height: 400rpx;
}

.info-section {
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.vehicle-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.plate {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-lg;
}

.status-badge {
  display: inline-block;
  padding: $uni-spacing-sm $uni-spacing-xl;
  border-radius: $uni-radius-sm;
  font-size: $uni-font-size-xs;

  &.renting {
    background: rgba($uni-color-success, 0.12);
    color: $uni-color-success;
  }
}

.data-section {
  display: flex;
  background: $uni-bg-color-card;
  margin-top: $uni-spacing-xl;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.data-item {
  flex: 1;
  text-align: center;
}

.data-label {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-lg;
}

.data-value {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-color-primary;
  font-family: 'DIN Alternate', sans-serif;
}

.detail-section {
  background: $uni-bg-color-card;
  margin-top: $uni-spacing-xl;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: $uni-spacing-xl 0;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.value {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.action-btn {
  position: fixed;
  bottom: $uni-spacing-xl;
  left: $uni-spacing-xl;
  right: $uni-spacing-xl;
  height: 88rpx;
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-lg;
  font-weight: 600;
  border: none;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
