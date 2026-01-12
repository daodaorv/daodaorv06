<template>
  <view class="booking-page">
    <!-- 额度信息 -->
    <view class="quota-card">
      <view class="quota-header">
        <text class="quota-title">自用额度</text>
        <text class="quota-period">{{ quotaInfo.period }}</text>
      </view>
      <view class="quota-content">
        <view class="quota-used">
          <text class="quota-number">{{ quotaInfo.used }}</text>
          <text class="quota-unit">已用(天)</text>
        </view>
        <view class="quota-divider">/</view>
        <view class="quota-total">
          <text class="quota-number">{{ quotaInfo.total }}</text>
          <text class="quota-unit">总额度(天)</text>
        </view>
      </view>
      <view class="quota-progress">
        <view class="progress-bar" :style="{ width: quotaPercent + '%' }"></view>
      </view>
      <text class="quota-tip">剩余 {{ quotaInfo.remaining }} 天可用</text>
    </view>

    <!-- 车辆信息 -->
    <view class="vehicle-card">
      <image :src="projectInfo.thumbnail" class="vehicle-img" mode="aspectFill"></image>
      <view class="vehicle-info">
        <text class="vehicle-name">{{ projectInfo.title }}</text>
        <text class="vehicle-plate">{{ projectInfo.plateNumber || '待上牌' }}</text>
      </view>
    </view>

    <!-- 预约表单 -->
    <view class="form-section">
      <view class="section-title">预约信息</view>

      <!-- 取车日期 -->
      <view class="form-item" @click="showStartPicker = true">
        <text class="form-label">取车日期</text>
        <view class="form-value">
          <text :class="{ placeholder: !formData.startDate }">
            {{ formData.startDate || '请选择取车日期' }}
          </text>
          <u-icon name="arrow-right" size="14" color="#C9CDD4"></u-icon>
        </view>
      </view>

      <!-- 还车日期 -->
      <view class="form-item" @click="showEndPicker = true">
        <text class="form-label">还车日期</text>
        <view class="form-value">
          <text :class="{ placeholder: !formData.endDate }">
            {{ formData.endDate || '请选择还车日期' }}
          </text>
          <u-icon name="arrow-right" size="14" color="#C9CDD4"></u-icon>
        </view>
      </view>

      <!-- 取车门店 -->
      <view class="form-item" @click="showStorePicker = true">
        <text class="form-label">取车门店</text>
        <view class="form-value">
          <text :class="{ placeholder: !formData.storeName }">
            {{ formData.storeName || '请选择取车门店' }}
          </text>
          <u-icon name="arrow-right" size="14" color="#C9CDD4"></u-icon>
        </view>
      </view>
    </view>

    <!-- 费用预估 -->
    <view class="fee-section" v-if="bookingDays > 0">
      <view class="section-title">费用预估</view>
      <view class="fee-list">
        <view class="fee-item">
          <text class="fee-label">预约天数</text>
          <text class="fee-value">{{ bookingDays }} 天</text>
        </view>
        <view class="fee-item" v-if="withinQuota">
          <text class="fee-label">额度内天数</text>
          <text class="fee-value highlight">{{ quotaDays }} 天 (免费)</text>
        </view>
        <view class="fee-item" v-if="extraDays > 0">
          <text class="fee-label">超额天数</text>
          <text class="fee-value warning">{{ extraDays }} 天</text>
        </view>
        <view class="fee-item" v-if="extraDays > 0">
          <text class="fee-label">超额租金</text>
          <text class="fee-value">¥{{ extraRentFee.toLocaleString() }}</text>
        </view>
        <view class="fee-item">
          <text class="fee-label">保险费</text>
          <text class="fee-value">¥{{ insuranceFee.toLocaleString() }}</text>
        </view>
        <view class="fee-item">
          <text class="fee-label">门店服务费</text>
          <text class="fee-value">¥{{ serviceFee.toLocaleString() }}</text>
        </view>
      </view>
      <view class="fee-total">
        <text class="total-label">预估总费用</text>
        <text class="total-value">¥{{ totalFee.toLocaleString() }}</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tip-section">
      <view class="tip-item">
        <u-icon name="info-circle" size="14" color="#FF9800"></u-icon>
        <text>自用期间需自付保险费和门店服务费</text>
      </view>
      <view class="tip-item">
        <u-icon name="info-circle" size="14" color="#FF9800"></u-icon>
        <text>超出额度部分按正常租赁价格支付</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" :disabled="!canSubmit" @click="submitBooking">
        提交预约
      </button>
    </view>

    <!-- 日期选择器 -->
    <u-datetime-picker
      :show="showStartPicker"
      mode="date"
      :minDate="minDate"
      @confirm="onStartDateConfirm"
      @cancel="showStartPicker = false"
    ></u-datetime-picker>

    <u-datetime-picker
      :show="showEndPicker"
      mode="date"
      :minDate="endMinDate"
      @confirm="onEndDateConfirm"
      @cancel="showEndPicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { logger } from '@/utils/logger'

// 页面参数
const projectId = ref('')
const shareId = ref('')

// 日期选择器状态
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const showStorePicker = ref(false)
const minDate = Date.now()

// 额度信息
const quotaInfo = ref({
  period: '2026年度',
  total: 60,
  used: 15,
  remaining: 45
})

// 项目信息
const projectInfo = ref({
  id: '',
  title: '',
  thumbnail: '',
  plateNumber: '',
  dailyRent: 800,
  insurancePerDay: 50,
  servicePerDay: 30
})

// 表单数据
const formData = ref({
  startDate: '',
  endDate: '',
  storeId: '',
  storeName: ''
})

// 门店列表
const storeList = ref([
  { id: '1', name: '成都总店', address: '成都市武侯区xxx路' },
  { id: '2', name: '重庆分店', address: '重庆市渝北区xxx路' }
])

// 计算属性：额度使用百分比
const quotaPercent = computed(() => {
  if (quotaInfo.value.total === 0) return 0
  return Math.round((quotaInfo.value.used / quotaInfo.value.total) * 100)
})

// 计算属性：还车日期最小值
const endMinDate = computed(() => {
  if (formData.value.startDate) {
    return new Date(formData.value.startDate).getTime() + 24 * 60 * 60 * 1000
  }
  return minDate + 24 * 60 * 60 * 1000
})

// 计算属性：预约天数
const bookingDays = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) return 0
  const start = new Date(formData.value.startDate).getTime()
  const end = new Date(formData.value.endDate).getTime()
  return Math.ceil((end - start) / (24 * 60 * 60 * 1000))
})

// 计算属性：是否在额度内
const withinQuota = computed(() => {
  return bookingDays.value <= quotaInfo.value.remaining
})

// 计算属性：额度内天数
const quotaDays = computed(() => {
  return Math.min(bookingDays.value, quotaInfo.value.remaining)
})

// 计算属性：超额天数
const extraDays = computed(() => {
  return Math.max(0, bookingDays.value - quotaInfo.value.remaining)
})

// 计算属性：超额租金
const extraRentFee = computed(() => {
  return extraDays.value * projectInfo.value.dailyRent
})

// 计算属性：保险费（全程）
const insuranceFee = computed(() => {
  return bookingDays.value * projectInfo.value.insurancePerDay
})

// 计算属性：门店服务费
const serviceFee = computed(() => {
  return bookingDays.value * projectInfo.value.servicePerDay
})

// 计算属性：总费用
const totalFee = computed(() => {
  return extraRentFee.value + insuranceFee.value + serviceFee.value
})

// 计算属性：是否可提交
const canSubmit = computed(() => {
  return formData.value.startDate &&
         formData.value.endDate &&
         formData.value.storeId &&
         bookingDays.value > 0
})

// 格式化日期
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 取车日期确认
const onStartDateConfirm = (e: { value: number }) => {
  formData.value.startDate = formatDate(e.value)
  showStartPicker.value = false
  // 如果还车日期早于取车日期，清空还车日期
  if (formData.value.endDate && formData.value.endDate <= formData.value.startDate) {
    formData.value.endDate = ''
  }
}

// 还车日期确认
const onEndDateConfirm = (e: { value: number }) => {
  formData.value.endDate = formatDate(e.value)
  showEndPicker.value = false
}

// 加载项目详情
const loadProjectDetail = async () => {
  try {
    // Mock 数据
    projectInfo.value = {
      id: projectId.value,
      title: '上汽大通RG10 - 川西环线专用车',
      thumbnail: '/static/images/vehicle-placeholder.png',
      plateNumber: '川A·12345',
      dailyRent: 800,
      insurancePerDay: 50,
      servicePerDay: 30
    }
  } catch (error) {
    logger.error('加载项目详情失败', error)
  }
}

// 加载额度信息
const loadQuotaInfo = async () => {
  try {
    // Mock 数据 - 按份额比例计算
    // 假设用户持有 20% 份额，年度总额度 60 天
    const sharePercent = 0.2
    const yearlyQuota = 60
    quotaInfo.value = {
      period: '2026年度',
      total: Math.round(yearlyQuota * sharePercent),
      used: 3,
      remaining: Math.round(yearlyQuota * sharePercent) - 3
    }
  } catch (error) {
    logger.error('加载额度信息失败', error)
  }
}

// 提交预约
const submitBooking = async () => {
  if (!canSubmit.value) return

  try {
    uni.showLoading({ title: '提交中...' })

    // Mock API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    uni.hideLoading()
    uni.showToast({
      title: '预约成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    logger.error('提交预约失败', error)
    uni.showToast({
      title: '预约失败，请重试',
      icon: 'none'
    })
  }
}

// 页面加载
onLoad((options: Record<string, string | undefined>) => {
  if (options.projectId) {
    projectId.value = options.projectId
  }
  if (options.shareId) {
    shareId.value = options.shareId
  }
  loadProjectDetail()
  loadQuotaInfo()
})
</script>

<style scoped lang="scss">
.booking-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding: 24rpx 32rpx;
  padding-bottom: 160rpx;
}

// 额度卡片
.quota-card {
  background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  color: #FFFFFF;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.quota-title {
  font-size: 32rpx;
  font-weight: 600;
}

.quota-period {
  font-size: 24rpx;
  opacity: 0.8;
}

.quota-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.quota-used,
.quota-total {
  text-align: center;
}

.quota-number {
  font-size: 56rpx;
  font-weight: 700;
  display: block;
}

.quota-unit {
  font-size: 22rpx;
  opacity: 0.8;
}

.quota-divider {
  font-size: 40rpx;
  opacity: 0.5;
}

.quota-progress {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #FFFFFF;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.quota-tip {
  font-size: 24rpx;
  opacity: 0.9;
  text-align: center;
  display: block;
}

// 车辆卡片
.vehicle-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 20rpx;
}

.vehicle-img {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #F0F0F0;
}

.vehicle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
}

.vehicle-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1D2129;
}

.vehicle-plate {
  font-size: 26rpx;
  color: #86909C;
}

// 表单区域
.form-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 20rpx;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F2F3F5;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: 28rpx;
  color: #4E5969;
}

.form-value {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 28rpx;
    color: #1D2129;

    &.placeholder {
      color: #C9CDD4;
    }
  }
}

// 费用区域
.fee-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.fee-list {
  margin-bottom: 20rpx;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.fee-label {
  font-size: 26rpx;
  color: #86909C;
}

.fee-value {
  font-size: 26rpx;
  color: #1D2129;

  &.highlight {
    color: #00B578;
  }

  &.warning {
    color: #FF9800;
  }
}

.fee-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #F2F3F5;
}

.total-label {
  font-size: 28rpx;
  color: #1D2129;
}

.total-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #F53F3F;
}

// 提示区域
.tip-section {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }

  text {
    font-size: 24rpx;
    color: #FF9800;
  }
}

// 底部按钮
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
  border-radius: 44rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border: none;

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.5;
  }
}
</style>