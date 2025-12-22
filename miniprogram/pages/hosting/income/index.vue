<template>
  <view class="income-page">
    <view class="summary-card">
      <text class="summary-title">累计收益</text>
      <text class="summary-value">¥{{ totalIncome }}</text>
      <button class="withdraw-btn" @click="withdraw">提现</button>
    </view>

    <view class="tabs">
      <view :class="['tab', activeTab === 0 && 'active']" @click="activeTab = 0">收益明细</view>
      <view :class="['tab', activeTab === 1 && 'active']" @click="activeTab = 1">提现记录</view>
    </view>

    <view v-if="activeTab === 0" class="list">
      <view v-for="item in incomeList" :key="item.id" class="income-card">
        <view class="card-header">
          <text class="order-no">订单号 {{ item.orderNo }}</text>
          <text class="status-tag">{{ item.statusText }}</text>
        </view>
        <view class="card-body">
          <view class="info-row">
            <text class="info-label">车辆</text>
            <text class="info-value">{{ item.vehicle }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">执行日期</text>
            <text class="info-value">{{ item.period }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单金额</text>
            <text class="info-value">¥{{ item.orderAmount }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">结算收益</text>
            <text class="info-value highlight">+¥{{ item.amount }}</text>
          </view>
        </view>
        <view class="card-footer">
          <text class="footer-text">{{ item.settleDate }} 结算</text>
        </view>
      </view>
    </view>

    <view v-else class="list">
      <view v-for="item in withdrawList" :key="item.id" class="withdraw-item">
        <view class="item-left">
          <text class="item-title">提现</text>
          <text class="item-date">{{ item.date }}</text>
        </view>
        <view class="item-right">
          <text class="item-amount">-¥{{ item.amount }}</text>
          <text :class="['status', item.status]">{{ item.statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      totalIncome: 12580.50,
      activeTab: 0,
      incomeList: [
        {
          id: 'INC001',
          orderNo: 'DD20241201001',
          vehicle: '上汽大通V90',
          period: '2024-12-01 至 2024-12-05',
          orderAmount: 4800,
          amount: 360,
          settleDate: '2024-12-06',
          statusText: '已结算'
        },
        {
          id: 'INC002',
          orderNo: 'DD20241128005',
          vehicle: '览众勇士C7',
          period: '2024-11-26 至 2024-11-29',
          orderAmount: 4200,
          amount: 315,
          settleDate: '2024-11-30',
          statusText: '已结算'
        }
      ],
      withdrawList: [
        { id: 'WD001', date: '2024-11-25', amount: 5000, status: 'success', statusText: '已到账' },
        { id: 'WD002', date: '2024-10-12', amount: 3200, status: 'processing', statusText: '处理中' }
      ]
    }
  },
  methods: {
    withdraw() {
      uni.showModal({
        title: '提现',
        content: `确认提现 ¥${this.totalIncome}？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '提现申请已提交' })
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.income-page {
  min-height: 100vh;
  background: $uni-bg-color;
}

.summary-card {
  background: $uni-color-primary-gradient;
  padding: 48rpx $uni-spacing-xl;
  text-align: center;
  color: $uni-text-color-inverse;
}

.summary-title {
  display: block;
  font-size: $uni-font-size-base;
  opacity: 0.9;
  margin-bottom: $uni-spacing-lg;
}

.summary-value {
  display: block;
  font-size: 64rpx;
  font-weight: 600;
  margin-bottom: $uni-spacing-xl;
  font-family: 'DIN Alternate', sans-serif;
}

.withdraw-btn {
  background: $uni-bg-color-card;
  color: $uni-color-primary;
  border-radius: $uni-radius-btn;
  height: 72rpx;
  line-height: 72rpx;
  font-size: $uni-font-size-base;
  font-weight: 600;
  border: none;
  width: 300rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.tabs {
  display: flex;
  background: $uni-bg-color-card;
}

.tab {
  flex: 1;
  text-align: center;
  padding: $uni-spacing-xl 0;
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  transition: all 0.2s ease;

  &.active {
    color: $uni-color-primary;
    border-bottom: 4rpx solid $uni-color-primary;
  }
}

.list {
  padding: $uni-spacing-xl $uni-spacing-xl;
}

.income-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
}

.order-no {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

.status-tag {
  font-size: $uni-font-size-xs;
  color: $uni-color-success;
  background: rgba($uni-color-success, 0.12);
  padding: $uni-spacing-xs $uni-spacing-lg;
  border-radius: $uni-radius-btn;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-lg;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

.info-label {
  color: $uni-text-color-placeholder;
}

.info-value {
  color: $uni-text-color;
  font-weight: 500;

  &.highlight {
    color: $uni-color-primary;
    font-size: $uni-font-size-lg;
  }
}

.card-footer {
  margin-top: $uni-spacing-xl;
  padding-top: $uni-spacing-lg;
  border-top: 1rpx solid $uni-border-color-light;
}

.footer-text {
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
}

.withdraw-item {
  display: flex;
  justify-content: space-between;
  background: $uni-bg-color-card;
  border-radius: $uni-radius-md;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-sm;
}

.item-title {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.item-date {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
}

.item-amount {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-color-primary;
}

.item-right {
  text-align: right;
}

.status {
  display: block;
  font-size: $uni-font-size-xs;
  margin-top: $uni-spacing-sm;

  &.success {
    color: $uni-color-success;
  }

  &.processing {
    color: $uni-color-warning;
  }
}
</style>
