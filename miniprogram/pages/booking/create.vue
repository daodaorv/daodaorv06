<template>
  <view class="booking-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-content">
        <view class="nav-back" @tap="goBack">
          <uni-icons type="arrow-left" size="20" color="#FFFFFF"></uni-icons>
        </view>
        <text class="nav-title">预订房车</text>
        <view class="nav-step">
          <text class="step-text">2/4</text>
        </view>
      </view>
    </view>

    <!-- 进度指示器 -->
    <view class="progress-indicator">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: '50%' }"></view>
      </view>
      <view class="progress-steps">
        <view class="step-item completed">
          <view class="step-icon">
            <uni-icons type="checkmarkempty" size="16" color="#FFFFFF"></uni-icons>
          </view>
          <text class="step-text">选择车辆</text>
        </view>
        <view class="step-item active">
          <view class="step-icon">
            <text class="step-number">2</text>
          </view>
          <text class="step-text">预订信息</text>
        </view>
        <view class="step-item">
          <view class="step-icon">
            <text class="step-number">3</text>
          </view>
          <text class="step-text">确认订单</text>
        </view>
        <view class="step-item">
          <view class="step-icon">
            <text class="step-number">4</text>
          </view>
          <text class="step-text">完成支付</text>
        </view>
      </view>
    </view>

    <!-- 车辆信息卡片 -->
    <view class="selected-vehicle">
      <view class="vehicle-preview">
        <view class="vehicle-images">
          <image
            class="main-image"
            :src="vehicle.mainImage || '/static/placeholder-vehicle.png'"
            mode="aspectFill"
          ></image>
          <view class="image-overlay">
            <view class="vehicle-badge">
              <uni-icons type="star-filled" size="12" color="#FFFFFF"></uni-icons>
              <text class="badge-text">{{ vehicle.rating || '4.8' }}</text>
            </view>
          </view>
        </view>
        <view class="vehicle-summary">
          <view class="vehicle-title-section">
            <text class="vehicle-brand">{{ vehicle.brand }}</text>
            <text class="vehicle-model">{{ vehicle.model }}</text>
            <view class="vehicle-tags">
              <view class="tag popular">
                <uni-icons type="fire" size="12" color="#FF6B35"></uni-icons>
                <text>热门</text>
              </view>
              <view class="tag available" v-if="vehicle.availabilityStatus === '可用'">
                <uni-icons type="checkmarkempty" size="12" color="#48BB78"></uni-icons>
                <text>可租</text>
              </view>
            </view>
          </view>
          <view class="vehicle-specs">
            <view class="spec-chip">
              <uni-icons type="person-filled" size="14" color="#718096"></uni-icons>
              <text>{{ vehicle.seats }}座{{ vehicle.sleepers }}卧</text>
            </view>
            <view class="spec-chip">
              <uni-icons type="navigation" size="14" color="#718096"></uni-icons>
              <text>自动挡</text>
            </view>
            <view class="spec-chip">
              <uni-icons type="home" size="14" color="#718096"></uni-icons>
              <text>{{ vehicle.categoryName || 'C型' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 预订表单 -->
    <view class="booking-form">
      <!-- 日期选择区域 -->
      <view class="date-selection-card">
        <view class="card-header">
          <uni-icons type="calendar-filled" size="20" color="#FF6B35"></uni-icons>
          <text class="card-title">租赁时间</text>
        </view>
        <view class="date-pair">
          <view class="date-item pickup" @tap="showDatePicker('pickup')">
            <view class="date-icon">
              <uni-icons type="arrowright" size="16" color="#FF6B35"></uni-icons>
            </view>
            <view class="date-content">
              <text class="date-label">取车时间</text>
              <text class="date-value" :class="{ 'placeholder': !bookingForm.pickupDate }">
                {{ formatDateShort(bookingForm.pickupDate) || '选择日期' }}
              </text>
              <text class="time-value" :class="{ 'placeholder': !bookingForm.pickupTime }">
                {{ formatTime(bookingForm.pickupTime) || '选择时间' }}
              </text>
            </view>
          </view>
          <view class="date-divider">
            <view class="divider-line"></view>
            <text class="divider-text">{{ calculateDays() }}天</text>
            <view class="divider-line"></view>
          </view>
          <view class="date-item return" @tap="showDatePicker('return')">
            <view class="date-icon">
              <uni-icons type="arrowleft" size="16" color="#48BB78"></uni-icons>
            </view>
            <view class="date-content">
              <text class="date-label">还车时间</text>
              <text class="date-value" :class="{ 'placeholder': !bookingForm.returnDate }">
                {{ formatDateShort(bookingForm.returnDate) || '选择日期' }}
              </text>
              <text class="time-value" :class="{ 'placeholder': !bookingForm.returnTime }">
                {{ formatTime(bookingForm.returnTime) || '选择时间' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 地点选择 -->
      <view class="location-card">
        <view class="card-header">
          <uni-icons type="location-filled" size="20" color="#FF6B35"></uni-icons>
          <text class="card-title">取还地点</text>
        </view>

        <view class="location-item" @tap="showLocationPicker">
          <view class="location-icon">
            <uni-icons type="shop" size="20" color="#FF6B35"></uni-icons>
          </view>
          <view class="location-content">
            <text class="location-label">取车门店</text>
            <text class="location-value" :class="{ 'placeholder': !bookingForm.location }">
              {{ bookingForm.location || '选择取车门店' }}
            </text>
          </view>
          <uni-icons type="arrowright" size="16" color="#A0AEC0"></uni-icons>
        </view>

        <view class="different-return">
          <view class="checkbox-item">
            <switch
              :checked="bookingForm.differentReturnLocation"
              @change="onDifferentReturnChange"
              color="#FF6B35"
            ></switch>
            <text class="checkbox-label">异地还车</text>
          </view>
        </view>

        <view v-if="bookingForm.differentReturnLocation" class="location-item return-location" @tap="showReturnLocationPicker">
          <view class="location-icon">
            <uni-icons type="shop-filled" size="20" color="#48BB78"></uni-icons>
          </view>
          <view class="location-content">
            <text class="location-label">还车门店</text>
            <text class="location-value" :class="{ 'placeholder': !bookingForm.returnLocation }">
              {{ bookingForm.returnLocation || '选择还车门店' }}
            </text>
          </view>
          <uni-icons type="arrowright" size="16" color="#A0AEC0"></uni-icons>
        </view>
      </view>

      <!-- 额外服务 -->
      <view class="services-card">
        <view class="card-header">
          <uni-icons type="star" size="20" color="#FF6B35"></uni-icons>
          <text class="card-title">额外服务</text>
        </view>
        <view class="services-list">
          <view class="service-item">
            <view class="service-checkbox">
              <checkbox :checked="bookingForm.extraServices.includes('insurance')" @change="toggleService('insurance')" :color="'#FF6B35'"></checkbox>
            </view>
            <view class="service-content">
              <text class="service-name">基础保险</text>
              <text class="service-desc">包含基本车损险和第三者责任险</text>
              <text class="service-price">¥50/天</text>
            </view>
          </view>
          <view class="service-item">
            <view class="service-checkbox">
              <checkbox :checked="bookingForm.extraServices.includes('driver')" @change="toggleService('driver')" :color="'#FF6B35'"></checkbox>
            </view>
            <view class="service-content">
              <text class="service-name">代驾服务</text>
              <text class="service-desc">专业司机，熟悉路线</text>
              <text class="service-price">¥200/天</text>
            </view>
          </view>
          <view class="service-item">
            <view class="service-checkbox">
              <checkbox :checked="bookingForm.extraServices.includes('equipment')" @change="toggleService('equipment')" :color="'#FF6B35'"></checkbox>
            </view>
            <view class="service-content">
              <text class="service-name">户外装备</text>
              <text class="service-desc">帐篷、睡袋、野餐桌等</text>
              <text class="service-price">¥100/次</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="notes-card">
        <view class="card-header">
          <uni-icons type="compose" size="20" color="#FF6B35"></uni-icons>
          <text class="card-title">备注信息</text>
          <text class="char-count">{{ bookingForm.remarks.length }}/200</text>
        </view>
        <view class="textarea-container">
          <textarea
            class="notes-input"
            v-model="bookingForm.remarks"
            placeholder="请输入其他需求或备注信息，我们会尽量满足您的合理要求..."
            maxlength="200"
          ></textarea>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="pricing-section" v-if="bookingForm.pickupDate && bookingForm.returnDate">
      <view class="pricing-card">
        <view class="pricing-header">
          <uni-icons type="wallet" size="20" color="#FF6B35"></uni-icons>
          <text class="pricing-title">费用明细</text>
        </view>
        <view class="pricing-list">
          <view class="pricing-item">
            <view class="pricing-label">
              <text class="label-text">车辆租金</text>
              <text class="label-desc">{{ rentalDays }}天 × ¥{{ vehicle.dailyRate }}/天</text>
            </view>
            <text class="pricing-value">¥{{ dailyTotal }}</text>
          </view>
          <view class="pricing-item" v-if="bookingForm.extraServices.length > 0">
            <view class="pricing-label">
              <text class="label-text">额外服务</text>
              <text class="label-desc">{{ bookingForm.extraServices.length }}项</text>
            </view>
            <text class="pricing-value">¥{{ extraServicesTotal }}</text>
          </view>
          <view class="pricing-divider"></view>
          <view class="pricing-item total">
            <view class="pricing-label">
              <text class="label-text">预付总额</text>
              <text class="label-desc">含押金</text>
            </view>
            <text class="pricing-value total-amount">¥{{ totalAmount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <view class="action-content">
        <view class="price-summary">
          <view class="price-display">
            <text class="price-currency">¥</text>
            <text class="price-amount">{{ totalAmount }}</text>
          </view>
          <text class="price-description" v-if="bookingForm.pickupDate && bookingForm.returnDate">
            租赁{{ rentalDays }}天，押金¥{{ vehicle.deposit }}
          </text>
        </view>
        <button class="confirm-btn" @tap="submitBooking" :disabled="!canSubmit">
          <uni-icons type="checkmarkempty" size="18" color="#FFFFFF"></uni-icons>
          <text class="btn-text">确认预订</text>
        </button>
      </view>
    </view>

    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在处理预订...</text>
        <view class="loading-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: loadingProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ loadingProgress }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVehicleStore } from '@/stores/vehicle';
import { vehicleApi } from '@/api/vehicle';
import { orderApi } from '@/api/order';
import { useUserStore } from '@/stores/user';

const vehicleStore = useVehicleStore();
const userStore = useUserStore();

// 页面数据
const vehicleId = ref(0);
const vehicle = ref({});
const loading = ref(false);
const loadingProgress = ref(0);

// 预订表单数据
const bookingForm = ref({
  pickupDate: '',
  pickupTime: '',
  returnDate: '',
  returnTime: '',
  location: '',
  returnLocation: '',
  differentReturnLocation: false,
  extraServices: [],
  remarks: ''
});

// 模拟加载进度
const simulateLoadingProgress = () => {
  loadingProgress.value = 0;
  const interval = setInterval(() => {
    loadingProgress.value += Math.random() * 30;
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100;
      clearInterval(interval);
    }
  }, 500);
};

// 计算属性
const rentalDays = computed(() => {
  if (!bookingForm.value.pickupDate || !bookingForm.value.returnDate) return 0;
  const pickup = new Date(bookingForm.value.pickupDate);
  const returnDateObj = new Date(bookingForm.value.returnDate);
  const diffTime = Math.abs(returnDateObj - pickup);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const dailyTotal = computed(() => {
  return vehicle.value.dailyRate * rentalDays.value;
});

const extraServicesTotal = computed(() => {
  const servicePrices = {
    insurance: 50 * rentalDays.value,
    driver: 200 * rentalDays.value,
    equipment: 100
  };
  return bookingForm.value.extraServices.reduce((total, service) => {
    return total + (servicePrices[service] || 0);
  }, 0);
});

const totalAmount = computed(() => {
  return dailyTotal.value + extraServicesTotal.value + (vehicle.value.deposit || 0);
});

const canSubmit = computed(() => {
  return bookingForm.value.pickupDate &&
         bookingForm.value.returnDate &&
         bookingForm.value.pickupTime &&
         bookingForm.value.returnTime &&
         bookingForm.value.location &&
         (!bookingForm.value.differentReturnLocation || bookingForm.value.returnLocation) &&
         new Date(bookingForm.value.returnDate) > new Date(bookingForm.value.pickupDate);
});

// 页面加载
onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  vehicleId.value = Number(options.vehicleId) || 0;

  // 预填充数据
  if (options.pickupDate) bookingForm.value.pickupDate = options.pickupDate;
  if (options.returnDate) bookingForm.value.returnDate = options.returnDate;
  if (options.location) bookingForm.value.location = decodeURIComponent(options.location || '');

  if (vehicleId.value > 0) {
    await loadVehicleDetail();
  } else {
    uni.showToast({
      title: '无效的车辆ID',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

// 加载车辆详情
const loadVehicleDetail = async () => {
  try {
    const result = await vehicleApi.getVehicleById(vehicleId.value);
    vehicle.value = result;
  } catch (error) {
    console.error('加载车辆详情失败:', error);
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
  }
};

// 日期选择器
const showDatePicker = (type) => {
  const currentDate = new Date();
  const minDate = currentDate.getTime();
  const maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getTime();

  uni.showDatePicker({
    currentDate: type === 'pickup' ? bookingForm.value.pickupDate : bookingForm.value.returnDate,
    startDate: type === 'pickup' ? minDate : new Date(bookingForm.value.pickupDate || minDate).getTime(),
    endDate: maxDate,
    success: (res) => {
      const selectedDate = res.date;
      if (type === 'pickup') {
        bookingForm.value.pickupDate = selectedDate;
        // 如果还车时间早于取车时间，清空还车时间
        if (bookingForm.value.returnDate && new Date(bookingForm.value.returnDate) <= new Date(selectedDate)) {
          bookingForm.value.returnDate = '';
          bookingForm.value.returnTime = '';
        }
      } else {
        bookingForm.value.returnDate = selectedDate;
      }
    }
  });
};

// 时间选择器
const showTimePicker = (type) => {
  uni.showTimePicker({
    success: (res) => {
      const selectedTime = res.time;
      if (type === 'pickup') {
        bookingForm.value.pickupTime = selectedTime;
      } else {
        bookingForm.value.returnTime = selectedTime;
      }
    }
  });
};

// 地点选择器
const showLocationPicker = () => {
  uni.showActionSheet({
    itemList: [
      '北京朝阳店 - 北京市朝阳区建国路88号',
      '上海浦东店 - 上海市浦东新区陆家嘴',
      '广州天河店 - 广州市天河区天河路',
      '深圳南山店 - 深圳市南山区科技园'
    ],
    success: (res) => {
      const locations = [
        '北京朝���店 - 北京市朝阳区建国路88号',
        '上海浦东店 - 上海市浦东新区陆家嘴',
        '广州天河店 - 广州市天河区天河路',
        '深圳南山店 - 深圳市南山区科技园'
      ];
      bookingForm.value.location = locations[res.tapIndex];
    }
  });
};

// 还车地点选择器
const showReturnLocationPicker = () => {
  uni.showActionSheet({
    itemList: [
      '北京朝阳店 - 北京市朝阳区建国路88号',
      '上海浦东店 - 上海市浦东新区陆家嘴',
      '广州天河店 - 广州市天河区天河路',
      '深圳南山店 - 深圳市南山区科技园'
    ],
    success: (res) => {
      const locations = [
        '北京朝阳店 - 北京市朝阳区建国路88号',
        '上海浦东店 - 上海市浦东新区陆家嘴',
        '广州天河店 - 广州市天河区天河路',
        '深圳南山店 - 深圳市南山区科技园'
      ];
      bookingForm.value.returnLocation = locations[res.tapIndex];
    }
  });
};

// 异地还车切换
const onDifferentReturnChange = (e) => {
  bookingForm.value.differentReturnLocation = e.detail.value;
  if (!e.detail.value) {
    bookingForm.value.returnLocation = '';
  }
};

// 额外服务切换
const toggleService = (service) => {
  const index = bookingForm.value.extraServices.indexOf(service);
  if (index > -1) {
    bookingForm.value.extraServices.splice(index, 1);
  } else {
    bookingForm.value.extraServices.push(service);
  }
};

// 计算租赁天数显示
const calculateDays = () => {
  return rentalDays.value || 1;
};

// 格式化日期
const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5);
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
};

// 提交预订
const submitBooking = async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      });
    }, 1500);
    return;
  }

  try {
    loading.value = true;
    simulateLoadingProgress();

    const bookingData = {
      vehicleId: vehicleId.value,
      pickupDate: bookingForm.value.pickupDate,
      pickupTime: bookingForm.value.pickupTime,
      returnDate: bookingForm.value.returnDate,
      returnTime: bookingForm.value.returnTime,
      pickupLocation: bookingForm.value.location,
      returnLocation: bookingForm.value.differentReturnLocation ? bookingForm.value.returnLocation : bookingForm.value.location,
      remarks: bookingForm.value.remarks,
      extraServices: bookingForm.value.extraServices,
      dailyRate: vehicle.value.dailyRate,
      deposit: vehicle.value.deposit,
      extraServicesFee: extraServicesTotal.value,
      totalAmount: totalAmount.value
    };

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // const result = await orderApi.createOrder(bookingData);

    uni.showToast({
      title: '预订成功',
      icon: 'success'
    });

    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/order/detail?id=${Date.now()}`
      });
    }, 1500);

  } catch (error) {
    console.error('提交预订失败:', error);
    uni.showToast({
      title: error.message || '预订失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    loadingProgress.value = 0;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style>
// Design System Variables
#FF6B35: #FF6B35;
#FF8F5A: #FF8F5A;
#E55A2B: #E55A2B;
#48BB78: #48BB78;
#68D391: #68D391;
#4299E1: #4299E1;
#F6AD55: #F6AD55;
#FC8181: #FC8181;
#48BB78: #48BB78;

// Neutral Colors
#333333: #2D3748;
#666666: #4A5568;
#999999: #718096;
#CCCCCC: #A0AEC0;
#CCCCCC: #CBD5E0;

// Background Colors
#FFFFFF: #FFFFFF;
#F8F8F8: #F7FAFC;
#EDF2F7: #EDF2F7;
rgba(0, 0, 0, 0.5): rgba(0, 0, 0, 0.5);

// Border Colors
#E8E8E8: #E2E8F0;
#DDDDDD: #CBD5E0;
#CCCCCC: #A0AEC0;

// Spacing Scale
8rpx: 8rpx;
16rpx: 16rpx;
24rpx: 24rpx;
32rpx: 32rpx;
48rpx: 48rpx;
80rpx: 64rpx;

// Border Radius
12rpx: 8rpx;
16rpx: 12rpx;
20rpx: 16rpx;
24rpx: 24rpx;

// Shadows
0 2rpx 8rpx rgba(0, 0, 0, 0.06): 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
0 4rpx 16rpx rgba(0, 0, 0, 0.08): 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
0 8rpx 24rpx rgba(0, 0, 0, 0.12): 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
0 16rpx 48rpx rgba(0, 0, 0, 0.16): 0 16rpx 48rpx rgba(0, 0, 0, 0.16);

// Typography Scale
20rpx: 24rpx;
24rpx: 28rpx;
28rpx: 32rpx;
32rpx: 36rpx;
36rpx: 48rpx;
40rpx: 56rpx;

// Font Weights
300: 300;
400: 400;
500: 500;
600: 600;
700: 700;

// Main Styles
.booking-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F8F8 0%, #FFFFFF 100%);
  padding-bottom: 200rpx;
}

// Navigation Header
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
  padding: calc(var(--status-bar-height) + 24rpx) 32rpx 32rpx;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .nav-back {
      width: 72rpx;
      height: 72rpx;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(20rpx);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1rpx solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.25);
      }
    }

    .nav-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #FFFFFF;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }

    .nav-step   .step-text { font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        background: rgba(255, 255, 255, 0.2);
        padding: 8rpx 24rpx;
        border-radius: 20rpx; }
  }
}

// Progress Indicator
.progress-indicator {
  background: #FFFFFF;
  margin: calc(var(--status-bar-height) + 140rpx) 32rpx 32rpx;
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);

  .progress-bar {
    height: 6rpx;
    background: #E8E8E8;
    border-radius: 3rpx;
    margin-bottom: 32rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF6B35 0%, #FF8F5A 100%);
      border-radius: 3rpx;
      transition: width 0.8s ease;
    }
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;

      .step-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;
        font-size: 24rpx;
        font-weight: 700;
        border: 3rpx solid #E8E8E8;
        background: #FFFFFF;
        color: #999999;
        transition: all 0.3s ease;

        .step-number {
          font-size: 28rpx;
        }
      }

      .step-text {
        font-size: 20rpx;
        color: #999999;
        font-weight: 500;
        text-align: center;
        line-height: 1.3;
      }

      &.completed  { .step-icon { background: linear-gradient(135deg, #48BB78 0%, #68D391 100%);
          border-color: #48BB78;
          color: #FFFFFF;
          box-shadow: 0 4rpx 16rpx rgba(#48BB78, 0.3); }.step-text { color: #48BB78;
          font-weight: 600; } }

      &.active  { .step-icon { background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
          border-color: #FF6B35;
          color: #FFFFFF;
          box-shadow: 0 4rpx 16rpx rgba(#FF6B35, 0.3); }.step-text { color: #FF6B35;
          font-weight: 600; } }
    }
  }
}

// Selected Vehicle Card
.selected-vehicle {
  margin: 0 32rpx 32rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  border: 1rpx solid rgba(0, 0, 0, 0.05);

  .vehicle-preview {
    display: flex;

    .vehicle-images {
      position: relative;
      width: 240rpx;
      height: 200rpx;

      .main-image {
        width: 100%;
        height: 100%;
        background: #EDF2F7;
      }

      .image-overlay {
        position: absolute;
        top: 24rpx;
        left: 24rpx;

        .vehicle-badge {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20rpx);
          border-radius: 20rpx;
          padding: 8rpx 16rpx;
          display: flex;
          align-items: center;
          gap: 4rpx;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

          .badge-text {
            font-size: 20rpx * 0.8;
            color: #F6AD55;
            font-weight: 700;
          }
        }
      }
    }

    .vehicle-summary {
      flex: 1;
      padding: 32rpx;

      .vehicle-title-section {
        margin-bottom: 24rpx;

        .vehicle-brand {
          font-size: 32rpx;
          font-weight: 700;
          color: #333333;
          display: block;
          margin-bottom: 8rpx;
          line-height: 1.3;
        }

        .vehicle-model {
          font-size: 24rpx;
          color: #666666;
          display: block;
          margin-bottom: 24rpx;
          line-height: 1.4;
        }

        .vehicle-tags {
          display: flex;
          gap: 16rpx;

          .tag {
            display: inline-flex;
            align-items: center;
            gap: 4rpx;
            padding: 8rpx 16rpx;
            border-radius: 12rpx;
            font-size: 20rpx * 0.8;
            font-weight: 500;

            &.popular {
              background: rgba(#FF6B35, 0.1);
              color: #FF6B35;
            }

            &.available {
              background: rgba(#48BB78, 0.1);
              color: #48BB78;
            }
          }
        }
      }

      .vehicle-specs {
        display: flex;
        gap: 16rpx;

        .spec-chip {
          display: flex;
          align-items: center;
          gap: 4rpx;
          padding: 8rpx 16rpx;
          background: #F8F8F8;
          border-radius: 12rpx;
          border: 1rpx solid #E8E8E8;

          text {
            font-size: 20rpx;
            color: #666666;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// Booking Form
.booking-form {
  margin: 0 32rpx 32rpx;

  .date-selection-card,
  .location-card,
  .services-card,
  .notes-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    margin-bottom: 32rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    border: 1rpx solid rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      align-items: center;
      gap: 24rpx;
      padding: 48rpx 32rpx 32rpx;
      background: linear-gradient(135deg, rgba(#FF6B35, 0.05) 0%, rgba(#FF8F5A, 0.02) 100%);
      border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

      .card-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333333;
      }

      .char-count {
        margin-left: auto;
        font-size: 20rpx;
        color: #999999;
      }
    }
  }
}

// Date Selection
.date-pair {
  padding: 32rpx;

  .date-item {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 32rpx;
    background: #F8F8F8;
    border-radius: 20rpx;
    border: 2rpx solid #E8E8E8;
    transition: all 0.3s ease;

    .active {
      transform: scale(0.98);
      border-color: #FF6B35;
      box-shadow: 0 0 0 4rpx rgba(#FF6B35, 0.1);
    }

    &.pickup {
      border-color: rgba(#FF6B35, 0.3);
    }

    &.return {
      border-color: rgba(#48BB78, 0.3);
    }

    .date-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    }

    .date-content {
      flex: 1;

      .date-label {
        font-size: 24rpx;
        color: #666666;
        font-weight: 500;
        margin-bottom: 8rpx;
        display: block;
      }

      .date-value,
      .time-value {
        font-size: 28rpx;
        color: #333333;
        font-weight: 600;
        display: block;
        line-height: 1.3;

        &.placeholder {
          color: #CCCCCC;
          font-weight: 400;
        }
      }

      .time-value {
        font-size: 24rpx;
        color: #666666;
        font-weight: 500;
        margin-top: 8rpx;
      }
    }
  }

  .date-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    margin: 32rpx 0;

    .divider-line {
      flex: 1;
      height: 2rpx;
      background: #E8E8E8;
      width: 80rpx;
    }

    .divider-text {
      font-size: 24rpx;
      color: #FF6B35;
      font-weight: 700;
      background: #FFFFFF;
      padding: 8rpx 24rpx;
      border-radius: 16rpx;
      border: 2rpx solid rgba(#FF6B35, 0.2);
    }
  }
}

// Location Selection
.location-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  transition: all 0.3s ease;

  .active {
    background: darken(#F8F8F8, 3%);
    transform: scale(0.98);
  }

  .location-icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(#FF6B35, 0.1) 0%, rgba(#FF8F5A, 0.05) 100%);
    border: 2rpx solid rgba(#FF6B35, 0.2);
  }

  .location-content {
    flex: 1;

    .location-label {
      font-size: 24rpx;
      color: #666666;
      font-weight: 500;
      margin-bottom: 8rpx;
      display: block;
    }

    .location-value {
      font-size: 28rpx;
      color: #333333;
      font-weight: 600;
      display: block;
      line-height: 1.3;

      &.placeholder {
        color: #CCCCCC;
        font-weight: 400;
      }
    }
  }
}

.different-return {
  padding: 32rpx;
  background: rgba(#4299E1, 0.03);
  border-top: 1rpx solid rgba(#E8E8E8, 0.6);

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .checkbox-label {
      font-size: 28rpx;
      color: #333333;
      font-weight: 500;
      flex: 1;
    }
  }
}

.return-location {
  border-top: 1rpx solid rgba(#E8E8E8, 0.6);
}

// Extra Services
.services-list {
  padding: 32rpx;

  .service-item {
    display: flex;
    align-items: center;
    gap: 32rpx;
    padding: 32rpx 0;
    border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

    .last-child {
      border-bottom: none;
    }

    .service-checkbox   .checkbox { width: 40rpx;
        height: 40rpx;
        border-radius: 12rpx; }

    .service-content {
      flex: 1;

      .service-name {
        font-size: 28rpx;
        color: #333333;
        font-weight: 600;
        display: block;
        margin-bottom: 8rpx;
        line-height: 1.3;
      }

      .service-desc {
        font-size: 24rpx;
        color: #666666;
        display: block;
        margin-bottom: 16rpx;
        line-height: 1.4;
      }

      .service-price {
        font-size: 28rpx;
        color: #FF6B35;
        font-weight: 700;
      }
    }
  }
}

// Notes Section
.textarea-container {
  padding: 32rpx;

  .notes-input {
    width: 100%;
    min-height: 200rpx;
    padding: 32rpx;
    background: #F8F8F8;
    border: 2rpx solid #E8E8E8;
    border-radius: 20rpx;
    font-size: 28rpx;
    color: #333333;
    line-height: 1.5;
    transition: all 0.3s ease;

    .focus-within {
      border-color: #FF6B35;
      box-shadow: 0 0 0 4rpx rgba(#FF6B35, 0.1);
    }
  }
}

// Pricing Section
.pricing-section {
  margin: 0 32rpx 32rpx;

  .pricing-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    border: 1rpx solid rgba(0, 0, 0, 0.05);

    .pricing-header {
      display: flex;
      align-items: center;
      gap: 24rpx;
      padding: 48rpx 32rpx 32rpx;
      background: linear-gradient(135deg, rgba(#F6AD55, 0.1) 0%, rgba(#F6AD55, 0.05) 100%);
      border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

      .pricing-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333333;
      }
    }

    .pricing-list {
      padding: 32rpx;

      .pricing-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24rpx 0;

        .pricing-label {
          flex: 1;

          .label-text {
            font-size: 28rpx;
            color: #333333;
            font-weight: 500;
            display: block;
            margin-bottom: 8rpx;
            line-height: 1.3;
          }

          .label-desc {
            font-size: 24rpx;
            color: #666666;
            display: block;
            line-height: 1.4;
          }
        }

        .pricing-value {
          font-size: 32rpx;
          color: #333333;
          font-weight: 600;
          text-align: right;

          &.total-amount {
            font-size: 36rpx;
            color: #FF6B35;
            font-weight: 700;
          }
        }

        &.total {
          padding-top: 32rpx;
          border-top: 2rpx solid #E8E8E8;
          margin-top: 24rpx;

          .pricing-label   .label-text { font-size: 32rpx;
              font-weight: 600;
              color: #333333; }
        }
      }

      .pricing-divider {
        height: 2rpx;
        background: #E8E8E8;
        margin: 24rpx 0;
      }
    }
  }
}

// Bottom Action Bar
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 32rpx;
  border-top: 2rpx solid #E8E8E8;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.16);
  z-index: 100;

  .action-content {
    display: flex;
    align-items: center;
    gap: 32rpx;

    .price-summary {
      flex: 1;

      .price-display {
        display: flex;
        align-items: baseline;
        gap: 2rpx;
        margin-bottom: 8rpx;

        .price-currency {
          font-size: 28rpx;
          color: #FF6B35;
          font-weight: 600;
        }

        .price-amount {
          font-size: 40rpx;
          color: #FF6B35;
          font-weight: 700;
          line-height: 1.2;
        }
      }

      .price-description {
        font-size: 20rpx;
        color: #999999;
        line-height: 1.4;
      }
    }

    .confirm-btn {
      flex: 1;
      max-width: 400rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 20rpx;
      padding: 48rpx 0;
      font-size: 28rpx;
      font-weight: 600;
      box-shadow: 0 8rpx 24rpx rgba(#FF6B35, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
        transition: left 0.6s ease;
      }

      .active::before {
        left: 100%;
      }

      .active {
        transform: translateY(2rpx);
        box-shadow: 0 4rpx 16rpx rgba(#FF6B35, 0.25);
      }

      .disabled {
        background: #E8E8E8;
        color: #CCCCCC;
        box-shadow: none;
        transform: none;

        &::before {
          display: none;
        }
      }

      .btn-text {
        font-weight: 600;
        letter-spacing: 1rpx;
      }
    }
  }
}

// Loading Overlay
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 80rpx;
    text-align: center;
    min-width: 320rpx;
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.16);

    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 8rpx solid #E8E8E8;
      border-top: 8rpx solid #FF6B35;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 32rpx;
    }

    .loading-text {
      font-size: 28rpx;
      color: #333333;
      font-weight: 500;
      margin-bottom: 32rpx;
    }

    .loading-progress   .progress-bar { height: 8rpx;
        background: #E8E8E8;
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 16rpx;

        .progress-fill { height: 100%;
          background: linear-gradient(90deg, #FF6B35 0%, #FF8F5A 100%);
          border-radius: 4rpx;
          transition: width 0.5s ease; }

      .progress-text {
        font-size: 24rpx;
        color: #999999;
        font-weight: 500;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>