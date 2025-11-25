<!-- 预订表单组件 - BookingForm -->
<template>
  <view class="booking-form">
    <!-- 表单标题 -->
    <view v-if="showTitle" class="booking-form__header">
      <text class="booking-form__title">{{ title }}</text>
      <text v-if="subtitle" class="booking-form__subtitle">{{ subtitle }}</text>
    </view>

    <!-- 取车信息 -->
    <view class="booking-form__section">
      <view class="booking-form__section-title">
        <uni-icons type="location-filled" size="16" :color="'#FF9F29'" />
        <text class="booking-form__section-text">取车信息</text>
      </view>

      <!-- 城市门店行 -->
      <view class="booking-form__row">
        <view class="booking-form__item" @click="handleCitySelect">
          <view class="booking-form__icon">
            <uni-icons type="location" size="18" :color="'#FF9F29'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">取车城市</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.pickupCity }">
              {{ formData.pickupCity || '请选择取车城市' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>

        <view class="booking-form__divider"></view>

        <view class="booking-form__item" @click="handleStoreSelect">
          <view class="booking-form__icon">
            <uni-icons type="shop-filled" size="18" :color="'#FF9F29'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">取车门店</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.pickupStore }">
              {{ formData.pickupStore || '请选择取车门店' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>
      </view>
    </view>

    <!-- 还车信息 -->
    <view class="booking-form__section">
      <view class="booking-form__section-title">
        <uni-icons type="calendar-filled" size="16" :color="'#4B91FF'" />
        <text class="booking-form__section-text">还车信息</text>
      </view>

      <!-- 日期时间行 -->
      <view class="booking-form__row">
        <view class="booking-form__item" @click="handlePickupDateSelect">
          <view class="booking-form__icon">
            <uni-icons type="calendar" size="18" :color="'#FF9F29'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">取车日期</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.pickupDate }">
              {{ formatDisplayDate(formData.pickupDate) || '请选择取车日期' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>

        <view class="booking-form__divider"></view>

        <view class="booking-form__item" @click="handleReturnDateSelect">
          <view class="booking-form__icon">
            <uni-icons type="calendar" size="18" :color="'#4B91FF'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">还车日期</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.returnDate }">
              {{ formatDisplayDate(formData.returnDate) || '请选择还车日期' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>
      </view>

      <!-- 时间选择 -->
      <view class="booking-form__row">
        <view class="booking-form__item" @click="handlePickupTimeSelect">
          <view class="booking-form__icon">
            <uni-icons type="clock" size="18" :color="'#FF9F29'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">取车时间</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.pickupTime }">
              {{ formData.pickupTime || '请选择取车时间' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>

        <view class="booking-form__divider"></view>

        <view class="booking-form__item" @click="handleReturnTimeSelect">
          <view class="booking-form__icon">
            <uni-icons type="clock" size="18" :color="'#4B91FF'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">还车时间</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.returnTime }">
              {{ formData.returnTime || '请选择还车时间' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>
      </view>

      <!-- 异地还车选项 -->
      <view class="booking-form__option" @click="handleDifferentReturnToggle">
        <view class="booking-form__checkbox">
          <uni-icons
            :type="formData.differentReturn ? 'checkbox-filled' : 'checkbox'"
            size="20"
            :color="formData.differentReturn ? '#FF9F29' : '#CCCCCC'"
          />
        </view>
        <text class="booking-form__option-text">异地还车</text>
      </view>

      <!-- 异地还车门店选择 -->
      <view v-if="formData.differentReturn" class="booking-form__row booking-form__row--indented">
        <view class="booking-form__item" @click="handleReturnStoreSelect">
          <view class="booking-form__icon">
            <uni-icons type="shop" size="18" :color="'#4B91FF'" />
          </view>
          <view class="booking-form__content">
            <text class="booking-form__label">还车门店</text>
            <text class="booking-form__value" :class="{ 'booking-form__value--placeholder': !formData.returnStore }">
              {{ formData.returnStore || '请选择还车门店' }}
            </text>
          </view>
          <uni-icons type="right" size="14" :color="'#CCCCCC'" />
        </view>
      </view>
    </view>

    <!-- 搜索按钮 -->
    <view class="booking-form__actions">
      <view class="booking-form__button booking-form__button--primary" @click="handleSearch">
        <text class="booking-form__button-text">{{ searchButtonText }}</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view v-if="showTip" class="booking-form__tip">
      <uni-icons type="info-filled" size="16" :color="'#4B91FF'" />
      <text class="booking-form__tip-text">{{ tipText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';

interface BookingFormData {
  pickupCity?: string;
  pickupStore?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnCity?: string;
  returnStore?: string;
  returnDate?: string;
  returnTime?: string;
  differentReturn?: boolean;
}

interface BookingFormProps {
  /** 表单数据 */
  modelValue?: BookingFormData;
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 搜索按钮文字 */
  searchButtonText?: string;
  /** 是否显示提示信息 */
  showTip?: boolean;
  /** 提示信息文字 */
  tipText?: string;
}

interface BookingFormEmits {
  (e: 'update:modelValue', data: BookingFormData): void;
  (e: 'city-select', type: 'pickup' | 'return'): void;
  (e: 'store-select', type: 'pickup' | 'return'): void;
  (e: 'date-select', type: 'pickup' | 'return'): void;
  (e: 'time-select', type: 'pickup' | 'return'): void;
  (e: 'search', data: BookingFormData): void;
}

const props = withDefaults(defineProps<BookingFormProps>(), {
  title: '开启房车之旅',
  searchButtonText: '查询可用房车',
  showTitle: true,
  showTip: true,
  tipText: '平台拥有100+房车型号，覆盖全国50+城市'
});

const emit = defineEmits<BookingFormEmits>();

// 表单数据
const formData = reactive<BookingFormData>({
  pickupCity: '',
  pickupStore: '',
  pickupDate: '',
  pickupTime: '',
  returnCity: '',
  returnStore: '',
  returnDate: '',
  returnTime: '',
  differentReturn: false,
  ...props.modelValue
});

// 格式化显示日期
const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 处理城市选择
const handleCitySelect = () => {
  emit('city-select', 'pickup');
};

// 处理门店选择
const handleStoreSelect = () => {
  emit('store-select', 'pickup');
};

// 处理取车日期选择
const handlePickupDateSelect = () => {
  emit('date-select', 'pickup');
};

// 处理还车日期选择
const handleReturnDateSelect = () => {
  emit('date-select', 'return');
};

// 处理取车时间选择
const handlePickupTimeSelect = () => {
  emit('time-select', 'pickup');
};

// 处理还车时间选择
const handleReturnTimeSelect = () => {
  emit('time-select', 'return');
};

// 处理异地还车切换
const handleDifferentReturnToggle = () => {
  formData.differentReturn = !formData.differentReturn;

  // 如果关闭异地还车，清空还车城市和门店
  if (!formData.differentReturn) {
    formData.returnCity = formData.pickupCity;
    formData.returnStore = formData.pickupStore;
  }

  emit('update:modelValue', { ...formData });
};

// 处理还车门店选择
const handleReturnStoreSelect = () => {
  emit('store-select', 'return');
};

// 处理搜索
const handleSearch = () => {
  emit('search', { ...formData });
};
</script>

<style>
.booking-form {
  margin: 32rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  &__header {
    text-align: center;
    margin-bottom: 32rpx;
  }

  &__title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8rpx;
  }

  &__subtitle {
    display: block;
    font-size: 24rpx;
    color: #666666;
  }

  &__section {
    margin-bottom: 32rpx;

    .last-child {
      margin-bottom: 0;
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
  }

  &__section-text {
    margin-left: 8rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
  }

  &__row {
    display: flex;
    background-color: #F8F8F8;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 16rpx;

    &--indented {
      margin-left: 32rpx;
    }
  }

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 24rpx;
    transition: all 0.2s;

    .active {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  &__icon {
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__label {
    display: block;
    font-size: 20rpx;
    color: #999999;
    margin-bottom: 4rpx;
  }

  &__value {
    font-size: 28rpx;
    color: #333333;

    &--placeholder {
      color: #999999;
    }
  }

  &__divider {
    width: 2rpx;
    background-color: #E8E8E8;
    margin: 0 8rpx;
  }

  &__option {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    margin-top: 24rpx;
    cursor: pointer;

    .active {
      opacity: 0.7;
    }
  }

  &__checkbox {
    margin-right: 16rpx;
  }

  &__option-text {
    font-size: 28rpx;
    color: #333333;
  }

  &__actions {
    margin-top: 32rpx;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx;
    border-radius: 50rpx;
    transition: all 0.2s;

    &--primary {
      background-color: #FF9F29;
      color: #FFFFFF;
    }

    .active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  &__button-text {
    font-size: 32rpx;
    font-weight: 600;
  }

  &__tip {
    display: flex;
    align-items: center;
    margin-top: 24rpx;
    padding: 24rpx;
    background-color: rgba(#4B91FF, 0.1);
    border-radius: 16rpx;
  }

  &__tip-text {
    margin-left: 8rpx;
    font-size: 24rpx;
    color: #4B91FF;
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .booking-form {
    margin: 24rpx;
    padding: 24rpx;

    &__row {
      flex-direction: column;
    }

    &__divider {
      width: 100%;
      height: 2rpx;
      margin: 8rpx 0;
    }

    &__item {
      padding: 16rpx 0;
    }
  }
}
</style>