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
      <view v-for="item in incomeList" :key="item.id" class="list-item">
        <view class="item-left">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-date">{{ item.date }}</text>
        </view>
        <text class="item-amount">+¥{{ item.amount }}</text>
      </view>
    </view>

    <view v-else class="list">
      <view v-for="item in withdrawList" :key="item.id" class="list-item">
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
        { id: 1, title: '租金收益', date: '2025-12-01', amount: 350.00 },
        { id: 2, title: '租金收益', date: '2025-11-30', amount: 420.00 }
      ],
      withdrawList: [
        { id: 1, date: '2025-11-25', amount: 5000, status: 'success', statusText: '已到账' }
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

<style scoped>
.income-page { min-height: 100vh; background: #F5F5F5; }
.summary-card { background: linear-gradient(135deg, #FF9F29 0%, #FF7A00 100%); padding: 48rpx 32rpx; text-align: center; color: #FFF; }
.summary-title { display: block; font-size: 28rpx; opacity: 0.9; margin-bottom: 16rpx; }
.summary-value { display: block; font-size: 64rpx; font-weight: 600; margin-bottom: 32rpx; }
.withdraw-btn { background: #FFF; color: #FF9F29; border-radius: 48rpx; height: 72rpx; line-height: 72rpx; font-size: 28rpx; font-weight: 600; border: none; width: 300rpx; }
.tabs { display: flex; background: #FFF; }
.tab { flex: 1; text-align: center; padding: 32rpx 0; font-size: 28rpx; color: #666; }
.tab.active { color: #FF9F29; border-bottom: 4rpx solid #FF9F29; }
.list { padding: 24rpx 32rpx; }
.list-item { display: flex; justify-content: space-between; background: #FFF; border-radius: 12rpx; padding: 32rpx; margin-bottom: 16rpx; }
.item-title { display: block; font-size: 28rpx; color: #333; margin-bottom: 8rpx; }
.item-date { display: block; font-size: 24rpx; color: #999; }
.item-amount { font-size: 32rpx; font-weight: 600; color: #FF9F29; }
.item-right { text-align: right; }
.status { display: block; font-size: 24rpx; margin-top: 8rpx; }
.status.success { color: #4CAF50; }
</style>
