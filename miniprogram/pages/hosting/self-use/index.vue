<template>
  <view class="self-use">
    <view class="info-card">
      <text class="vehicle-name">{{ vehicle.name }}</text>
      <text class="plate">{{ vehicle.plate }}</text>
    </view>

    <view class="form">
      <view class="form-item">
        <text class="label">取车门店</text>
        <text class="value">{{ form.pickupStore }}</text>
      </view>
      <view class="form-item">
        <text class="label">还车门店</text>
        <picker mode="selector" :range="stores" range-key="name" @change="onStoreChange">
          <view class="picker">{{ form.returnStore || '请选择' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">取车时间</text>
        <picker mode="date" @change="onPickupDateChange">
          <view class="picker">{{ form.pickupDate || '请选择' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">还车时间</text>
        <picker mode="date" @change="onReturnDateChange">
          <view class="picker">{{ form.returnDate || '请选择' }}</view>
        </picker>
      </view>
    </view>

    <view class="fee-section">
      <view class="section-title">费用明细</view>
      <view class="fee-item">
        <text>租金</text>
        <text class="free">¥0</text>
      </view>
      <view class="fee-item">
        <text>门店服务费</text>
        <text>¥{{ fees.serviceFee }}</text>
      </view>
      <view class="fee-item">
        <text>异地还车费</text>
        <text>¥{{ fees.returnFee }}</text>
      </view>
      <view class="fee-total">
        <text>合计</text>
        <text class="total">¥{{ totalFee }}</text>
      </view>
    </view>

    <button class="submit-btn" @click="submit">提交申请</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      vehicle: { name: '大通V90', plate: '京A·12345' },
      form: { pickupStore: '北京朝阳门店', returnStore: '', pickupDate: '', returnDate: '' },
      stores: [{ id: 1, name: '北京朝阳门店' }, { id: 2, name: '北京海淀门店' }],
      fees: { serviceFee: 300, returnFee: 0 }
    }
  },
  computed: {
    totalFee() {
      return this.fees.serviceFee + this.fees.returnFee
    }
  },
  methods: {
    onStoreChange(e) {
      this.form.returnStore = this.stores[e.detail.value].name
      this.fees.returnFee = e.detail.value === 0 ? 0 : 500
    },
    onPickupDateChange(e) {
      this.form.pickupDate = e.detail.value
    },
    onReturnDateChange(e) {
      this.form.returnDate = e.detail.value
    },
    submit() {
      if (!this.form.returnStore || !this.form.pickupDate || !this.form.returnDate) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      uni.showModal({
        title: '提交成功',
        content: '您的自用申请已提交，平台将在24小时内审核',
        showCancel: false,
        success: () => uni.navigateBack()
      })
    }
  }
}
</script>

<style scoped>
.self-use { min-height: 100vh; background: #F5F5F5; padding: 24rpx 32rpx 120rpx; }
.info-card { background: #FFF; border-radius: 16rpx; padding: 32rpx; margin-bottom: 24rpx; }
.vehicle-name { display: block; font-size: 32rpx; font-weight: 600; margin-bottom: 8rpx; }
.plate { display: block; font-size: 24rpx; color: #999; }
.form { background: #FFF; border-radius: 16rpx; padding: 32rpx; margin-bottom: 24rpx; }
.form-item { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid #F5F5F5; }
.form-item:last-child { border-bottom: none; }
.label { font-size: 28rpx; color: #333; }
.value, .picker { font-size: 28rpx; color: #666; }
.fee-section { background: #FFF; border-radius: 16rpx; padding: 32rpx; }
.section-title { font-size: 32rpx; font-weight: 600; margin-bottom: 24rpx; }
.fee-item { display: flex; justify-content: space-between; padding: 16rpx 0; font-size: 28rpx; }
.free { color: #4CAF50; }
.fee-total { display: flex; justify-content: space-between; padding-top: 24rpx; margin-top: 24rpx; border-top: 1rpx solid #F5F5F5; font-size: 32rpx; font-weight: 600; }
.total { color: #FF9F29; }
.submit-btn { position: fixed; bottom: 32rpx; left: 32rpx; right: 32rpx; height: 88rpx; background: #FF9F29; color: #FFF; border-radius: 48rpx; font-size: 32rpx; font-weight: 600; border: none; }
</style>
