<template>
  <view class="renewal-page">
    <view class="card order-info">
      <view class="info-row">
        <text class="label">订单编号</text>
        <text class="value">{{ orderInfo.orderNo || '--' }}</text>
      </view>
      <view class="info-row">
        <text class="label">当前还车时间</text>
        <text class="value">{{ formatDateTime(orderInfo.returnTime) }}</text>
      </view>
    </view>

    <view class="card form-section">
      <view class="section-title">续租设置</view>
      <view class="form-row">
        <text class="label">续租天数</text>
        <view class="number-input">
          <button class="num-btn" @tap="changeDays(-1)" :disabled="days <= 1">-</button>
          <text class="num-value">{{ days }}</text>
          <button class="num-btn" @tap="changeDays(1)" :disabled="days >= 30">+</button>
        </view>
      </view>
      <view class="form-row">
        <text class="label">新的还车时间</text>
        <text class="time-value">{{ newReturnTimeText }}</text>
      </view>
    </view>

    <view class="card price-section">
      <view class="price-row">
        <text class="label">续租日均价</text>
        <text class="value">￥{{ orderInfo.dailyPrice }}</text>
      </view>
      <view class="price-row total">
        <text class="label">续租费用</text>
        <text class="amount">￥{{ totalPrice }}</text>
      </view>
      <view class="tip">
        <u-icon name="info" color="#FF9F29" size="14"></u-icon>
        <text>支付成功后系统将自动确认续租，如无法续租将自动退款</text>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="ghost-btn" @tap="contactStore">联系门店</button>
      <button class="primary-btn" @tap="goToPayment" :loading="submitting">立即支付续租费用</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderApi } from '@/api/order'

interface RenewalInfo {
  orderId?: string
  orderNo?: string
  returnTime?: string
  pickupTime?: string
  dailyPrice: number
  storePhone?: string
}

const orderInfo = ref<RenewalInfo>({
  orderId: '',
  orderNo: '',
  returnTime: '',
  pickupTime: '',
  dailyPrice: 0
})
const days = ref(1)
const submitting = ref(false)

const totalPrice = computed(() =>
  Number((days.value * (orderInfo.value.dailyPrice || 0)).toFixed(2))
)

const newReturnTimeText = computed(() => {
  if (!orderInfo.value.returnTime) return '--'
  const base = new Date(orderInfo.value.returnTime).getTime()
  if (Number.isNaN(base)) return '--'
  const next = base + days.value * 24 * 60 * 60 * 1000
  return formatDateTime(new Date(next).toISOString())
})

const changeDays = (step: number) => {
  const target = days.value + step
  if (target < 1 || target > 30) return
  days.value = target
}

const contactStore = () => {
  if (orderInfo.value.storePhone) {
    uni.makePhoneCall({ phoneNumber: orderInfo.value.storePhone })
    return
  }
  uni.showToast({
    title: '暂无门店电话',
    icon: 'none'
  })
}

const goToPayment = () => {
  if (!orderInfo.value.orderId && !orderInfo.value.orderNo) {
    uni.showToast({ title: '缺少订单信息', icon: 'none' })
    return
  }

  if (totalPrice.value <= 0) {
    uni.showToast({ title: '续租费用异常', icon: 'none' })
    return
  }

  // 构建支付页面参数
  const params = {
    orderNo: orderInfo.value.orderNo,
    amount: totalPrice.value,
    type: 'renewal', // 标识这是续租支付
    renewalDays: days.value,
    newReturnTime: encodeURIComponent(newReturnTimeText.value)
  }

  // 跳转到支付页面
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  uni.navigateTo({
    url: `/pages/order/pay?${queryString}`
  })
}

const loadOrderInfo = async (orderId?: string) => {
  if (!orderId) return
  try {
    uni.showLoading({ title: '加载中...' })
    const response: any = await orderApi.getOrderDetail(orderId)
    const payload = response?.data || response
    if (payload) {
      orderInfo.value = {
        orderId: payload.id || orderId,
        orderNo: payload.orderNo,
        returnTime: payload.returnTime,
        pickupTime: payload.pickupTime,
        dailyPrice: resolveDailyPrice(payload),
        storePhone: payload.pickupStore?.phone || payload.returnStore?.phone
      }
    }
  } catch (error) {
    logger.error('加载订单失败', error)
    uni.showToast({ title: '加载订单失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const resolveDailyPrice = (payload: any) => {
  if (typeof payload?.vehicle?.dailyPrice === 'number') {
    return payload.vehicle.dailyPrice
  }
  if (typeof payload?.dailyPrice === 'number') {
    return payload.dailyPrice
  }
  if (typeof payload?.amount?.dailyPrice === 'number') {
    return payload.amount.dailyPrice
  }
  const pickup = payload?.pickupTime ? new Date(payload.pickupTime).getTime() : 0
  const dropoff = payload?.returnTime ? new Date(payload.returnTime).getTime() : 0
  const days =
    pickup && dropoff && dropoff > pickup
      ? Math.max(1, Math.round((dropoff - pickup) / (24 * 60 * 60 * 1000)))
      : 1
  const base =
    payload?.vehicleFee ||
    payload?.amount?.totalAmount ||
    payload?.actualAmount ||
    payload?.totalAmount ||
    0
  if (!base) return 0
  return Number((base / days).toFixed(2))
}

onLoad((options: Record<string, any>) => {
  const decodeValue = (val?: string) => {
    if (!val) return ''
    try {
      return decodeURIComponent(decodeURIComponent(val))
    } catch (error) {
      try {
        return decodeURIComponent(val)
      } catch (err) {
        return val
      }
    }
  }
  orderInfo.value = {
    orderId: options.orderId || '',
    orderNo: options.orderNo || '',
    returnTime: decodeValue(options.returnTime),
    pickupTime: decodeValue(options.pickupTime),
    dailyPrice: Number(options.dailyPrice) || 0
  }
  if (!orderInfo.value.returnTime || !orderInfo.value.dailyPrice) {
    loadOrderInfo(orderInfo.value.orderId || orderInfo.value.orderNo)
  }
})

const formatDateTime = (value?: string) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}
</script>

<style scoped lang="scss">
.renewal-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding: $uni-spacing-lg;
  padding-bottom: 160rpx;
}

.card {
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-lg;
  margin-bottom: $uni-spacing-md;
  box-shadow: $uni-shadow-card;
}

.info-row,
.form-row,
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-lg;
}

.info-row:last-child,
.form-row:last-child,
.price-row:last-child {
  margin-bottom: 0;
}

.label {
  color: $uni-text-color-placeholder;
}

.value {
  font-weight: 600;
  color: $uni-text-color;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  margin-bottom: $uni-spacing-lg;
  color: $uni-text-color;
  position: relative;
  padding-left: $uni-spacing-md;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 28rpx;
    background-color: $uni-color-primary;
    border-radius: 4rpx;
  }
}

.number-input {
  display: flex;
  align-items: center;
  gap: $uni-spacing-md;
}

.num-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: $uni-radius-md;
  background-color: $uni-bg-color-grey;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  padding: 0;
  line-height: 64rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background-color: $uni-border-color;
  }

  &[disabled] {
    opacity: 0.5;
  }
}

.num-btn::after {
  border: none;
}

.num-value {
  width: 80rpx;
  text-align: center;
  font-size: $uni-font-size-md;
  font-weight: 600;
  color: $uni-text-color;
}

.time-value {
  color: $uni-color-primary;
  font-weight: 600;
}

.price-section .total {
  border-top: 1rpx solid $uni-border-color-light;
  padding-top: $uni-spacing-md;
  margin-top: $uni-spacing-sm;
}

.amount {
  font-size: 40rpx;
  font-weight: 700;
  color: $uni-color-error;
  font-family: 'DIN Alternate', sans-serif;
}

.tip {
  margin-top: $uni-spacing-md;
  display: flex;
  align-items: flex-start;
  gap: $uni-spacing-xs;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  line-height: 1.5;
  padding: $uni-spacing-sm $uni-spacing-md;
  background-color: rgba(255, 159, 41, 0.08);
  border-radius: $uni-radius-sm;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-md $uni-spacing-lg;
  padding-bottom: calc(#{$uni-spacing-md} + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: $uni-spacing-md;
  z-index: 99;
}

.primary-btn,
.ghost-btn {
  flex: 1;
  height: 96rpx;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-md;
  font-weight: 600;
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.primary-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  box-shadow: $uni-shadow-glow;
}

.ghost-btn {
  background-color: $uni-bg-color-card;
  color: $uni-color-primary;
  border: 2rpx solid rgba(255, 159, 41, 0.4);

  &:active {
    background-color: rgba(255, 159, 41, 0.08);
  }
}
</style>
