<template>
  <view class="order-confirm-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
        </view>
        <text class="nav-title">确认订单</text>
        <view class="nav-item"></view>
      </view>
    </view>

    <!-- 订单内容 -->
    <scroll-view class="order-content" scroll-y="true" v-if="orderData">
      <!-- 车辆信息 -->
      <view class="vehicle-card">
        <view class="card-header">
          <text class="card-title">车辆信息</text>
        </view>
        <view class="vehicle-info">
          <image
            class="vehicle-image"
            :src="orderData.vehicle.images?.[0] || '/static/placeholder-vehicle.png'"
            mode="aspectFill"
          ></image>
          <view class="vehicle-details">
            <text class="vehicle-name">{{ orderData.vehicle.name }}</text>
            <view class="vehicle-features">
              <text class="feature-item" v-if="orderData.vehicle.specifications?.seats">
                <uni-icons type="person" size="14" color="#666"></uni-icons>
                {{ orderData.vehicle.specifications.seats }}座
              </text>
              <text class="feature-item" v-if="orderData.vehicle.specifications?.fuelType">
                <uni-icons type="gear" size="14" color="#666"></uni-icons>
                {{ orderData.vehicle.specifications.fuelType }}
              </text>
              <text class="feature-item" v-if="orderData.vehicle.specifications?.transmission">
                <uni-icons type="settings" size="14" color="#666"></uni-icons>
                {{ orderData.vehicle.specifications.transmission }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 租赁信息 -->
      <view class="rental-card">
        <view class="card-header">
          <text class="card-title">租赁信息</text>
        </view>
        <view class="rental-info">
          <view class="info-item">
            <view class="item-label">
              <uni-icons type="location" size="16" color="#FF9F29"></uni-icons>
              <text class="label-text">取车门店</text>
            </view>
            <text class="item-value">{{ orderData.pickupStore.name }}</text>
          </view>
          <view class="info-item" v-if="orderData.returnStore.id !== orderData.pickupStore.id">
            <view class="item-label">
              <uni-icons type="flag" size="16" color="#4B91FF"></uni-icons>
              <text class="label-text">还车门店</text>
            </view>
            <text class="item-value">{{ orderData.returnStore.name }}</text>
          </view>
          <view class="info-item">
            <view class="item-label">
              <uni-icons type="calendar" size="16" color="#FF9F29"></uni-icons>
              <text class="label-text">取车时间</text>
            </view>
            <text class="item-value">{{ formatDateTime(orderData.pickupTime) }}</text>
          </view>
          <view class="info-item">
            <view class="item-label">
              <uni-icons type="calendar" size="16" color="#FF9F29"></uni-icons>
              <text class="label-text">还车时间</text>
            </view>
            <text class="item-value">{{ formatDateTime(orderData.returnTime) }}</text>
          </view>
          <view class="info-item">
            <view class="item-label">
              <uni-icons type="clock" size="16" color="#FF9F29"></uni-icons>
              <text class="label-text">租赁天数</text>
            </view>
            <text class="item-value">{{ priceCalculation?.rentalDays }}天</text>
          </view>
        </view>
      </view>

      <!-- 联系人信息 -->
      <view class="contact-card">
        <view class="card-header">
          <text class="card-title">联系人信息</text>
        </view>
        <view class="contact-form">
          <view class="form-item">
            <view class="item-label">
              <text class="required">*</text>
              <text class="label-text">联系人姓名</text>
            </view>
            <input
              class="form-input"
              type="text"
              v-model="contactForm.contactName"
              placeholder="请输入真实姓名"
              maxlength="50"
            />
          </view>
          <view class="form-item">
            <view class="item-label">
              <text class="required">*</text>
              <text class="label-text">手机号码</text>
            </view>
            <input
              class="form-input"
              type="number"
              v-model="contactForm.contactPhone"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
          <view class="form-item">
            <view class="item-label">
              <text class="required">*</text>
              <text class="label-text">身份证号</text>
            </view>
            <input
              class="form-input"
              type="text"
              v-model="contactForm.idCardNumber"
              placeholder="请输入身份证号"
              maxlength="18"
            />
          </view>
          <view class="form-item">
            <view class="item-label">
              <text class="label-text">驾驶证号</text>
            </view>
            <input
              class="form-input"
              type="text"
              v-model="contactForm.driverLicenseNumber"
              placeholder="请输入驾驶证号"
              maxlength="50"
            />
          </view>
          <view class="form-item">
            <view class="item-label">
              <text class="label-text">备注信息</text>
            </view>
            <textarea
              class="form-textarea"
              v-model="contactForm.userRemark"
              placeholder="请输入备注信息（选填）"
              maxlength="500"
            ></textarea>
          </view>
        </view>
      </view>

      <!-- 优惠券 -->
      <view class="coupon-card" @tap="selectCoupon">
        <view class="card-header">
          <text class="card-title">优惠券</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        <view class="coupon-info">
          <text class="coupon-text" v-if="selectedCoupon">
            {{ selectedCoupon.name }} -¥{{ selectedCoupon.discount }}
          </text>
          <text class="coupon-placeholder" v-else>
            选择优惠券
          </text>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="price-card">
        <view class="card-header">
          <text class="card-title">费用明细</text>
        </view>
        <view class="price-details" v-if="priceCalculation">
          <view class="price-item">
            <text class="price-label">车辆租赁费</text>
            <text class="price-value">¥{{ priceCalculation.vehicleFee }}</text>
          </view>
          <view class="price-item">
            <text class="price-label">保险费</text>
            <text class="price-value">¥{{ priceCalculation.insuranceFee }}</text>
          </view>
          <view class="price-item">
            <text class="price-label">服务费</text>
            <text class="price-value">¥{{ priceCalculation.serviceFee }}</text>
          </view>
          <view class="price-item discount" v-if="priceCalculation.couponDiscount > 0">
            <text class="price-label">优惠券折扣</text>
            <text class="price-value">-¥{{ priceCalculation.couponDiscount }}</text>
          </view>
          <view class="price-divider"></view>
          <view class="price-item">
            <text class="price-label">租赁费用合计</text>
            <text class="price-value">¥{{ priceCalculation.totalAmount }}</text>
          </view>
          <view class="price-item">
            <text class="price-label">押金</text>
            <text class="price-value">¥{{ priceCalculation.depositAmount }}</text>
          </view>
          <view class="price-divider"></view>
          <view class="price-item total">
            <text class="price-label">实付金额</text>
            <text class="price-value">¥{{ totalPayAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 预订须知 -->
      <view class="notice-card">
        <view class="card-header">
          <text class="card-title">预订须知</text>
        </view>
        <view class="notice-content">
          <view class="notice-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="notice-text">取车时请携带身份证、驾驶证等有效证件</text>
          </view>
          <view class="notice-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="notice-text">需要支付押金，还车后无损坏情况将退还</text>
          </view>
          <view class="notice-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="notice-text">请按照约定时间取车还车，超时将产生额外费用</text>
          </view>
          <view class="notice-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="notice-text">订单确认后不可随意取消，请谨慎操作</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="price-label">实付：</text>
        <text class="price-amount">¥{{ totalPayAmount }}</text>
      </view>
      <button
        class="submit-btn"
        :class="{ 'disabled': !canSubmit || calculating }"
        :disabled="!canSubmit || calculating || submitting"
        :loading="submitting"
        @tap="submitOrder"
      >
        {{ calculating ? '计算中...' : '确认下单' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { orderApi } from '@/api/order';

const userStore = useUserStore();

// 订单数据
const orderData = ref(null);
const priceCalculation = ref(null);
const selectedCoupon = ref(null);
const calculating = ref(false);
const submitting = ref(false);

// 联系人表单
const contactForm = ref({
  contactName: '',
  contactPhone: '',
  idCardNumber: '',
  driverLicenseNumber: '',
  userRemark: ''
});

// 参数
const vehicleId = ref(null);
const pickupStoreId = ref(null);
const returnStoreId = ref(null);
const pickupTime = ref(null);
const returnTime = ref(null);

// 计算属性
const totalPayAmount = computed(() => {
  if (!priceCalculation.value) return 0;
  return priceCalculation.value.totalAmount + priceCalculation.value.depositAmount;
});

const canSubmit = computed(() => {
  if (!orderData.value || !priceCalculation.value) return false;

  const form = contactForm.value;
  return (
    form.contactName.trim() &&
    form.contactPhone.trim() &&
    form.idCardNumber.trim() &&
    /^1[3-9]\d{9}$/.test(form.contactPhone) &&
    /^\d{17}[\dXx]$/.test(form.idCardNumber)
  );
});

// 页面加载
onLoad((options) => {
  // 接收参数
  vehicleId.value = parseInt(options.vehicleId);
  pickupStoreId.value = parseInt(options.pickupStoreId);
  returnStoreId.value = options.returnStoreId ? parseInt(options.returnStoreId) : null;
  pickupTime.value = options.pickupTime;
  returnTime.value = options.returnTime;

  // 初始化用户信息
  if (userStore.userInfo) {
    contactForm.value.contactName = userStore.userInfo.realName || '';
    contactForm.value.contactPhone = userStore.userInfo.phone || '';
  }

  // 加载订单数据
  loadOrderData();
});

// 加载订单数据
const loadOrderData = async () => {
  try {
    calculating.value = true;

    // 获取车辆详情和门店信息
    const [vehicleDetail, priceData] = await Promise.all([
      // 这里应该调用车辆详情API
      Promise.resolve({
        id: vehicleId.value,
        name: '奔驰Sprinter豪华房车',
        images: ['/static/placeholder-vehicle.png'],
        specifications: {
          seats: 6,
          fuelType: '柴油',
          transmission: '自动'
        }
      }),
      orderApi.calculatePrice({
        vehicleId: vehicleId.value,
        pickupTime: pickupTime.value,
        returnTime: returnTime.value,
        couponId: selectedCoupon.value?.id
      })
    ]);

    orderData.value = {
      vehicle: vehicleDetail,
      pickupStore: {
        id: pickupStoreId.value,
        name: '深圳机场店',
        address: '深圳市宝安区机场路'
      },
      returnStore: returnStoreId.value ? {
        id: returnStoreId.value,
        name: '深圳市中心店',
        address: '深圳市福田区华强北'
      } : {
        id: pickupStoreId.value,
        name: '深圳机场店',
        address: '深圳市宝安区机场路'
      },
      pickupTime: pickupTime.value,
      returnTime: returnTime.value
    };

    priceCalculation.value = priceData;

  } catch (error) {
    console.error('加载订单数据失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    calculating.value = false;
  }
};

// 选择优惠券
const selectCoupon = () => {
  uni.navigateTo({
    url: '/pages/coupon/select?amount=' + (priceCalculation.value?.totalAmount || 0)
  });
};

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完善订单信息',
      icon: 'none'
    });
    return;
  }

  submitting.value = true;

  try {
    const orderParams = {
      vehicleId: vehicleId.value,
      pickupStoreId: pickupStoreId.value,
      returnStoreId: returnStoreId.value,
      pickupTime: pickupTime.value,
      returnTime: returnTime.value,
      contactName: contactForm.value.contactName,
      contactPhone: contactForm.value.contactPhone,
      idCardNumber: contactForm.value.idCardNumber,
      driverLicenseNumber: contactForm.value.driverLicenseNumber,
      userRemark: contactForm.value.userRemark,
      couponId: selectedCoupon.value?.id
    };

    const result = await orderApi.createOrder(orderParams);

    uni.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 1500
    });

    // 跳转到支付页面
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/payment/index?orderId=${result.id}&orderNo=${result.orderNo}`
      });
    }, 1500);

  } catch (error) {
    console.error('提交订单失败:', error);
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// 监听页面显示（从优惠券选择页面返回时更新价格）
onShow(() => {
  // 检查是否有选中的优惠券
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];

  if (currentPage.data?.selectedCoupon) {
    selectedCoupon.value = currentPage.data.selectedCoupon;
    currentPage.data.selectedCoupon = null; // 清除临时数据

    // 重新计算价格
    if (vehicleId.value && pickupTime.value && returnTime.value) {
      loadOrderData();
    }
  }
});
</script>

<style>
.order-confirm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
}

// 头部
.header {
  background-color: #ffffff;

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    height: 88rpx;

    .nav-item {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}

// 订单内容
.order-content {
  height: calc(100vh - 160rpx);
}

// 通用卡片样式
.vehicle-card,
.rental-card,
.contact-card,
.coupon-card,
.price-card,
.notice-card {
  margin: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}

// 车辆信息卡片
.vehicle-card  { .vehicle-info { display: flex;
    padding: 32rpx;
    gap: 24rpx;

    .vehicle-image { width: 200rpx;
      height: 150rpx;
      border-radius: 12rpx;
      background-color: #f0f0f0; }.vehicle-details { flex: 1;

      .vehicle-name { display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 16rpx; }.vehicle-features { display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .feature-item { display: flex;
          align-items: center;
          gap: 6rpx;
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
          background-color: #f8f8f8;
          padding: 8rpx 12rpx;
          border-radius: 8rpx; } }
    }
  }
}

// 租赁信息卡片
.rental-card  { .rental-info { padding: 32rpx;

    .info-item { display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;

      .not(:last-child) { border-bottom: 2rpx solid #f8f8f8; }.item-label { display: flex;
        align-items: center;
        gap: 12rpx;

        .label-text { font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8); } }

      .item-value {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
}

// 联系人信息卡片
.contact-card  { .contact-form { padding: 32rpx;

    .form-item { margin-bottom: 32rpx;

      .last-child { margin-bottom: 0; }.item-label { display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .required { color: #FF4D4F;
          margin-right: 4rpx; }.label-text { font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8); } }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
        background-color: #ffffff;
        box-sizing: border-box;
      }

      .form-textarea {
        height: 120rpx;
        resize: none;
      }
    }
  }
}

// 优惠券卡片
.coupon-card  { .coupon-info { padding: 32rpx;

    .coupon-text { font-size: 28rpx;
      color: #FF9F29;
      font-weight: 500; }.coupon-placeholder { font-size: 28rpx;
      color: rgba(0, 0, 0, 0.4); } }
}

// 费用明细卡片
.price-card  { .price-details { padding: 32rpx;

    .price-item { display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;

      &.discount { .price-value { color: #67C23A; } }

      &.total  { .price-label,
        .price-value { font-size: 32rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9); } }

      .price-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
      }

      .price-value {
        font-size: 32rpx;
        color: rgba(0, 0, 0, 0.9);
        font-weight: 500;
      }
    }

    .price-divider {
      height: 2rpx;
      background-color: #f0f0f0;
      margin: 16rpx 0;
    }
  }
}

// 预订须知卡片
.notice-card  { .notice-content { padding: 32rpx;

    .notice-item { display: flex;
      align-items: flex-start;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .last-child { margin-bottom: 0; }.notice-text { flex: 1;
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.6; } }
  }
}

// 底部占位
.bottom-placeholder {
  height: 160rpx;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 144rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  z-index: 100;

  .price-info {
    display: flex;
    align-items: baseline;
    gap: 8rpx;

    .price-label {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.6);
    }

    .price-amount {
      font-size: 40rpx;
      font-weight: 600;
      color: #FF9F29;
    }
  }

  .submit-btn {
    width: 240rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(255, 159, 41, 0.3);

    &.disabled {
      background: linear-gradient(135deg, #ccc 0%, #999 100%);
      box-shadow: none;
    }

    &::after {
      border: none;
    }
  }
}
</style>