<template>
  <view class="campsite-booking">
    <!-- 营地信息卡片 -->
    <view class="campsite-card">
      <view class="campsite-header">
        <text class="campsite-name">{{ campsiteInfo.name }}</text>
        <view class="site-type-badge">
          <text class="badge-text">{{ selectedSiteType.name }}</text>
        </view>
      </view>
      <view class="campsite-meta">
        <view class="meta-item">
          <u-icon name="map" size="14" color="#999"></u-icon>
          <text class="meta-text">{{ campsiteInfo.address }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">面积：</text>
          <text class="meta-value">{{ selectedSiteType.area }}㎡</text>
          <text class="meta-label">容纳：</text>
          <text class="meta-value">{{ selectedSiteType.capacity }}人</text>
        </view>
      </view>
    </view>

    <!-- 预订信息表单 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">预订信息</text>
      </view>

      <!-- 入住日期 -->
      <view class="form-item" @tap="openDatePicker">
        <view class="item-label">
          <text class="label-text">入住日期</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <text class="value-text" :class="{ placeholder: !bookingForm.checkInDate }">
            {{ bookingForm.checkInDate ? formatDisplayDate(bookingForm.checkInDate) : '请选择入住日期' }}
          </text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>

      <!-- 退房日期 -->
      <view class="form-item" @tap="openDatePicker">
        <view class="item-label">
          <text class="label-text">退房日期</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <text class="value-text" :class="{ placeholder: !bookingForm.checkOutDate }">
            {{ bookingForm.checkOutDate ? formatDisplayDate(bookingForm.checkOutDate) : '请选择退房日期' }}
          </text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>

      <view class="date-tip">
        <text class="tip-text">默认14:00后入住，12:00前离店</text>
      </view>

      <!-- 入住天数 -->
      <view class="form-item" v-if="nights > 0">
        <view class="item-label">
          <text class="label-text">入住天数</text>
        </view>
        <view class="item-value">
          <text class="value-text">{{ nights }}晚</text>
        </view>
      </view>

      <!-- 入住人数 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">入住人数</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseGuests" :disabled="bookingForm.guests <= 1">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.guests }}人</text>
            <button class="stepper-btn" @tap="increaseGuests" :disabled="bookingForm.guests >= selectedSiteType.capacity">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系人信息 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">联系人信息</text>
      </view>

      <!-- 姓名 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">姓名</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactName"
            placeholder="请输入联系人姓名"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">手机号</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactPhone"
            name="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-item textarea-item">
        <view class="item-label">
          <text class="label-text">备注</text>
        </view>
        <view class="item-value full-width">
          <textarea
            class="textarea-field"
            v-model="bookingForm.remark"
            placeholder="请输入特殊需求或备注信息（选填）"
            placeholder-class="input-placeholder"
            maxlength="200"
          />
          <text class="char-count">{{ bookingForm.remark.length }}/200</text>
        </view>
      </view>
    </view>

    <!-- 预订须知 -->
    <view class="notice-section">
      <view class="section-title">
        <text class="title-text">预订须知</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="(notice, index) in bookingNotices" :key="index">
          <text class="notice-dot">•</text>
          <text class="notice-text">{{ notice }}</text>
        </view>
      </view>
      <view class="agreement-box">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox value="agree" :checked="agreed" color="#FF9F29" />
            <text class="agreement-text">我已阅读并同意</text>
            <text class="agreement-link" @tap.stop="viewAgreement">《营地预订协议》</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @tap="selectCoupon">
      <view class="coupon-row">
        <text class="section-title">优惠券</text>
        <view class="coupon-value">
          <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '请选择' }}</text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>
      <view v-if="selectedCoupon" class="coupon-tip">
        <text class="savings-text">已减￥{{ couponDiscount }}</text>
        <text class="coupon-desc">{{ formatCouponValidity(selectedCoupon) }}</text>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="section-title">
        <text class="title-text">价格明细</text>
      </view>
      <view class="price-list">
        <view class="price-item">
          <text class="price-label">营位费用</text>
          <text class="price-value">¥{{ selectedSiteType.price }} × {{ nights || 0 }}晚</text>
          <text class="price-amount">¥{{ siteFee }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">清洁费</text>
          <text class="price-value">一次性</text>
          <text class="price-amount">¥{{ cleaningFee }}</text>
        </view>
        <view v-if="couponDiscount > 0" class="price-item discount">
          <text class="price-label">优惠券抵扣</text>
          <text class="price-amount">-¥{{ couponDiscount }}</text>
        </view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-amount highlight">¥{{ payablePrice }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <text class="bar-label">总计：</text>
        <view class="bar-price">
          <text class="bar-symbol">¥</text>
          <text class="bar-amount">{{ payablePrice }}</text>
        </view>
      </view>
      <button class="submit-btn" @tap="submitBooking" :disabled="!canSubmit || submitting" :loading="submitting">
        提交预订
      </button>
    </view>

    <RentDatePicker
      ref="rentDatePickerRef"
      title-text="选择入住/离店日期"
      pickup-label="入住"
      return-label="离店"
      duration-unit="晚"
      :show-time-selection="false"
      default-time="14:00"
      @confirm="handleDateConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import RentDatePicker from '@/components/business/RentDatePicker.vue';
import { createCampsiteBooking, type CampsiteBookingParams, type CampsiteBookingResponse } from '@/api/campsite';

// 获取路由参数
const campsiteId = ref('');
const siteTypeId = ref('');

onLoad((options: any) => {
  campsiteId.value = options.campsiteId || '';
  siteTypeId.value = options.siteTypeId || '';
  loadBookingData();
  uni.$on('couponSelected', handleCouponSelected);
});

// 营地信息
const campsiteInfo = ref<any>({
  id: '',
  name: '',
  address: ''
});

// 选中的营位类型
const selectedSiteType = ref<any>({
  id: '',
  name: '',
  area: 0,
  capacity: 0,
  price: 0
});

// 预订表单
const bookingForm = ref({
  checkInDate: '',
  checkOutDate: '',
  checkInTime: '10:00',
  checkOutTime: '10:00',
  guests: 2,
  contactName: '',
  contactPhone: '',
  remark: ''
});

const submitting = ref(false);

// 是否同意协议
const agreed = ref(false);

// 预订须知
const bookingNotices = ref([
  '入住时间：14:00后，退房时间：12:00前',
  '预订需支付全额费用，不支持到店付款',
  '如需取消，请提前3天申请，否则不予退款',
  '请携带有效身份证件办理入住手续',
  '营地内禁止明火，烧烤请在指定区域进行',
  '请爱护营地环境，垃圾分类投放'
]);

// 已选择的优惠券
const selectedCoupon = ref<any | null>(null);

// 计算入住天数
const nights = computed(() => {
  if (!bookingForm.value.checkInDate || !bookingForm.value.checkOutDate) return 0;
  const checkIn = new Date(bookingForm.value.checkInDate);
  const checkOut = new Date(bookingForm.value.checkOutDate);
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// 价格计算
const siteFee = computed(() => {
  return selectedSiteType.value.price * nights.value;
});

const cleaningFee = ref(50);

const totalPrice = computed(() => {
  return siteFee.value + cleaningFee.value;
});

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0;
  const baseAmount = totalPrice.value;
  if (baseAmount <= 0) return 0;
  const coupon = selectedCoupon.value;

  if (typeof coupon.amount === 'number') {
    return Math.min(coupon.amount, baseAmount);
  }
  if (typeof coupon.discount === 'number') {
    return Math.min(coupon.discount, baseAmount);
  }
  if (typeof coupon.discountRate === 'number') {
    const rate = coupon.discountRate;
    let discountValue = 0;
    if (rate > 0 && rate < 1) {
      discountValue = baseAmount * (1 - rate);
    } else if (rate > 1 && rate < 10) {
      discountValue = baseAmount * (1 - rate / 10);
    }
    return Math.max(Math.min(Number(discountValue.toFixed(2)), baseAmount), 0);
  }
  return 0;
});

const payablePrice = computed(() => {
  return Math.max(totalPrice.value - couponDiscount.value, 0);
});

// 是否可以提交
const canSubmit = computed(() => {
  return (
    bookingForm.value.checkInDate &&
    bookingForm.value.checkOutDate &&
    nights.value > 0 &&
    bookingForm.value.guests > 0 &&
    bookingForm.value.contactName.trim() !== '' &&
    /^1[3-9]\d{9}$/.test(bookingForm.value.contactPhone) &&
    agreed.value
  );
});

// 加载预订数据
const loadBookingData = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // Mock数据
    const mockCampsite = {
      id: campsiteId.value,
      name: '千岛湖房车营地',
      address: '浙江省杭州市淳安县千岛湖镇环湖路88号'
    };

    const mockSiteTypes = [
      {
        id: '1',
        name: '标准营位',
        area: 50,
        capacity: 4,
        price: 280
      },
      {
        id: '2',
        name: '豪华营位A',
        area: 80,
        capacity: 6,
        price: 380
      },
      {
        id: '3',
        name: '豪华营位B',
        area: 120,
        capacity: 8,
        price: 580
      }
    ];

    campsiteInfo.value = mockCampsite;
    selectedSiteType.value = mockSiteTypes.find(t => t.id === siteTypeId.value) || mockSiteTypes[0];

  } catch (error) {
    console.error('加载预订数据失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

onUnmounted(() => {
  uni.$off('couponSelected', handleCouponSelected);
});

const rentDatePickerRef = ref();
const openDatePicker = () => {
  rentDatePickerRef.value?.open(
    bookingForm.value.checkInDate,
    bookingForm.value.checkOutDate,
    bookingForm.value.checkInTime || '10:00'
  );
};

const handleDateConfirm = (data: any) => {
  bookingForm.value.checkInDate = data.pickupDate;
  bookingForm.value.checkOutDate = data.returnDate;
  bookingForm.value.checkInTime = data.time;
  bookingForm.value.checkOutTime = data.time;
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 减少人数
const decreaseGuests = () => {
  if (bookingForm.value.guests > 1) {
    bookingForm.value.guests--;
  }
};

// 增加人数
const increaseGuests = () => {
  if (bookingForm.value.guests < selectedSiteType.value.capacity) {
    bookingForm.value.guests++;
  }
};

const selectCoupon = () => {
  if (nights.value <= 0) {
    uni.showToast({
      title: '请先选择入住/离店日期',
      icon: 'none'
    });
    return;
  }
  uni.navigateTo({
    url: `/pages/order/select-coupon?amount=${totalPrice.value}&selectedId=${selectedCoupon.value?.id || ''}&productType=campsite`
  });
};

const formatCouponValidity = (coupon: any) => {
  if (!coupon) return '';
  const end = coupon.validTo || coupon.validEnd;
  if (end) {
    const date = new Date(end);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `有效期至 ${year}.${month}.${day}`;
  }
  if (coupon.description) {
    return coupon.description;
  }
  return '已选择优惠券';
};

const handleCouponSelected = (coupon: any) => {
  selectedCoupon.value = coupon || null;
};

// 协议变化
const onAgreementChange = (e: any) => {
  agreed.value = e.detail.value.includes('agree');
};

// 查看协议
const viewAgreement = () => {
  uni.showModal({
    title: '营地预订协议',
    content: '这里是营地预订协议的详细内容...',
    showCancel: false
  });
};

// 提交预订
const submitBooking = async () => {
  if (!canSubmit.value || submitting.value) {
    if (!canSubmit.value) {
      uni.showToast({
        title: '请完善预订信息',
        icon: 'none'
      });
    }
    return;
  }

  submitting.value = true;

  try {
    uni.showLoading({ title: '提交中...' });

    const payload: CampsiteBookingParams = {
      campsiteId: campsiteInfo.value.id || campsiteId.value,
      siteTypeId: selectedSiteType.value.id || siteTypeId.value,
      checkInDate: bookingForm.value.checkInDate,
      checkOutDate: bookingForm.value.checkOutDate,
      guests: bookingForm.value.guests,
      contactName: bookingForm.value.contactName.trim(),
      contactPhone: bookingForm.value.contactPhone,
      remark: bookingForm.value.remark?.trim() || '',
      couponId: selectedCoupon.value?.id
    };

    let bookingResult: CampsiteBookingResponse | null = null;

    try {
      const response = await createCampsiteBooking(payload);
      if (response.code === 0 && response.data) {
        bookingResult = response.data;
      } else {
        throw new Error(response.message || '预订失败');
      }
    } catch (apiError) {
      console.warn('创建营地预订接口暂不可用，使用Mock数据回退', apiError);
      const now = Date.now();
      bookingResult = {
        orderId: `mock-${now}`,
        orderNo: `CS${now}`,
        status: 'PENDING_PAYMENT',
        totalPrice: payablePrice.value,
        paymentDeadline: new Date(now + 15 * 60 * 1000).toISOString()
      };
    }

    if (!bookingResult) {
      throw new Error('未获取到有效的订单信息');
    }

    uni.navigateTo({
      url: `/pages/order/pay?orderNo=${bookingResult.orderNo}&amount=${bookingResult.totalPrice}`
    });
  } catch (error) {
    console.error('提交预订失败:', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.campsite-booking {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 140rpx;
}

// 营地信息卡片
.campsite-card {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .campsite-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .campsite-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .site-type-badge {
      background-color: rgba(255, 159, 41, 0.1);
      color: #FF9F29;
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;

      .badge-text {
        font-weight: 500;
      }
    }
  }

  .campsite-meta {
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .meta-text {
        flex: 1;
        font-size: 26rpx;
        color: #666;
      }

      .meta-label {
        font-size: 24rpx;
        color: #999;
      }

      .meta-value {
        font-size: 24rpx;
        color: #333;
        font-weight: 500;
        margin-right: 24rpx;
      }
    }
  }
}

// 表单区域
.form-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F0F0F0;

    &:last-child {
      border-bottom: none;
    }

    &.textarea-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .item-label {
      display: flex;
      align-items: center;
      gap: 4rpx;

      .label-text {
        font-size: 28rpx;
        color: #333;
      }

      .required {
        color: #F44336;
        font-size: 28rpx;
      }
    }

    .item-value {
      display: flex;
      align-items: center;
      gap: 8rpx;

      &.full-width {
        width: 100%;
        margin-top: 16rpx;
        flex-direction: column;
        align-items: flex-end;
      }

      .value-text {
        font-size: 28rpx;
        color: #333;

        &.placeholder {
          color: #999;
        }
      }

      .input-field {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
      }

      .input-placeholder {
        color: #999;
      }

      .textarea-field {
        width: 100%;
        min-height: 160rpx;
        font-size: 28rpx;
        color: #333;
        padding: 16rpx;
        background-color: #F8F8F8;
        border-radius: 8rpx;
      }

      .char-count {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }

      .stepper {
        display: flex;
        align-items: center;
        gap: 24rpx;

        .stepper-btn {
          width: 56rpx;
          height: 56rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F8F8;
          border-radius: 8rpx;
          border: none;
          padding: 0;

          &::after {
            border: none;
          }

          &:disabled {
            opacity: 0.5;
          }
        }

        .stepper-value {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          min-width: 80rpx;
          text-align: center;
        }
      }
    }
  }

  .date-tip {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }
}

// 预订须知
.notice-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .notice-list {
    margin-bottom: 24rpx;

    .notice-item {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-dot {
        font-size: 26rpx;
        color: #FF9F29;
        flex-shrink: 0;
      }

      .notice-text {
        flex: 1;
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .agreement-box {
    padding-top: 24rpx;
    border-top: 2rpx solid #F0F0F0;

    .agreement-label {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .agreement-text {
        font-size: 26rpx;
        color: #666;
      }

      .agreement-link {
        font-size: 26rpx;
        color: #FF9F29;
      }
    }
  }
}

// 优惠券
.coupon-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .coupon-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .coupon-value {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .coupon-text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  .coupon-tip {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .savings-text {
      font-size: 26rpx;
      color: #52C41A;
      font-weight: 500;
    }

    .coupon-desc {
      font-size: 24rpx;
      color: #999;
    }
  }
}

// 价格明细
.price-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .price-list {
    .price-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #F0F0F0;

      &:last-child {
        border-bottom: none;
      }

      &.total {
        padding-top: 24rpx;
        margin-top: 8rpx;
        border-top: 2rpx solid #E0E0E0;

        .price-label {
          font-size: 30rpx;
          font-weight: 600;
        }

        .price-amount {
          font-size: 36rpx;
        }
      }

      .price-label {
        font-size: 28rpx;
        color: #333;
      }

      .price-value {
        flex: 1;
        font-size: 24rpx;
        color: #999;
        text-align: center;
      }

      .price-amount {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;

        &.highlight {
          color: #F44336;
          font-weight: 700;
        }
      }

      &.discount {
        .price-label {
          color: #52C41A;
        }

        .price-amount {
          color: #52C41A;
        }
      }
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;

  .bar-left {
    display: flex;
    align-items: baseline;
    gap: 8rpx;

    .bar-label {
      font-size: 26rpx;
      color: #666;
    }

    .bar-price {
      display: flex;
      align-items: baseline;

      .bar-symbol {
        font-size: 24rpx;
        color: #F44336;
        font-weight: 600;
      }

      .bar-amount {
        font-size: 40rpx;
        color: #F44336;
        font-weight: 700;
        margin-left: 4rpx;
      }
    }
  }

  .submit-btn {
    padding: 20rpx 64rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }

    &:disabled {
      background: #E0E0E0;
      color: #999;
    }
  }
}
</style>
